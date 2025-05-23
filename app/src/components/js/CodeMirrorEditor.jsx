import React, { useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { keymap } from "@codemirror/view";
import { useAtom } from "jotai";
import { useJSAtomScope } from "./atomScope.jsx";
import { MolStar } from "../common/MolStar.jsx";

export function CodeMirrorEditor({ initialCode = "" }) {
  const atomScope = useJSAtomScope();
  const [code, setCode] = useAtom(atomScope.codeAtom);
  const [, executeJsCode] = useAtom(atomScope.executeJsCodeAtom);

  // Initialize code
  useEffect(() => {
    if (initialCode && !code) {
      setCode(initialCode);
    }
    // Initial code execution
    if (code) {
      executeJsCode();
    }
  }, []);

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
        <MolStar atomScope={atomScope} />
      </div>
    </div>
  );
}