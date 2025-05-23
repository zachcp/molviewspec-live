import React, { useEffect, useRef, createContext, useContext } from "react";
import { Provider as JotaiProvider } from "jotai";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { atom, useAtom } from "jotai";
import { loadPyodide } from "pyodide";
import { useAtomScope } from "./atomScope.jsx";

// ========== Params ==================================================
// Molstar viewer configuration parameters
const molstarParams = {
  allowMajorPerformanceCaveat: true,
  collapseLeftPanel: false,
  collapseRightPanel: false,
  customFormats: [],
  disableAntialiasing: false,
  disabledExtensions: [],
  emdbProvider: "rcsb",
  illumination: false,
  layoutIsExpanded: false,
  layoutShowControls: false,
  layoutShowLeftPanel: false,
  layoutShowLog: false,
  layoutShowRemoteState: false,
  layoutShowSequence: true,
  pdbProvider: "rcsb",
  pickScale: 1,
  pixelScale: 1,
  pluginStateServer: "",
  powerPreference: "default",
  preferWebgl1: false,
  rcsbAssemblySymmetryApplyColors: true,
  rcsbAssemblySymmetryDefaultServerType: "full",
  rcsbAssemblySymmetryDefaultServerUrl: "",
  resolutionMode: "auto",
  saccharideCompIdMapType: "default",
  transparency: true,
  viewportShowAnimation: false,
  viewportShowControls: true,
  viewportShowExpand: true,
  viewportShowSelectionMode: false,
  viewportShowSettings: true,
  viewportShowTrajectoryControls: false,
  volumeStreamingDisabled: false,
};

// ========== Components ==================================================

export function MolStar() {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  // const [molViewSpecJson] = useAtom(molViewSpecJsonAtom);
  const atomScope = useAtomScope();
  const [molViewSpecJson] = useAtom(atomScope.molViewSpecJsonAtom);

  // Initialize the component
  useEffect(() => {
    if (!containerRef.current) return;

    molstar.Viewer.create(containerRef.current, molstarParams)
      .then((viewer) => {
        instanceRef.current = viewer;
        if (molViewSpecJson) {
          viewer.loadMvsData(molViewSpecJson, "mvsj", {
            replaceExisting: true,
          });
        }
      })
      .catch((err) =>
        console.error(`Failed to initialize MolStar: ${err.message}`),
      );

    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, []);

  // Update when molViewSpecJson changes
  useEffect(() => {
    if (instanceRef.current && molViewSpecJson) {
      instanceRef.current.loadMvsData(molViewSpecJson, "mvsj", {
        replaceExisting: true,
      });
    }
  }, [molViewSpecJson]);

  return (
    <div className="molstar-container">
      <div className="molstar" ref={containerRef}></div>
    </div>
  );
}

export function CodeMirrorEditor({ initialCode = "" }) {
  const atomScope = useAtomScope();
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
          // const MAX_LINES = 18;
          // const LINE_HEIGHT = 21; // Approximate line height in pixels
          // const maxHeight = `${MAX_LINES * LINE_HEIGHT}px`;
          // style={ maxHeight: 381, overflow: "auto" }
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
