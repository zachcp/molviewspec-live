import React, { useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { atom, useAtom } from "jotai";
import { loadPyodide } from "pyodide";

// ========== Atom Definitions ========================================
const codeAtom = atom("");
const molViewSpecJsonAtom = atom(null);
const pyodideReadyAtom = atom(false);

// Atom to handle Pyodide initialization
const initializePyodideAtom = atom(null, async (_, set) => {
  try {
    console.log("Loading Pyodide...");
    window.pyodide = await loadPyodide();

    const packages = [
      "./packages/micropip-0.9.0-py3-none-any.whl",
      "./packages/annotated_types-0.6.0-py3-none-any.whl",
      "./packages/typing_extensions-4.11.0-py3-none-any.whl",
      "./packages/pydantic_core-2.27.2-cp312-cp312-pyodide_2024_0_wasm32.whl",
      "./packages/pydantic-2.10.5-py3-none-any.whl",
      "./packages/molviewspec-1.5.0-py3-none-any.whl",
    ];

    await Promise.all(packages.map((pkg) => window.pyodide.loadPackage(pkg)));
    console.log("Pyodide loaded successfully!");
    set(pyodideReadyAtom, true);
    return true;
  } catch (error) {
    console.error("Error initializing Pyodide:", error);
    return false;
  }
});

// Derived atom for executing Python code
const executePyCodeAtom = atom(
  (get) => get(codeAtom),
  async (get, set) => {
    if (!get(pyodideReadyAtom)) return;

    try {
      const code = get(codeAtom);
      const result = await window.pyodide.runPythonAsync(code);
      set(molViewSpecJsonAtom, JSON.parse(result));
    } catch (error) {
      console.error("Error executing Python code:", error);
    }
  },
);

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
  const [molViewSpecJson] = useAtom(molViewSpecJsonAtom);

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
  const [code, setCode] = useAtom(codeAtom);
  const [pyodideReady] = useAtom(pyodideReadyAtom);
  const [, executePyCode] = useAtom(executePyCodeAtom);
  const [, initPyodide] = useAtom(initializePyodideAtom);

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
          // height="300px"
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
