import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { CodeMirrorEditor as PythonEditor } from "./components/python/CodeMirrorEditor.jsx";
import { PythonMolViewSpecApp } from "./components/python/atomScope.jsx";
import { CodeMirrorEditor as JSEditor } from "./components/js/CodeMirrorEditor.jsx";
import { JSMolViewSpecApp } from "./components/js/atomScope.jsx";
import { AtomScopeProvider } from "./components/common/atomScopeContext.jsx";

export function appInit(container, initialState, initialCode, mode = "python") {
  if (!container) return;

  const root = createRoot(container);

  if (mode === "python") {
    root.render(
      createElement(
        PythonMolViewSpecApp,
        { initialCode: initialCode },
        createElement(PythonEditor, { initialCode: initialCode }),
      ),
    );
  } else if (mode === "js") {
    root.render(
      createElement(
        JSMolViewSpecApp,
        { initialCode: initialCode },
        createElement(JSEditor, { initialCode: initialCode }),
      ),
    );
  }
}

export default appInit;