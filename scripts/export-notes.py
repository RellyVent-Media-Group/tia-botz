#!/usr/bin/env python3
"""Export Apple Notes to Markdown from NoteStore.sqlite.

Notes on macOS 12+ store note bodies in the group container's
NoteStore.sqlite as gzipped protobuf blobs in ZICNOTEDATA.ZDATA.
This script snapshots the DB (including the WAL) to a temp dir and
decodes each blob into readable text.

Usage:
    python3 scripts/export-notes.py [--out DIR]

Default output: ~/Desktop/notes-export/

WARNING: exported notes may contain plaintext credentials. Do not
commit the output directory to version control.
"""

import argparse
import gzip
import shutil
import sqlite3
import sys
import tempfile
from pathlib import Path

NOTES_DB = (
    Path.home()
    / "Library/Group Containers/group.com.apple.notes/NoteStore.sqlite"
)
EPOCH_OFFSET = 978307200  # Apple epoch (2001-01-01) -> Unix epoch


def snapshot_db(src: Path, dest_dir: Path) -> Path:
    """Copy db + wal + shm so we read a consistent snapshot of live data."""
    dest = dest_dir / src.name
    for suffix in ("", "-wal", "-shm"):
        part = Path(str(src) + suffix)
        if part.exists():
            shutil.copy2(part, Path(str(dest) + suffix))
    return dest


def read_varint(buf: bytes, pos: int):
    result = 0
    shift = 0
    while True:
        b = buf[pos]
        pos += 1
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            return result, pos
        shift += 7


def extract_text_strings(buf: bytes, depth: int = 0):
    """Walk protobuf wire format, collecting printable UTF-8 strings.

    Note bodies nest messages several levels deep, so length-delimited
    payloads that are not themselves text are recursed into.
    """
    out = []
    pos = 0
    n = len(buf)
    while pos < n:
        try:
            key, pos = read_varint(buf, pos)
        except IndexError:
            break
        field, wire = key >> 3, key & 7
        if wire == 0:
            _, pos = read_varint(buf, pos)
        elif wire == 1:
            pos += 8
        elif wire == 2:
            length, pos = read_varint(buf, pos)
            payload = buf[pos:pos + length]
            pos += length
            try:
                text = payload.decode("utf-8")
            except UnicodeDecodeError:
                text = None
            if text is not None:
                printable = sum(c.isprintable() or c in "\n\t" for c in text)
                if text.strip() and printable / max(len(text), 1) > 0.9:
                    out.append(text)
                    continue
            if depth < 6 and length > 2:
                out.extend(extract_text_strings(payload, depth + 1))
        elif wire == 5:
            pos += 4
        else:
            break
    return out


def decode_note(data: bytes) -> str:
    raw = gzip.decompress(data)
    # Leaf strings may themselves contain nested message bytes; collect all
    # printable strings, drop empties, and join.
    parts = [s for s in extract_text_strings(raw) if s.strip()]
    return "\n".join(parts).strip()


def apple_ts(value):
    if not value:
        return ""
    import datetime
    return datetime.datetime.utcfromtimestamp(value + EPOCH_OFFSET).strftime(
        "%Y-%m-%d %H:%M"
    )


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default=str(Path.home() / "Desktop/notes-export"))
    ap.add_argument("--db", default=str(NOTES_DB))
    args = ap.parse_args()

    src = Path(args.db).expanduser()
    if not src.exists():
        sys.exit(f"Notes database not found: {src}")

    out_dir = Path(args.out).expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        db_path = snapshot_db(src, Path(tmp))
        con = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
        con.row_factory = sqlite3.Row

        meta = {
            r["ZNOTE"]: r
            for r in con.execute(
                "SELECT Z_PK, ZNOTE, ZTITLE, ZTITLE1, ZUSERTITLE, "
                "ZMODIFICATIONDATE FROM ZICCLOUDSYNCINGOBJECT"
            )
        }

        rows = con.execute(
            "SELECT Z_PK, ZNOTE, ZDATA FROM ZICNOTEDATA ORDER BY Z_PK"
        ).fetchall()
        con.close()

    index = ["# Notes Export", ""]
    for r in rows:
        try:
            body = decode_note(r["ZDATA"])
        except Exception as e:
            print(f"warn: note data Z_PK={r['Z_PK']}: {e}", file=sys.stderr)
            continue
        if not body:
            continue

        m = meta.get(r["ZNOTE"], {})
        title = (
            (m["ZTITLE1"] if m else None)
            or (m["ZTITLE"] if m else None)
            or (m["ZUSERTITLE"] if m else None)
            or body.splitlines()[0][:80]
            or f"note-{r['Z_PK']}"
        ).strip()
        safe = "".join(c if c.isalnum() or c in "-_ " else "_" for c in title)[:80]
        fname = f"{r['Z_PK']:03d}-{safe}.md"
        date = apple_ts(m["ZMODIFICATIONDATE"] if m else None)
        (out_dir / fname).write_text(
            f"# {title}\n\n*Modified: {date}*\n\n{body}\n", encoding="utf-8"
        )
        index.append(f"- [{title}]({fname}) — {date}")

    (out_dir / "index.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    print(f"Exported {len(index) - 2} notes to {out_dir}")


if __name__ == "__main__":
    main()
