"""Run python update_works.py after editing works.json."""
from pathlib import Path
import html
import json
import re

root = Path(__file__).resolve().parent
works = json.loads((root / 'works.json').read_text(encoding='utf-8'))
rows = []
for work in sorted(works, key=lambda w: int(w['year']), reverse=True):
    title = html.escape(work['title'])
    url = work.get('url', '')
    if url and not url.startswith(('https://', 'http://')):
        raise ValueError('Publisher links must start with https:// or http://')
    heading = f'<a href="{html.escape(url, quote=True)}">{title} ↗</a>' if url else title
    credit = f'<div class="meta">{html.escape(work["publication"])}</div>'
    if work.get('stanzas'):
        poem = ''.join('<p>' + '<br>'.join(html.escape(line) for line in stanza) + '</p>' for stanza in work['stanzas'])
        content = credit + f'<details class="published-poem"><summary>{title}</summary><div class="poem-text">{poem}</div></details>'
    else:
        content = f'<h3>{heading}</h3>' + credit
    rows.append(f'<article class="row"><div class="meta">{int(work["year"])}</div><div>{content}</div></article>')
path = root / 'works.html'
source = path.read_text(encoding='utf-8')
source, count = re.subn(r'(<section class="section" aria-label="Published poems">).*?(</section>)', lambda m: m[1] + ''.join(rows) + m[2], source, count=1, flags=re.S)
if count != 1:
    raise ValueError('Published poems section not found')
path.write_text(source, encoding='utf-8')
print(f'Updated {len(rows)} publication entries.')
