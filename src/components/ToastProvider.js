"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

const VARIANTS = {
  success: { icon: FiCheckCircle, title: "Success", role: "status" },
  error: { icon: FiAlertCircle, title: "Error", role: "alert" },
  warning: { icon: FiAlertTriangle, title: "Warning", role: "status" },
  info: { icon: FiInfo, title: "Info", role: "status" },
};

const DEFAULT_DELAY = 5000;

const ToastContext = createContext(null);

// Styles live in globals.css (.mf-toast*). The progress bar's CSS animation is the autohide
// timer (it pauses on hover); when it ends the toast plays its exit animation, then unmounts.
function ToastItem({ toast, onDismiss }) {
  const { id, variant, message, title, delay } = toast;
  const [closing, setClosing] = useState(false);
  const { icon: Icon, title: defaultTitle, role } = VARIANTS[variant];

  return (
    <div
      className={`mf-toast mf-toast--${variant}${closing ? " is-closing" : ""}`}
      role={role}
      style={{ "--mf-toast-delay": `${delay}ms` }}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) onDismiss(id);
      }}
    >
      <span className="mf-toast-icon">
        <Icon size={18} />
      </span>
      <div className="mf-toast-body">
        <strong className="mf-toast-title">{title ?? defaultTitle}</strong>
        <span className="mf-toast-message">{message}</span>
      </div>
      <button
        type="button"
        className="mf-toast-close"
        aria-label="Close notification"
        onClick={() => setClosing(true)}
      >
        <FiX size={16} />
      </button>
      {delay > 0 && (
        <span
          className="mf-toast-progress"
          onAnimationEnd={(e) => {
            e.stopPropagation();
            setClosing(true);
          }}
        />
      )}
    </div>
  );
}

/**
 * Mount once near the root (see app/layout.js), then anywhere below it:
 *
 *   const toast = useToast();
 *   toast.error("Invalid credentials", { title: "Login failed" });
 *   toast.success("Saved!");
 *
 * Methods: success | error | warning | info (message, { title, delay }).
 * `delay` is in ms; pass 0 to keep the toast until it is closed.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((variant, message, { title, delay = DEFAULT_DELAY } = {}) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, variant, message, title, delay }]);
    return id;
  }, []);

  const api = useMemo(
    () => ({
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
      warning: (message, options) => show("warning", message, options),
      info: (message, options) => show("info", message, options),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="mf-toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
