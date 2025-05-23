import React from "react";
import { CodeMirrorEditor as PythonEditor } from "./components/python/CodeMirrorEditor.jsx";
import { MolStar as MolStarComponent } from "./components/common/MolStar.jsx";
import { usePythonAtomScope } from "./components/python/atomScope.jsx";

// Re-export the CodeMirrorEditor for backward compatibility
export const CodeMirrorEditor = PythonEditor;

// Re-export MolStar with the proper atomScope for backward compatibility
export function MolStar() {
  const atomScope = usePythonAtomScope();
  return <MolStarComponent atomScope={atomScope} />;
}