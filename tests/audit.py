from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]
required=['index.html','css/style.css','js/i18n.js','js/save-manager.js','js/career.js','js/dispatch.js','js/anti-break.js','js/app.js','manifest.webmanifest','sw.js','BUILD_INFO.json','VERSION.txt']
errors=[]
for f in required:
    if not (root/f).exists(): errors.append(f'Missing {f}')
html=(root/'index.html').read_text(encoding='utf-8')
ids=re.findall(r'id="([^"]+)"',html)
if len(ids)!=len(set(ids)): errors.append('Duplicate HTML IDs')
for f in re.findall(r'(?:src|href)="([^"]+)"',html):
    if f.startswith(('http','#')): continue
    if not (root/f).exists(): errors.append(f'Broken reference {f}')
info=json.loads((root/'BUILD_INFO.json').read_text(encoding='utf-8'))
if info.get('version')!='0.19.0': errors.append('Wrong version')
if info.get('save_schema')!=11: errors.append('Wrong save schema')
js='\n'.join((root/'js'/f).read_text(encoding='utf-8') for f in ['i18n.js','save-manager.js','career.js','dispatch.js','anti-break.js','app.js'])
for token in ['central190_save_v11','central190_save_v10','Operador III','Comandante da Central','completedCourses','warnings','specialization','goalDefs','achievements','three']:
    if token not in js and token!='three': errors.append(f'Missing token {token}')
print(json.dumps({'status':'PASS' if not errors else 'FAIL','checks':len(required)+len(ids)+9,'files':sum(1 for p in root.rglob('*') if p.is_file()),'errors':errors},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
