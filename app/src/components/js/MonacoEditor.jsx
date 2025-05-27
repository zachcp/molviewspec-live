import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useAtom } from "jotai";
import { useJSAtomScope } from "./atomScope.jsx";
import { MolStar } from "../../main.mjs";

export function MonacoEditor({ initialCode = "" }) {
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
  }, [molstarReady, initialized, executeJsCode]);

  // Handle editor change
  function handleEditorChange(value) {
    setCode(value || "");
  }

  // Handle editor mount
  function handleEditorDidMount(editor, monaco) {
    // Add Alt+Enter keyboard shortcut
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.Enter, () => {
      executeJsCode();
    });
  }

  return (
    <div className="app-container">
      <div className="editor-container">
        <Editor
          defaultLanguage="javascript"
          value={code || initialCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            automaticLayout: true,
          }}
        />
      </div>
      <div className="visualization-container">
        {!molstarReady && <div className="loading">Loading Molstar...</div>}
        <MolStar />
      </div>
    </div>
  );
}
