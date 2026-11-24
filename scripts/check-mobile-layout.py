"""Optional CSS layout smoke test (Python Playwright + Chromium).
Uses representative static markup, not a running React/Vite application.
Usage: python scripts/check-mobile-layout.py [chromium executable]
"""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
css = (ROOT / 'src/index.css').read_text()
# Minimal Tailwind 3 preflight / utility equivalents for the fixture.
reset = '''*,*::before,*::after{box-sizing:border-box;border-width:0;border-style:solid}
button,input{font:inherit;background:transparent;color:inherit;padding:0}h1,h2,h3,p,figure{margin:0}img{display:block;max-width:100%;height:auto}button{appearance:button}.justify-center{justify-content:center}.w-full{width:100%}'''
header = '''<header class="app-header"><div class="header-top"><div class="brand-mark">✳</div><div class="brand"><span>AN UNFINISHED STORY</span><strong>종점 없는 서고</strong></div><div class="header-actions"><button class="stats-shortcut">능력</button><button class="inventory-shortcut">가방 <small>5</small></button><button>▤</button><button>⚙</button></div></div><div class="header-overview"><div class="journey-line"><span>CHAPTER 03</span><span>제 12 페이지 / 12</span><span class="journey-meta"><span>레벨 10</span><span>999 G</span></span></div><div class="resource-dots"><div class="resource-meter"><span>체력</span><strong>123<small> / 150</small></strong><span class="resource-meter__track"><i style="width:80%"></i></span></div><div class="resource-meter resource-meter--focus"><span>집중력</span><strong>99<small> / 120</small></strong><span class="resource-meter__track"><i style="width:80%"></i></span></div><button class="notebook-shortcut">▧ 수첩</button></div></div></header><div class="affinity-row">''' + ''.join(f'<div class="affinity-person"><span>♥</span><span>{n}</span><span class="affinity-value">가까워진 사이</span></div>' for n in ('라엘','세온','카이루')) + '</div>'
scene = '<section class="current-page"><span class="current-page__number">03 / 12</span><span class="current-page__ornament">✳</span><h1>새벽역을 향해</h1><p>마지막 장 앞에서 두 사람의 차표를 확인한다. 아직 전하지 못한 말이 남아 있다.</p><span class="current-page__line"></span></section>'
choice = '<button class="destination"><span class="destination__icon">✧</span><span class="destination__body"><span class="destination__tag">승객의 이야기 · 선택</span><strong>다시 만난 승객</strong><small>지나온 이야기를 기억하며 다시 이 객차를 찾는다.</small></span><span class="destination__arrow">↗</span></button>'
choices = scene+'<div class="action-panel"><div class="panel-heading"><h2>다음 페이지를 고른다</h2></div>'+choice*7+'</div>'
encounter = '<div class="story-page"><div class="story-sheet encounter-sheet"><div class="story-sheet__eyebrow"><span>✦ 승객의 이야기</span></div><h2 class="story-sheet__title">이름표 없는 아이</h2><p class="story-prose">'+('열차는 마지막 장을 향해 달린다. 아직 전하지 못한 말과 만나야 할 이야기가 남아 있다. ' * 24)+'</p><div class="story-options">'+('<button class="story-button"><span class="choice-copy"><span>아이가 스스로 이름을 고르도록 도와준다.</span><span class="choice-chance">통찰 · 85%</span></span></button>'*3)+'</div></div></div>'
shop = scene+'<div class="action-panel shop-panel"><div class="panel-heading"><h2>떠돌이 상인</h2><span>999 G</span></div>'+''.join('<details class="shop-category" '+('open' if i==0 else '')+'><summary>'+label+'<small>4종</small></summary><div class="shop-category__items">'+('<button class="story-button shop-item"><span class="shop-item__content"><span class="shop-item__details">물품<span class="shop-effect">공격 피해 +3 · 골드 부족</span></span></span>40 G</button>'*6)+'</div></details>' for i,label in enumerate(('물약','장비','능력치 강화','떠돌이 부적')))+'<div class="shop-exit"><button class="story-button story-button--primary">상인을 떠난다</button></div></div>'
battle = scene+'''<div class="action-panel battle-panel"><div class="panel-heading"><div><span class="eyebrow">A DANGEROUS PAGE</span><h2>이야기의 끝 — 마지막 장</h2></div><button class="auto-toggle">자동 전투 OFF</button></div><div class="enemy-status"><div class="enemy-status__label"><strong>상대 체력</strong><span>345 / 345</span></div><div class="enemy-meter"><span style="width:100%"></span></div><div class="enemy-status__turn">3번째 행동 · 강공격 예고</div></div><div class="battle-body battle-body--ongoing"><div class="battle-log">'''+('<p>흩어진 그림자가 다시 몸을 세운다. 차가운 기운이 곁을 스친다.</p>'*15)+'</div><div class="battle-mobile-scene">'+scene+'''</div></div><div class="battle-dock"><p class="battle-dock__warning">강공격 예고 · 흘리기로 피해를 피할 수 있어요.</p><div class="battle-actions"><button class="story-button">공격 (25)</button><button class="story-button story-button--primary">집중 공격 (38 피해 · 집중력 10)</button><button class="story-button boss-brace">강공격을 흘리고 다음 공격 준비</button></div><div class="battle-potions"><button class="story-button">체력 물약 <b>5</b></button><button class="story-button">집중력 물약 <b>5</b></button></div></div></div>'''
archive = '''<div class="archive-overlay"><div class="archive-screen"><header class="archive-header"><h1>서고의 기록</h1><button class="icon-button">✕</button></header><section class="slot-switcher"><div class="slot-row"><span class="slot-label">여정</span>'''+('<div class="slot-item"><button class="slot-button">여정 1</button></div>'*3)+'''</div><p class="slot-hint">현재 슬롯을 다시 누르면 이름을 바꿀 수 있어요.</p></section><nav class="archive-nav">'''+''.join(f'<button>{t}</button>' for t in ('여정 기록','엔딩','삽화','공유·관리'))+'''</nav><div class="archive-content"><section class="art-gallery"><h2>삽화 보관함</h2><label class="art-gallery__filter"><input type="checkbox">발견한 삽화만 보기</label><div class="art-gallery__grid">'''+('<div class="art-gallery__item art-gallery__item--locked"><div class="art-gallery__unknown">◇</div><span>아직 발견하지 못한 삽화</span></div>'*36)+'''</div></section></div></div></div>'''

