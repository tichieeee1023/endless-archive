import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// 기존 단일 세이브 이관 (v1 → 슬롯1)
(function migrateOldSave() {
  const oldKey = "endless-archive-run";
  const newKey = "endless-archive-run_slot1";
  if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
    localStorage.setItem(newKey, localStorage.getItem(oldKey)!);
    localStorage.removeItem(oldKey);
  }
})();

registerSW({
  onNeedRefresh() {
    if (confirm("새 버전이 있습니다. 지금 새로고침할까요?")) location.reload();
  },
  onOfflineReady() {
    console.log("[PWA] 오프라인 사용 가능");
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);