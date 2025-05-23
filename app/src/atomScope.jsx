// src/app/src/atomScope.jsx
import React, { createContext, useContext, useMemo } from "react";
import { Provider as JotaiProvider } from "jotai";
import { atom } from "jotai";
import { loadPyodide } from "pyodide";

// Create a context to pass the atom scope
const AtomScopeContext = createContext(null);

// Hook to access the current atom scope
export function useAtomScope() {
  const scope = useContext(AtomScopeContext);
  if (!scope) {
    throw new Error("useAtomScope must be used within an AtomScopeProvider");
  }
  return scope;
}

// Factory function to create a fresh set of atoms
function createAtomScope() {
  const codeAtom = atom("");
  const molViewSpecJsonAtom = atom(null);
  const pyodideReadyAtom = atom(false);

  // Atom to handle Pyodide initialization
  const initializePyodideAtom = atom(null, async (_, set) => {
    try {
      console.log("Loading Pyodide...");
      // Share pyodide instance globally to avoid duplicate loading
      if (!window.pyodide) {
        window.pyodide = await loadPyodide();

        const packages = [
          "./packages/micropip-0.9.0-py3-none-any.whl",
          "./packages/annotated_types-0.6.0-py3-none-any.whl",
          "./packages/typing_extensions-4.11.0-py3-none-any.whl",
          "./packages/pydantic_core-2.27.2-cp312-cp312-pyodide_2024_0_wasm32.whl",
          "./packages/pydantic-2.10.5-py3-none-any.whl",
          "./packages/molviewspec-1.6.0-py3-none-any.whl",
        ];

        await Promise.all(
          packages.map((pkg) => window.pyodide.loadPackage(pkg)),
        );
        console.log("Pyodide loaded successfully!");
      }

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

  return {
    codeAtom,
    molViewSpecJsonAtom,
    pyodideReadyAtom,
    initializePyodideAtom,
    executePyCodeAtom,
  };
}

// Provider component that creates a new atom scope
export function MolViewSpecApp({ initialCode = "", children }) {
  const atomScope = useMemo(() => createAtomScope(), []);

  return (
    <JotaiProvider>
      <AtomScopeContext.Provider value={atomScope}>
        {children}
      </AtomScopeContext.Provider>
    </JotaiProvider>
  );
}