def html(kind, body):
    return f'<!doctype html><html lang="ko"><meta charset="utf-8"><style>{reset}\n{css}</style><body><div id="root"><div class="app-frame">{header}<main class="adventure-layout adventure-layout--{kind}">{body}</main></div></div></body></html>'

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=sys.argv[1] if len(sys.argv)>1 else None, args=['--no-sandbox'])
    for width,height in [(320,568),(360,640),(390,844),(412,915),(667,375),(1024,768)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        for kind,body,selector in [('choosing',choices,'.destination:last-child'),('rel',encounter,'.story-options button:last-child'),('shop',shop,'.shop-exit button'),('battle',battle,'.battle-potions button:last-child'),('choosing',choices+archive,'.archive-nav button:last-child')]:
            page.set_content(html(kind,body))
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width,height,kind,'horizontal overflow')
            assert page.locator('.header-top').evaluate('(e)=>e.scrollWidth <= e.clientWidth+1'), (width,height,kind,'header overflow')
            target=page.locator(selector)
            if kind=='battle' and height>520:
                box=target.bounding_box(); assert box and box['y']>=0 and box['y']+box['height']<=height+1,(width,height,kind,box)
                assert page.locator('.battle-body').bounding_box()['height']>20,(width,height,'no combat log area')
            else:
                target.scroll_into_view_if_needed()
            assert target.is_visible(),(width,height,kind,'unreachable action')
            box=target.bounding_box();assert box and box['x']>=-1 and box['x']+box['width']<=width+1 and box['y']>=-1 and box['y']+box['height']<=height+1,(width,height,kind,box)
            if width<=720 and height>520: assert box['height']>=44,(width,height,kind,'small control')
            if kind=='shop':
                page.locator('.shop-category:nth-of-type(2) > summary').click()
                assert page.locator('.shop-category:nth-of-type(2)').get_attribute('open') is not None
                assert page.locator('.shop-exit button').is_visible()
        print(f'PASS {width}×{height}: exploration, encounter, shop, battle, archive')
        page.close()
    browser.close()
