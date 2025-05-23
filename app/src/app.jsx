import React from "react";
import { CodeMirrorEditor as PythonEditor } from "./components/python/CodeMirrorEditor.jsx";
import { MolStar as MolStarComponent } from "./components/common/MolStar.jsx";
import { ImplementationProvider } from "./atomScope.jsx";

// Re-export the CodeMirrorEditor for backward compatibility
export const CodeMirrorEditor = PythonEditor;

// Re-export MolStar for backward compatibility
export const MolStar = MolStarComponent;