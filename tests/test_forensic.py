#!/usr/bin/env python3
"""Tests for the forensic extraction and analysis toolkit.

Runs under pytest or stdlib unittest:
    python3 -m unittest discover -s tests -v
    pytest tests/ -v
"""

import csv
import json
import os
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "forensic"))

import crush_forensics  # noqa: E402
import priority_extract  # noqa: E402
import whatsapp_forensics  # noqa: E402


def make_sqlite(path: Path, statements):
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    try:
        for statement in statements:
            conn.execute(statement)
        conn.commit()
    finally:
        conn.close()


class TestPriorityExtractHelpers(unittest.TestCase):
    def test_cell_text(self):
        self.assertEqual(priority_extract.cell_text(None), "")
        self.assertEqual(priority_extract.cell_text(b"hi"), "hi")
        self.assertEqual(priority_extract.cell_text(42), "42")
        self.assertEqual(priority_extract.cell_text("x".encode("utf-16")), "x".encode("utf-16").hex())

    def test_snapshot_sqlite_roundtrip(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "src.db"
            make_sqlite(src, [
                "CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT)",
                "INSERT INTO t (name) VALUES ('alpha')",
            ])
            dst = Path(tmp) / "snap" / "src.db"
            record = priority_extract.snapshot_sqlite(src, dst)
            self.assertEqual(record["status"], "copied")
            conn = sqlite3.connect(str(dst))
            try:
                rows = conn.execute("SELECT name FROM t").fetchall()
            finally:
                conn.close()
            self.assertEqual(rows, [("alpha",)])
            self.assertEqual(record["method"], "sqlite_backup")

    def test_export_query_writes_csv(self):
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "db.sqlite"
            out = Path(tmp) / "out.csv"
            make_sqlite(db, [
                "CREATE TABLE t (a TEXT, b INTEGER)",
                "INSERT INTO t VALUES ('x', 1)",
            ])
            rows = priority_extract.export_query(db, out, "SELECT * FROM t")
            self.assertEqual(rows, 1)
            with out.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(list(csv.reader(handle)), [["a", "b"], ["x", "1"]])

    def test_find_crush_state_dirs(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            crush = home / "Desktop" / "proj" / ".crush"
            crush.mkdir(parents=True)
            (crush / "crush.db").write_bytes(b"")
            (home / "Desktop" / "empty" / ".crush").mkdir(parents=True)
            cwd = os.getcwd()
            os.chdir(tmp)
            try:
                found = priority_extract.find_crush_state_dirs(home)
            finally:
                os.chdir(cwd)
            self.assertEqual([p.name for p in found], [".crush"])
            self.assertTrue(found[0].joinpath("crush.db").exists())

    def test_database_specs_include_crush(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            crush = home / "Desktop" / "proj" / ".crush"
            crush.mkdir(parents=True)
            (crush / "crush.db").write_bytes(b"")
            (crush / "logs").mkdir()
            (crush / "logs" / "crush.log").write_text("log\n")
            cwd = os.getcwd()
            os.chdir(tmp)
            try:
                specs = priority_extract.database_specs(home, include_sensitive=False)
            finally:
                os.chdir(cwd)
            keys = [s["key"] for s in specs]
            self.assertIn("crush_db_proj", keys)
            self.assertIn("crush_log_proj", keys)
            self.assertFalse(any(s.get("sensitive") for s in specs))


class TestCrushForensics(unittest.TestCase):
    def test_analyze_aggregates_sessions_and_messages(self):
        with tempfile.TemporaryDirectory() as tmp:
            exports = Path(tmp)
            with (exports / "crush_demo_sessions.csv").open("w", newline="") as h:
                w = csv.writer(h)
                w.writerow(["id", "title", "message_count", "prompt_tokens",
                            "completion_tokens", "cost", "created_at"])
                w.writerow(["s1", "Session One", "2", "100", "50", "0.5", "1700000000"])
                w.writerow(["s2", "Session Two", "1", "10", "5", "0.25", "1700001000"])
            with (exports / "crush_demo_messages.csv").open("w", newline="") as h:
                w = csv.writer(h)
                w.writerow(["id", "session_id", "role", "model"])
                w.writerow(["m1", "s1", "user", "qwen3.8-max"])
                w.writerow(["m2", "s1", "assistant", "qwen3.8-max"])
                w.writerow(["m3", "s2", "user", ""])

            result = crush_forensics.analyze(exports)
            proj = result["projects"]["demo"]
            self.assertEqual(proj["sessions"], 2)
            self.assertEqual(proj["messages"], 3)
            self.assertEqual(proj["total_prompt_tokens"], 110)
            self.assertEqual(proj["total_completion_tokens"], 55)
            self.assertAlmostEqual(proj["total_cost"], 0.75)
            self.assertEqual(proj["models"], {"qwen3.8-max": 2})
            self.assertEqual(proj["roles"], {"user": 2, "assistant": 1})

    def test_analyze_empty_dir(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(crush_forensics.analyze(Path(tmp))["projects"], {})


class TestWhatsAppForensics(unittest.TestCase):
    def _make_chatstorage(self, path: Path):
        make_sqlite(path, [
            "CREATE TABLE ZWAMESSAGE (Z_PK INTEGER PRIMARY KEY, ZMESSAGEDATE REAL, "
            "ZCHATSESSION INTEGER, ZTEXT TEXT, ZISFROMME INTEGER, ZMESSAGETYPE INTEGER, "
            "ZMESSAGESTATUS INTEGER, ZSTANZAID TEXT, ZMEDIAITEM INTEGER, ZTOJID TEXT, ZFROMJID TEXT)",
            "CREATE TABLE ZWACHATSESSION (Z_PK INTEGER PRIMARY KEY, ZPARTNERNAME TEXT, "
            "ZCONTACTJID TEXT, ZLASTMESSAGETEXT TEXT, ZLASTMESSAGEDATE REAL, "
            "ZMESSAGECOUNTER INTEGER, ZUNREADCOUNT INTEGER, ZSESSIONTYPE INTEGER, "
            "ZARCHIVED INTEGER, ZHIDDEN INTEGER, ZREMOVED INTEGER)",
            "CREATE TABLE ZWAMEDIAITEM (Z_PK INTEGER PRIMARY KEY, ZMESSAGE INTEGER, "
            "ZTITLE TEXT, ZMEDIALOCALPATH TEXT, ZMEDIAURL TEXT, ZFILESIZE INTEGER, "
            "ZMEDIAURLDATE REAL, ZTHUMBNAILLOCALPATH TEXT, ZVCARDNAME TEXT, ZVCARDSTRING TEXT)",
            "INSERT INTO ZWACHATSESSION (Z_PK, ZPARTNERNAME, ZCONTACTJID) "
            "VALUES (1, 'Alice', '15551234567@s.whatsapp.net')",
            "INSERT INTO ZWAMESSAGE (Z_PK, ZMESSAGEDATE, ZCHATSESSION, ZTEXT, ZISFROMME) "
            "VALUES (1, 700000000, 1, 'hello there', 0)",
        ])

    def test_search_whatsapp_db_finds_messages_and_phones(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            extract = tmp_path / "extract"
            db = extract / "databases" / "whatsapp" / "ChatStorage.sqlite"
            self._make_chatstorage(db)
            out = tmp_path / "reports"

            analyzer = whatsapp_forensics.WhatsAppForensics(
                base_path=str(extract),
                output_path=str(out),
                chat_db=str(tmp_path / "no-chat.db"),
                whatsapp_db=str(db),
            )
            df = analyzer.search_whatsapp_db()
            self.assertEqual(len(df), 1)
            self.assertIn("+15551234567", analyzer.results["phone_numbers"])

    def test_extract_indicators_domains(self):
        analyzer = whatsapp_forensics.WhatsAppForensics(
            base_path="/nonexistent",
            output_path=tempfile.mkdtemp(),
            chat_db="/nonexistent",
            whatsapp_db="/nonexistent",
        )
        import pandas as pd
        df = pd.DataFrame([{"text": "chat 15551234567@s.whatsapp.net see whatsapp.net"}])
        analyzer._extract_indicators(df)
        self.assertIn("+15551234567", analyzer.results["phone_numbers"])
        self.assertIn("whatsapp.net", analyzer.results["domains_found"])


if __name__ == "__main__":
    unittest.main()
