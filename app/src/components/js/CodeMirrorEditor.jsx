import React, { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { keymap } from "@codemirror/view";
import { useAtom } from "jotai";
import { useJSAtomScope } from "./atomScope.jsx";
import { MolStar } from "../../main.mjs";

export function CodeMirrorEditor({ initialCode = "" }) {
  const atomScope = useJSAtomScope();
  const [code, setCode] = useAtom(atomScope.codeAtom);
  const [molstarReady] = useAtom(atomScope.molstarReadyAtom);
  const [, executeJsCode] = useAtom(atomScope.executeJsCodeAtom);
  const [, initializeMolstar] = useAtom(atomScope.initializeMolstarAtom);
  const [initialized, setInitialized] = useState(false);

  // Initialize code and check if molstar is ready
  useEffect(() => {
    if (initialCode && !code) {
      setCode(initialCode);
    }
    
    // Initialize and check if molstar is available
    initializeMolstar().then(() => {
      setInitialized(true);
    });
  }, []);

  // Run code once molstar is confirmed ready and code is initialized
  useEffect(() => {
    if (molstarReady && code && initialized) {
      executeJsCode();
    }
  }, [molstarReady, initialized]);

  // Alt+Enter keyboard shortcut
  const codeExecutionKeymap = keymap.of([
    {
      key: "Alt-Enter",
      run: () => {
        executeJsCode();
        return true;
      },
    },
  ]);

  return (
    <div className="app-container">
      <div className="editor-container">
        <CodeMirror
          value={code}
          extensions={[javascript(), codeExecutionKeymap]}
          onChange={setCode}
        />
      </div>
      <div className="visualization-container">
        {!molstarReady && <div className="loading">Loading Molstar...</div>}
        <MolStar />
      </div>
    </div>
  );
}