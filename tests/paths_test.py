from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
files = [root/'index.html', root/'css/style.css', root/'css/premium-v010.css', root/'js/app.js', root/'js/data/content.js', root/'sw.js', root/'manifest.webmanifest']
patterns = [
    re.compile(r"(?:src|href)=['\"]([^'\"#?]+)"),
    re.compile(r"url\(['\"]?([^)'\"?#]+)"),
    re.compile(r"['\"](assets/[^'\"]+)['\"]")
]
missing = []
for file in files:
    text = file.read_text(encoding='utf-8')
    for pattern in patterns:
        for match in pattern.findall(text):
            if '${' in match or match.startswith(('http:', 'https:', 'data:', 'blob:')):
                continue
            candidate = (file.parent / match).resolve() if match.startswith('.') else (root / match).resolve()
            if not candidate.exists():
                missing.append(f'{file.relative_to(root)} -> {match}')
if missing:
    raise SystemExit('Caminhos ausentes:\n' + '\n'.join(sorted(set(missing))))
print('PASS paths: referências locais encontradas.')
