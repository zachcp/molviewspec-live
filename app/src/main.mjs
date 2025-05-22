import React from "react";
import ReactDOM from "react-dom/client";
import { CodeMirrorEditor } from "./app.jsx";

/**
 * Initialize the MolViewSpec application
 * @param {HTMLElement} targetDiv - The target DOM element to render the app into
 * @param {Object|null} initialState - Optional initial state for the application
 * @param {string|null} initialCode - Optional initial Python code
 * @returns {Object} The ReactDOM root instance
 */
export function appInit(targetDiv, initialState = null, initialCode = null) {
  if (!targetDiv) {
    throw new Error("targetDiv is required");
  }

  const root = ReactDOM.createRoot(targetDiv);
  root.render(
    React.createElement(CodeMirrorEditor, {
      initialState: initialState,
      initialCode: initialCode,
    }),
  );

  return root;
}

// Make sure both named and default exports are available
export default appInit;
