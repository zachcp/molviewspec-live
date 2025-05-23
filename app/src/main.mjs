import { createElement } from "react";
import { createRoot } from "react-dom/client";

// Import all necessary components directly
import { PythonMolViewSpecApp } from "./components/python/atomScope.jsx";
import { JSMolViewSpecApp } from "./components/js/atomScope.jsx";
import { CodeMirrorEditor as PythonEditor } from "./components/python/CodeMirrorEditor.jsx";
import { CodeMirrorEditor as JSEditor } from "./components/js/CodeMirrorEditor.jsx";
import { MolStar } from "./components/common/MolStar.jsx";

// Create a React context in a separate file to avoid JSX in .mjs
import React from "react";
const ImplementationContext = React.createContext("python"); // Default to python

// Implementation Provider component to specify which implementation to use
export const ImplementationProvider = function(props) {
  const implementation = props.implementation || "python";
  const children = props.children;
  
  return createElement(
    ImplementationContext.Provider,
    { value: implementation },
    children
  );
};

// Import the atomScope hooks directly
import { useJSAtomScope } from "./components/js/atomScope.jsx";
import { usePythonAtomScope } from "./components/python/atomScope.jsx";

// Export the hook to access the current atom scope
export function useAtomScope() {
  const implementation = React.useContext(ImplementationContext);
  
  // Determine which implementation to use
  if (implementation === "js") {
    return useJSAtomScope();
  } else {
    // Default to Python
    return usePythonAtomScope();
  }
}

// Re-export common components for backward compatibility
export { PythonEditor as CodeMirrorEditor };
export { MolStar };
export { PythonMolViewSpecApp as MolViewSpecApp };

// Main application initialization function
export function appInit(container, initialState, initialCode, mode = "python") {
  if (!container) return;

  const root = createRoot(container);

  if (mode === "python") {
    root.render(
      createElement(
        ImplementationProvider,
        { implementation: "python" },
        createElement(
          PythonMolViewSpecApp,
          { initialCode: initialCode },
          createElement(PythonEditor, { initialCode: initialCode }),
        ),
      ),
    );
  } else if (mode === "js") {
    root.render(
      createElement(
        ImplementationProvider,
        { implementation: "js" },
        createElement(
          JSMolViewSpecApp,
          { initialCode: initialCode },
          createElement(JSEditor, { initialCode: initialCode }),
        ),
      ),
    );
  }
}

export default appInit;