#!/usr/bin/env python3
"""Bundle the common renderer into each independently installable mockup skill."""
import argparse
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / "desktop-mockup"
target = root / "mobile-mockup"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--check", action="store_true")
args = parser.parse_args()
files = ["scripts/capture.cjs", "assets/frames.cjs", "tests/capture.test.cjs",
         "references/setup.md", "references/hosted.md", ".gitignore"]
expected = {name: (source / name).read_bytes() for name in files}
package = json.loads((source / "package.json").read_text())
package.update(name="@pesty-skills/mobile-mockup", mockupDevice="mobile",
               description="Website screenshots in a presentation-ready iPhone frame")
expected["package.json"] = (json.dumps(package, indent=2) + "\n").encode()
lock = json.loads((source / "package-lock.json").read_text())
lock["name"] = package["name"]
lock["packages"][""]["name"] = package["name"]
expected["package-lock.json"] = (json.dumps(lock, indent=2) + "\n").encode()
stale = []
for name, content in expected.items():
    dest = target / name
    if args.check:
        if not dest.is_file() or dest.read_bytes() != content:
            stale.append(name)
    else:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
if stale:
    raise SystemExit("Mobile bundle is stale: " + ", ".join(stale) +
                     ". Run python3 scripts/sync-mockup-skills.py")
print("Mockup bundles match." if args.check else "Updated standalone mobile bundle.")
