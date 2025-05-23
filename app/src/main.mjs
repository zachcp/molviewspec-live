// main.mjs
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { CodeMirrorEditor } from "./app.jsx";
import { MolViewSpecApp } from "./atomScope.jsx";

export function appInit(container, initialState, initialCode) {
  if (!container) return;

  const root = createRoot(container);

  // Replace JSX with createElement calls
  root.render(
    createElement(
      MolViewSpecApp,
      { initialCode: initialCode },
      createElement(
        "div",
        { className: "app-container" },
        createElement(CodeMirrorEditor, { initialCode: initialCode }),
      ),
    ),
  );
}

// Make sure both named and default exports are available
export default appInit;
