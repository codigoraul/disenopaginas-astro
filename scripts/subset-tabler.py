import re,os,sys,subprocess,glob
root=sys.argv[1]
css=open(f'{root}/public/assets/css/tabler-icons.min.css',encoding='utf-8').read()
rules=dict(re.findall(r'\.ti-([a-z0-9-]+):before\{content:"\\([0-9a-f]+)"\}',css))
print('icons in css',len(rules))
used=set()
for d in ['src','public','dist']:  # dist captura íconos que vienen de datos (WP, json)
  for p in glob.glob(f'{root}/{d}/**/*',recursive=True):
    if not os.path.isfile(p) or 'tabler-icons' in p or 'node_modules' in p or p.endswith('.css') and '/dist/' in p: continue
    if not p.endswith(('.astro','.html','.js','.ts','.json','.md','.mdx','.php','.css')): continue
    t=open(p,encoding='utf-8',errors='ignore').read()
    used|=set(re.findall(r'ti-([a-z0-9-]+)',t))
    # valores dinámicos: icon: 'x' / icon="x"
    used|=set(re.findall(r'icon\s*[:=]\s*[\'"`]([a-z0-9-]+)[\'"`]',t))
keep=sorted(n for n in used if n in rules)
print('kept',len(keep))
uni=','.join('U+'+rules[n] for n in keep)
out=f'{root}/public/assets/css/fonts/tabler-icons-sub.woff2'
subprocess.run(['pyftsubset',f'{root}/public/assets/css/fonts/tabler-icons.ttf',f'--unicodes={uni}','--flavor=woff2',f'--output-file={out}','--no-hinting','--desubroutinize'],check=True)
print('font KB',os.path.getsize(out)//1024)
base=re.search(r'\.ti\{[^}]*\}',css).group(0)
body='\n'.join(f'.ti-{n}:before{{content:"\\{rules[n]}"}}' for n in keep)
open(f'{root}/public/assets/css/tabler-icons-sub.css','w').write('/* Tabler Icons 3.31.0 (MIT) — subset generado con scripts/subset-tabler.py. Si usas un ícono nuevo, vuelve a correr el script. */\n'+base+'\n'+body+'\n')
print(keep)
