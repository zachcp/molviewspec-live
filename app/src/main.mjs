import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { CodeMirrorEditor } from "./app.jsx";
import { MolViewSpecApp } from "./atomScope.jsx";

export function appInit(container, initialState, initialCode) {
  if (!container) return;

  const root = createRoot(container);

  // Simplified render - removed the extra div
  root.render(
    createElement(
      MolViewSpecApp,
      { initialCode: initialCode },
      createElement(CodeMirrorEditor, { initialCode: initialCode }),
    ),
  );
}

export default appInit;
