#!/usr/bin/env python3
"""Crush CLI session analyzer.

Reads crush_*_sessions.csv / crush_*_messages.csv exports produced by
forensic/priority_extract.py and writes a per-project session summary
(JSON + Markdown + combined CSV) to the forensic reports directory.
"""

import argparse
import csv
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path


def parse_ts(value: str):
    try:
        return datetime.fromtimestamp(int(value))
    except (TypeError, ValueError):
        return None


def read_csv(path: Path) -> list:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def analyze(exports_dir: Path) -> dict:
    projects = {}
    for sessions_csv in sorted(exports_dir.glob("crush_*_sessions.csv")):
        slug = sessions_csv.name[len("crush_"):-len("_sessions.csv")]
        sessions = read_csv(sessions_csv)
        messages_csv = exports_dir / f"crush_{slug}_messages.csv"
        messages = read_csv(messages_csv)

        models = defaultdict(int)
        roles = defaultdict(int)
        for msg in messages:
            roles[msg.get("role", "")] += 1
            model = msg.get("model") or msg.get("prism_model_name") or ""
            if model:
                models[model] += 1

        total_cost = 0.0
        total_prompt = 0
        total_completion = 0
        session_rows = []
        for s in sessions:
            try:
                cost = float(s.get("cost") or 0)
            except ValueError:
                cost = 0.0
            try:
                prompt = int(s.get("prompt_tokens") or 0)
                completion = int(s.get("completion_tokens") or 0)
            except ValueError:
                prompt = completion = 0
            total_cost += cost
            total_prompt += prompt
            total_completion += completion
            created = parse_ts(s.get("created_at", ""))
            session_rows.append({
                "session_id": s.get("id", ""),
                "title": s.get("title", ""),
                "messages": s.get("message_count", ""),
                "prompt_tokens": prompt,
                "completion_tokens": completion,
                "cost": round(cost, 6),
                "created": created.isoformat(timespec="seconds") if created else "",
            })

        timestamps = [parse_ts(s.get("created_at", "")) for s in sessions]
        timestamps = [t for t in timestamps if t]
        projects[slug] = {
            "sessions": len(sessions),
            "messages": len(messages),
            "roles": dict(roles),
            "models": dict(models),
            "total_prompt_tokens": total_prompt,
            "total_completion_tokens": total_completion,
            "total_cost": round(total_cost, 6),
            "first_session": min(timestamps).isoformat(timespec="seconds") if timestamps else "",
            "last_session": max(timestamps).isoformat(timespec="seconds") if timestamps else "",
            "session_details": session_rows,
        }
    return {"generated_at": datetime.now().isoformat(timespec="seconds"), "projects": projects}


def write_markdown(result: dict, path: Path) -> None:
    lines = [
        "# Crush CLI Session Analysis",
        "",
        f"**Generated:** {result['generated_at']}",
        "",
    ]
    for slug, proj in result["projects"].items():
        lines += [
            f"## {slug}",
            "",
            f"- Sessions: {proj['sessions']}",
            f"- Messages: {proj['messages']}",
            f"- Prompt tokens: {proj['total_prompt_tokens']:,}",
            f"- Completion tokens: {proj['total_completion_tokens']:,}",
            f"- Total cost: ${proj['total_cost']:.4f}",
            f"- Models: {', '.join(f'{k} ({v})' for k, v in proj['models'].items()) or 'n/a'}",
            f"- Roles: {', '.join(f'{k} ({v})' for k, v in proj['roles'].items()) or 'n/a'}",
            f"- First session: {proj['first_session'] or 'n/a'}",
            f"- Last session: {proj['last_session'] or 'n/a'}",
            "",
            "| Session | Title | Messages | Tokens (prompt/completion) | Cost | Created |",
            "|---|---|---|---|---|---|",
        ]
        for s in proj["session_details"]:
            lines.append(
                f"| `{s['session_id'][:8]}` | {s['title']} | {s['messages']} | "
                f"{s['prompt_tokens']:,}/{s['completion_tokens']:,} | ${s['cost']:.4f} | {s['created']} |"
            )
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-path", default=str(Path.home() / "Desktop" / "Forensic_Extract"))
    parser.add_argument("--output", default=str(Path.home() / "Desktop" / "Forensic_Reports"))
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)
    base = Path(args.base_path).expanduser()
    out_dir = Path(args.output).expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)

    exports_dir = base / "exports"
    if not exports_dir.is_dir():
        print(f"⚠️  No exports dir at {exports_dir}; nothing to analyze")
        return 0

    result = analyze(exports_dir)
    if not result["projects"]:
        print("No crush session exports found; skipping.")
        return 0

    json_path = out_dir / "crush_session_summary.json"
    md_path = out_dir / "crush_session_summary.md"
    json_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    write_markdown(result, md_path)

    print("✅ Crush session analysis complete!")
    for slug, proj in result["projects"].items():
        print(
            f"  {slug}: {proj['sessions']} sessions, {proj['messages']} messages, "
            f"{proj['total_prompt_tokens'] + proj['total_completion_tokens']:,} tokens, "
            f"${proj['total_cost']:.4f}"
        )
    print(f"📁 Reports: {json_path}, {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
