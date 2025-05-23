// src/app/src/atomScope.jsx
// This file is maintained for backward compatibility
import { usePythonAtomScope } from "./components/python/atomScope.jsx";
import { useJSAtomScope } from "./components/js/atomScope.jsx";
import { useContext, createContext } from "react";

// Create a global context that will be used to determine which implementation to use
const ImplementationContext = createContext("python"); // Default to python

// Export the hook to access the current atom scope
export function useAtomScope() {
  const implementation = useContext(ImplementationContext);
  
  // Determine which implementation to use
  if (implementation === "js") {
    return useJSAtomScope();
  } else {
    // Default to Python
    return usePythonAtomScope();
  }
}

// Re-export the provider for backward compatibility
export { PythonMolViewSpecApp as MolViewSpecApp } from "./components/python/atomScope.jsx";