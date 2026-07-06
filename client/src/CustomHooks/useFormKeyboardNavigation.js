import { useRef, useCallback } from "react";

/**
 * Reusable hook for form keyboard navigation
 * Handles Enter and Tab key navigation between form fields and buttons
 */
export const useFormKeyboardNavigation = () => {
  // Refs for form elements
  const firstInputRef = useRef(null);
  const secondInputRef = useRef(null);
  const thirdInputRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const saveCloseButtonRef = useRef(null);
  const saveNewButtonRef = useRef(null);

  // Handler for last input field (moves to toggle button on Enter)
  const handleLastInputKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      toggleButtonRef.current?.focus();
    }
  }, []);

  // Handler for toggle button (moves to Save & Close on Tab)
  const handleToggleKeyDown = useCallback((e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      saveCloseButtonRef.current?.focus();
    }
  }, []);

  // Handler for Save & Close button
  const handleSaveCloseKeyDown = useCallback(
    (saveDataFn) => (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        saveDataFn("close");
      }
    },
    [],
  );

  // Handler for Save & New button
  const handleSaveNewKeyDown = useCallback(
    (saveDataFn) => (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        saveDataFn("new");
      }
    },
    [],
  );

  // Focus first input (useful for onNew)
  const focusFirstInput = useCallback(() => {
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, []);

  return {
    // Refs
    refs: {
      firstInputRef,
      secondInputRef,
      thirdInputRef,
      toggleButtonRef,
      saveCloseButtonRef,
      saveNewButtonRef,
    },
    // Handlers
    handlers: {
      handleLastInputKeyDown,
      handleToggleKeyDown,
      handleSaveCloseKeyDown,
      handleSaveNewKeyDown,
    },
    // Utilities
    focusFirstInput,
  };
};
