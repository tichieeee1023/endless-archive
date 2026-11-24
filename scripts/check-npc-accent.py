"""CSS-only check with representative markup, not a running React application."""
from pathlib import Path
import re, sys
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parents[1]
css = (root/'src/index.css').read_text()
colors = re.findall(r'color: "(#[0-9a-f]{6})"', (root/'src/data/npcs.ts').read_text())
ids = ['rael','seon','kairu']
assert len(colors)==3
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=sys.argv[1] if len(sys.argv)>1 else None,args=['--no-sandbox'])
    for width in (320,390,1024):
        page=browser.new_page(viewport={'width':width,'height':800})
        cards=''.join(f'<button class="destination npc-edge" data-npc="{i}" style="--npc-accent:{c}"><span class="destination__body"><span class="destination__tag">이어지는 인연 · 선택</span><strong>{i}</strong><small>다시 만난 사람의 이야기를 이어서 읽는다.</small></span></button><div class="encounter-intro npc-heading" data-npc="{i}" style="--npc-accent:{c}"><h2 class="story-sheet__title">다시 만난 이야기</h2></div>' for i,c in zip(ids,colors))
        page.set_content(f'<style>*,*::before,*::after{{box-sizing:border-box}}body{{margin:0}}{css}</style><div style="padding:12px">{cards}<button class="destination npc-edge" id="neutral">새로운 이야기</button></div>')
        for i,c in zip(ids,colors):
            expected='rgb('+', '.join(str(int(c[j:j+2],16)) for j in (1,3,5))+')'
            card=page.locator(f'.destination[data-npc="{i}"]'); heading=page.locator(f'.npc-heading[data-npc="{i}"]')
            assert card.evaluate('(e)=>getComputedStyle(e).borderLeftColor')==expected
            assert card.evaluate('(e)=>getComputedStyle(e).borderLeftWidth')=='3px'
            card.hover(); assert card.evaluate('(e)=>getComputedStyle(e).borderLeftColor')==expected
            assert heading.evaluate('(e)=>getComputedStyle(e).borderLeftWidth')=='2px'
            assert heading.evaluate('(e)=>getComputedStyle(e).borderLeftColor')==expected
        assert page.locator('#neutral').evaluate('(e)=>getComputedStyle(e).borderLeftWidth')=='1px'
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.close();print(f'PASS {width}px: three accents, hover, neutral, horizontal fit')
    browser.close()
