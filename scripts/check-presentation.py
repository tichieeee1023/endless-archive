"""CSS-only Chromium smoke test, not React E2E. Requires Python Playwright."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
css=(Path(__file__).resolve().parents[1]/'src/index.css').read_text()
fixture='''<!doctype html><html><style>*,*::before,*::after{box-sizing:border-box}'''+css+'''</style><body><div class="story-page"><div class="encounter-intro"><h2>인물 등장</h2></div><p class="story-prose story-prose--reveal">한 페이지의 이야기</p><button class="story-button" onclick="this.dataset.clicked='yes'">계속 읽기</button></div><div class="battle-panel--boss"><div class="panel-heading"><h2>보스 등장</h2></div></div><div class="opening-roll is-revealed"><span class="opening-roll__result">성공</span></div><main class="ending-screen"><h1>여정의 결말</h1><div class="ending-rule">✦</div><p class="ending-main-copy">마지막 문장</p></main></body></html>'''
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=sys.argv[1] if len(sys.argv)>1 else None,args=['--no-sandbox'])
    for mode,reduced in [('full','no-preference'),('quick','no-preference'),('full','reduce'),('quick','reduce')]:
        page=browser.new_page(viewport={'width':390,'height':844},reduced_motion=reduced)
        page.set_content(fixture.replace('<html>',f'<html data-motion="{mode}">'))
        for selector in ['.encounter-intro','.story-prose--reveal','.battle-panel--boss h2','.ending-screen h1','.ending-rule','.ending-main-copy','.opening-roll__result']:
            value=page.locator(selector).evaluate('(e)=>getComputedStyle(e).animationName')
            assert (value!='none')==(mode=='full' and reduced=='no-preference'),(mode,reduced,selector,value)
        assert page.locator('button').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
        page.locator('button').click(timeout=1000)
        assert page.locator('button').get_attribute('data-clicked')=='yes'
        print('PASS',mode,reduced,'7 reveal targets and immediately clickable control')
        page.close()
    browser.close()
