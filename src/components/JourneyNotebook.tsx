import { npcAccent } from "../lib/npcAccent";
import { useEffect, useRef, useState } from "react";
import { useRun } from "../store/useRun";
import { useSaveSlots } from "../store/useSaveSlots";
import { chapterLength } from "../data/mainStory";
import { buildNotebook, type NotebookGroup } from "../lib/notebook";

type Section = "main" | "people" | "passengers";
const SECTIONS: {id:Section; label:string}[] = [
  {id:"main",label:"메인 단서"},{id:"people",label:"인물 사건"},{id:"passengers",label:"승객 이야기"},
];
function Thread({group}: {group:NotebookGroup}) {
  return <details className="notebook-thread npc-edge" {...npcAccent(group.id)}>
    <summary><span><strong>{group.title}</strong><small>{group.status}{group.note ? ` · ${group.note}` : ""}</small></span><span className="notebook-thread__count">{group.entries.length}장면</span></summary>
    <div className="notebook-thread__entries">
      {!group.entries.length && <p className="notebook-empty">이전 기록에는 구체적인 사건 내용이 남아 있지 않습니다.</p>}
      {group.entries.map(e => <details className="notebook-entry" key={e.id}>
        <summary>{e.title}{e.current && <small> · 읽는 중</small>}</summary>
        <p>{e.result ?? (e.current ? "아직 이 장면의 선택을 마치지 않았습니다." : "이 사건을 만났지만 상세한 선택 기록은 남아 있지 않습니다.")}</p>
      </details>)}
    </div>
  </details>;
}
function NotebookDialog({onClose}: {onClose:()=>void}) {
  const run = useRun();
  const [section,setSection] = useState<Section>("main");
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const view = buildNotebook(run);
  useEffect(()=>{
    const node = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (node && !node.open) node.showModal();
    close.current?.focus();
    return ()=>{if (node?.open) node.close(); trigger?.focus();};
  },[]);
  const groups = view[section];
  return <dialog ref={dialog} className="notebook-dialog" aria-labelledby="notebook-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
    <section className="notebook-sheet">
      <header className="notebook-heading"><div><span className="eyebrow">THE TRAVELLER'S NOTEBOOK</span><h2 id="notebook-title">이야기 수첩</h2><p>제 {run.act}막 · {run.floor} / {chapterLength(run.flags)} 페이지</p></div><button ref={close} type="button" className="icon-button" aria-label="수첩 닫기" onClick={onClose}>✕</button></header>
      <p className="notebook-intro">이번 여정에서 직접 만난 사람과 남긴 선택만 기록합니다. 펼쳐서 다시 읽어 보세요.</p>
      <nav className="notebook-nav" aria-label="수첩 분류">{SECTIONS.map(s=><button type="button" key={s.id} aria-pressed={section===s.id} onClick={()=>{setSection(s.id);body.current?.scrollTo({top:0});}}>{s.label} <small>{view[s.id].length}</small></button>)}</nav>
      <div className="notebook-body" ref={body} key={section}>
        {section==="main" && <section className="notebook-clues"><h3>간직한 단서 <small>{view.clues.length}</small></h3>{view.clues.length ? <ul>{view.clues.map(c=><li key={c}>{c}</li>)}</ul> : <p className="notebook-empty">아직 수첩에 남긴 주요 단서가 없습니다.</p>}</section>}
        {groups.length ? groups.map(group=><Thread group={group} key={group.id}/>) : <p className="notebook-empty">{section==="main" ? "이야기를 읽기 시작하면 기록이 남습니다." : section==="people" ? "아직 인물과의 만남이 기록되지 않았습니다." : "아직 승객들의 이야기가 기록되지 않았습니다."}</p>}
      </div>
      <footer className="notebook-footer">완료한 여정은 서고에서 다시 읽을 수 있습니다.</footer>
    </section>
  </dialog>;
}
export default function JourneyNotebookButton() {
  const [open,setOpen] = useState(false);
  const slot = useSaveSlots(s=>s.active);
  const auto = useRun(s=>s.status==="battle" && s.autoBattle);
  useEffect(()=>{setOpen(false);},[slot]);
  return <><button type="button" className="notebook-shortcut" disabled={auto} title={auto?"자동 전투를 멈춘 뒤 수첩을 열어 주세요":"이야기 수첩 열기"} onClick={()=>setOpen(true)}><span aria-hidden="true">▧</span> 수첩</button>{open && <NotebookDialog key={slot} onClose={()=>setOpen(false)}/>}</>;
}
