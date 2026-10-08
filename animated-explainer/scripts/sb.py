#!/usr/bin/env python3
"""Edit storyboard.json beats by id (safer than list-index edits).

usage:
  sb.py <project> list
  sb.py <project> insert --after <beat_id> --id <new_id> --narration "..." --visual "..."
  sb.py <project> set <beat_id> [--narration "..."] [--visual "..."]
  sb.py <project> delete <beat_id>
Changed or new beats are the only ones tts.py re-bills.
"""
import argparse
import json
import sys
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("cmd", choices=["list", "insert", "set", "delete"])
    ap.add_argument("beat", nargs="?")
    ap.add_argument("--after")
    ap.add_argument("--id")
    ap.add_argument("--narration")
    ap.add_argument("--visual")
    a = ap.parse_args()
    path = Path(a.project) / "storyboard.json"
    sb = json.loads(path.read_text())
    where = {b["id"]: (act, i) for act in sb["acts"] for i, b in enumerate(act["beats"])}

    if a.cmd == "list":
        words = 0
        for act in sb["acts"]:
            print(f"[{act['id']}]")
            for b in act["beats"]:
                words += len(b["narration"].split())
                print(f"  {b['id']:<14} {b['narration']}")
        print(f"{words} words")
        return
    if a.cmd == "insert":
        if not (a.after and a.id and a.narration and a.visual):
            sys.exit("insert needs --after, --id, --narration and --visual")
        if a.id in where:
            sys.exit(f"beat id {a.id} already exists")
        act, i = where.get(a.after) or sys.exit(f"no beat {a.after}")
        act["beats"].insert(i + 1, {"id": a.id, "narration": a.narration, "visual": a.visual})
    elif a.cmd == "set":
        act, i = where.get(a.beat) or sys.exit(f"no beat {a.beat}")
        if a.narration:
            act["beats"][i]["narration"] = a.narration
        if a.visual:
            act["beats"][i]["visual"] = a.visual
    elif a.cmd == "delete":
        act, i = where.get(a.beat) or sys.exit(f"no beat {a.beat}")
        act["beats"].pop(i)
    path.write_text(json.dumps(sb, indent=2))
    print(f"{a.cmd} ok")


if __name__ == "__main__":
    main()
