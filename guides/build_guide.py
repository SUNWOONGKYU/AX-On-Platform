import os, re, glob

src_dir = "G:/내 드라이브/333_자료공유폴더/AX-On_Platform/guides/_src_md"
out_path = "G:/내 드라이브/333_자료공유폴더/AX-On_Platform/guides/fullstack-guide.html"

files = sorted(glob.glob(f"{src_dir}/*.md"))

def fmt(t):
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'\*(.+?)\*', r'<em>\1</em>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    t = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2" target="_blank">\1</a>', t)
    return t

def md_to_html(text):
    lines = text.split('\n')
    html = []
    in_ul = False
    in_table = False
    i = 0
    while i < len(lines):
        line = lines[i]
        # Table
        if line.strip().startswith('|'):
            if not in_table:
                if in_ul: html.append('</ul>'); in_ul = False
                html.append('<div class="table-wrap"><table>')
                in_table = True
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if i+1 < len(lines) and re.match(r'^[\|\-\s:]+$', lines[i+1].strip()):
                html.append('<thead><tr>' + ''.join(f'<th>{c}</th>' for c in cells) + '</tr></thead><tbody>')
                i += 2
                continue
            else:
                html.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
            i += 1
            continue
        else:
            if in_table:
                html.append('</tbody></table></div>')
                in_table = False

        stripped = line.strip()
        if stripped.startswith('#### '):
            if in_ul: html.append('</ul>'); in_ul = False
            html.append(f'<h4>{fmt(stripped[5:])}</h4>')
        elif stripped.startswith('### '):
            if in_ul: html.append('</ul>'); in_ul = False
            html.append(f'<h3>{fmt(stripped[4:])}</h3>')
        elif stripped.startswith('## '):
            if in_ul: html.append('</ul>'); in_ul = False
            html.append(f'<h2>{fmt(stripped[3:])}</h2>')
        elif stripped.startswith('# '):
            if in_ul: html.append('</ul>'); in_ul = False
            html.append(f'<h1>{fmt(stripped[2:])}</h1>')
        elif stripped == '---' or stripped == '***':
            if in_ul: html.append('</ul>'); in_ul = False
            html.append('<hr>')
        elif re.match(r'^[-*] ', stripped):
            if not in_ul: html.append('<ul>'); in_ul = True
            html.append(f'<li>{fmt(stripped[2:])}</li>')
        elif re.match(r'^\d+\. ', stripped):
            if in_ul: html.append('</ul>'); in_ul = False
            html.append(f'<li>{fmt(re.sub(r"^\d+\. ", "", stripped))}</li>')
        elif stripped == '':
            if in_ul: html.append('</ul>'); in_ul = False
        else:
            if in_ul: html.append('</ul>'); in_ul = False
            html.append(f'<p>{fmt(stripped)}</p>')
        i += 1

    if in_ul: html.append('</ul>')
    if in_table: html.append('</tbody></table></div>')
    return '\n'.join(html)

chapters = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    m = re.search(r'^#\s+(.+)', content, re.MULTILINE)
    title = m.group(1).strip() if m else os.path.basename(f).replace('.md','')
    chapters.append({'title': title, 'content': md_to_html(content)})

toc_html = '\n'.join(
    f'<a href="#chap-{idx+1:02d}" class="toc-link">{ch["title"]}</a>'
    for idx, ch in enumerate(chapters)
)

sections_html = '\n'.join(
    f'<section id="chap-{idx+1:02d}" class="chapter">'
    f'<div class="chap-header"><span class="chap-num">{idx+1:02d}</span>'
    f'<span class="chap-title">{ch["title"]}</span></div>'
    f'{ch["content"]}</section>'
    for idx, ch in enumerate(chapters)
)

