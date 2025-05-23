import React, { useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { useAtom } from "jotai";
import { usePythonAtomScope } from "./atomScope.jsx";
import { MolStar } from "../../main.mjs";

export function CodeMirrorEditor({ initialCode = "" }) {
  const atomScope = usePythonAtomScope();
  const [code, setCode] = useAtom(atomScope.codeAtom);
  const [pyodideReady] = useAtom(atomScope.pyodideReadyAtom);
  const [, executePyCode] = useAtom(atomScope.executePyCodeAtom);
  const [, initPyodide] = useAtom(atomScope.initializePyodideAtom);

  // Initialize code and Pyodide
  useEffect(() => {
    if (initialCode && !code) {
      setCode(initialCode);
    }
    initPyodide();
  }, []);

  // Run code once Pyodide is loaded
  useEffect(() => {
    if (pyodideReady && code) {
      executePyCode();
    }
  }, [pyodideReady]);

  // Alt+Enter keyboard shortcut
  const codeExecutionKeymap = keymap.of([
    {
      key: "Alt-Enter",
      run: () => {
        executePyCode();
        return true;
      },
    },
  ]);

  return (
    <div className="app-container">
      <div className="editor-container">
        <CodeMirror
          value={code}
          extensions={[python(), codeExecutionKeymap]}
          onChange={setCode}
        />
      </div>
      <div className="visualization-container">
        <MolStar />
      </div>
    </div>
  );
}