import React, { createContext, useContext, useMemo } from "react";
import { Provider as JotaiProvider } from "jotai";
import { atom } from "jotai";

// Create a context to pass the atom scope
const JSAtomScopeContext = createContext(null);

// Hook to access the current atom scope
export function useJSAtomScope() {
  const scope = useContext(JSAtomScopeContext);
  if (!scope) {
    throw new Error("useJSAtomScope must be used within a JSAtomScopeProvider");
  }
  return scope;
}

// Factory function to create a fresh set of atoms
function createJSAtomScope() {
  const codeAtom = atom("");
  const molViewSpecJsonAtom = atom(null);

  // Derived atom for executing JS code
  const executeJsCodeAtom = atom(
    (get) => get(codeAtom),
    async (get, set) => {
      try {
        const code = get(codeAtom);
        // Execute the JS code in a controlled environment
        // This is a simplified implementation; you might want to add more safety measures
        const evalFunction = new Function(`
          try {
            ${code}
            return window.__molViewSpecResult;
          } catch (error) {
            console.error("Error executing JS code:", error);
            return null;
          }
        `);
        
        const result = evalFunction();
        if (result) {
          set(molViewSpecJsonAtom, result);
        }
      } catch (error) {
        console.error("Error executing JS code:", error);
      }
    }
  );

  return {
    codeAtom,
    molViewSpecJsonAtom,
    executeJsCodeAtom,
  };
}

// Provider component that creates a new atom scope
export function JSMolViewSpecApp({ initialCode = "", children }) {
  const atomScope = useMemo(() => createJSAtomScope(), []);

  return (
    <JotaiProvider>
      <JSAtomScopeContext.Provider value={atomScope}>
        {children}
      </JSAtomScopeContext.Provider>
    </JotaiProvider>
  );
}