html = '''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>풀스택 웹사이트 개발 기초지식</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0f172a;--bg2:#1e293b;--bg3:#334155;--text:#e2e8f0;--muted:#94a3b8;--accent:#34d399;--border:rgba(148,163,184,0.12);--header-h:60px;--sidebar-w:268px}
html.light{--bg:#f8fafc;--bg2:#ffffff;--bg3:#e2e8f0;--text:#1e293b;--muted:#64748b;--accent:#16a34a;--border:rgba(0,0,0,0.08)}
html{scroll-behavior:smooth;scroll-padding-top:70px}
body{font-family:system-ui,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;background:var(--bg);color:var(--text);line-height:1.8}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.header{position:fixed;top:0;left:0;right:0;height:var(--header-h);background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:12px;z-index:200}
.header-title{font-size:0.95rem;font-weight:800;color:var(--accent);flex:1}
.header-sub{font-size:0.65rem;color:var(--muted);font-weight:400}
.theme-btn{background:var(--bg3);border:none;color:var(--text);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem}
.menu-btn{display:none;background:var(--bg3);border:none;color:var(--text);padding:5px 10px;border-radius:6px;cursor:pointer;font-size:1rem}
.progress-bar{position:fixed;top:var(--header-h);left:0;height:3px;background:var(--accent);width:0%;z-index:300;transition:width 0.1s}
.sidebar{position:fixed;top:var(--header-h);left:0;bottom:0;width:var(--sidebar-w);background:var(--bg2);border-right:1px solid var(--border);overflow-y:auto;padding:12px 0;z-index:100;scrollbar-width:thin;scrollbar-color:var(--bg3) transparent}
.toc-link{display:block;padding:5px 14px;font-size:0.76rem;color:var(--muted);transition:all 0.15s;border-left:2px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.toc-link:hover{color:var(--text);background:rgba(52,211,153,0.05);text-decoration:none}
.toc-link.active{color:var(--accent);border-left-color:var(--accent);background:rgba(52,211,153,0.08)}
.main{margin-left:var(--sidebar-w);padding-top:calc(var(--header-h) + 24px);padding-bottom:80px}
.chapter{padding:40px 48px 24px;border-bottom:1px solid var(--border);max-width:860px}
.chap-header{display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-bottom:14px;border-bottom:2px solid var(--accent)}
.chap-num{font-size:1.4rem;font-weight:900;color:var(--accent);font-family:monospace;min-width:32px}
.chap-title{font-size:1.15rem;font-weight:700}
h1{font-size:1.3rem;font-weight:800;margin:28px 0 12px}
h2{font-size:1.1rem;font-weight:700;margin:22px 0 10px}
h3{font-size:0.98rem;font-weight:600;margin:16px 0 8px}
h4{font-size:0.9rem;font-weight:600;margin:12px 0 6px;color:var(--muted)}
p{margin:8px 0;font-size:0.91rem}
ul{margin:8px 0 8px 20px}
li{margin:4px 0;font-size:0.91rem}
hr{border:none;border-top:1px solid var(--border);margin:20px 0}
code{background:var(--bg3);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.85em}
strong{font-weight:700}
.table-wrap{overflow-x:auto;margin:12px 0}
table{border-collapse:collapse;width:100%;font-size:0.87rem}
th{background:var(--bg3);padding:8px 12px;text-align:left;font-weight:600;border:1px solid var(--border)}
td{padding:7px 12px;border:1px solid var(--border)}
tr:hover td{background:rgba(52,211,153,0.03)}
@media(max-width:768px){
  .sidebar{display:none}.sidebar.open{display:block;width:80%;box-shadow:4px 0 20px rgba(0,0,0,0.3)}
  .main{margin-left:0;padding:calc(var(--header-h) + 12px) 0 40px}
  .chapter{padding:24px 16px 16px}
  .menu-btn{display:block}
}
</style>
</head>
<body>
<div class="progress-bar" id="progressBar"></div>
<header class="header">
  <button class="menu-btn" id="menuBtn">&#9776;</button>
  <div class="header-title">&#128217; 풀스택 웹사이트 개발 기초지식 <span class="header-sub">— 2권</span></div>
  <button class="theme-btn" id="themeBtn">라이트</button>
</header>
<nav class="sidebar" id="sidebar">
''' + toc_html + '''
</nav>
<main class="main">
''' + sections_html + '''
</main>
<script>
const themeBtn=document.getElementById('themeBtn');
themeBtn.addEventListener('click',function(){
  var isLight=document.documentElement.classList.toggle('light');
  themeBtn.textContent=isLight?'다크':'라이트';
  localStorage.setItem('fs-theme',isLight?'light':'dark');
});
if(localStorage.getItem('fs-theme')==='light'){document.documentElement.classList.add('light');themeBtn.textContent='다크';}
document.getElementById('menuBtn').addEventListener('click',function(){
  document.getElementById('sidebar').classList.toggle('open');
});
window.addEventListener('scroll',function(){
  var doc=document.documentElement;
  var pct=(doc.scrollTop/(doc.scrollHeight-doc.clientHeight))*100;
  document.getElementById('progressBar').style.width=pct+'%';
});
var obs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      document.querySelectorAll('.toc-link').forEach(function(a){a.classList.remove('active');});
      var link=document.querySelector('.toc-link[href="#'+e.target.id+'"]');
      if(link){link.classList.add('active');link.scrollIntoView({block:'nearest'});}
    }
  });
},{threshold:0.1,rootMargin:'-60px 0px -60% 0px'});
document.querySelectorAll('.chapter').forEach(function(s){obs.observe(s);});
document.querySelectorAll('.toc-link').forEach(function(a){
  a.addEventListener('click',function(){
    if(window.innerWidth<=768) document.getElementById('sidebar').classList.remove('open');
  });
});
</script>
</body>
</html>'''

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

size = os.path.getsize(out_path)
print(f"완료! {size:,} bytes, {len(chapters)}개 챕터")
