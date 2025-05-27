import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useAtom } from "jotai";
import { useJSAtomScope } from "./atomScope.jsx";
import { MolStar } from "../../main.mjs";
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings";
import * as monaco from "monaco-editor";
import { EXAMPLES, COLORS, PDB_URLS } from "../../utils/molstar-helpers.js";
import { MONACO_CONFIG } from "../../config/monaco-config.js";

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
  async function handleEditorDidMount(editor, monacoInstance) {
    // Add Alt+Enter keyboard shortcut
    editor.addCommand(monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.Enter, () => {
      executeJsCode();
    });

    // Set up TypeScript language defaults
    monacoInstance.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monacoInstance.languages.typescript.ScriptTarget[MONACO_CONFIG.compilerOptions.target],
      allowNonTsExtensions: MONACO_CONFIG.compilerOptions.allowNonTsExtensions,
      moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind[MONACO_CONFIG.compilerOptions.moduleResolution],
      module: monacoInstance.languages.typescript.ModuleKind[MONACO_CONFIG.compilerOptions.module],
      noEmit: MONACO_CONFIG.compilerOptions.noEmit,
      allowSyntheticDefaultImports: MONACO_CONFIG.compilerOptions.allowSyntheticDefaultImports,
      typeRoots: MONACO_CONFIG.compilerOptions.typeRoots,
    });

    // Add Molstar type definitions to Monaco
    monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
      MONACO_CONFIG.molstarTypeDefs,
      'molstar-mvs.d.ts'
    );

    // Register code snippets for Molstar MVS
    monacoInstance.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        return {
          suggestions: MONACO_CONFIG.snippets.map(snippet => ({
            label: snippet.label,
            kind: monacoInstance.languages.CompletionItemKind[snippet.kind],
            insertText: snippet.insertText,
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: snippet.documentation,
            range: range
          }))
        };
      }
    });

    // Register hover provider for better documentation
    monacoInstance.languages.registerHoverProvider('typescript', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return;

        if (MONACO_CONFIG.hoverDocs[word.word]) {
          return {
            range: new monacoInstance.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              { value: `**${word.word}**` },
              { value: MONACO_CONFIG.hoverDocs[word.word] }
            ]
          };
        }
      }
    });

    try {
      // Initialize auto-typings for additional npm packages
      await AutoTypings.create(editor, {
        sourceCache: new LocalStorageCache(),
        monaco: monacoInstance,
        ...MONACO_CONFIG.autoTypingsConfig,
      });
    } catch (error) {
      console.warn("Failed to initialize auto-typings:", error);
    }
  }

  return (
    <div className="app-container">
      <div className="editor-container">
        <Editor
          defaultLanguage="javascript"
          value={code || initialCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={MONACO_CONFIG.editorOptions.theme}
          options={MONACO_CONFIG.editorOptions}
        />
      </div>
      <div className="visualization-container">
        {!molstarReady && <div className="loading">Loading Molstar...</div>}
        <MolStar />
      </div>
    </div>
  );
}
