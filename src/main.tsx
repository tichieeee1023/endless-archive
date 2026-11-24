import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

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