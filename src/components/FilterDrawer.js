"use client";

import { useEffect, useRef } from "react";
import { FiFilter, FiRotateCcw, FiX } from "react-icons/fi";

/** A labelled group of single-choice chips, e.g. Status: All / Active / Trial. */
export function FilterGroup({ label, options, value, onChange }) {
  return (
    <fieldset className="mf-filter-group">
      <legend className="mf-filter-group-label">{label}</legend>
      <div className="mf-filter-chips">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`mf-filter-chip${option.value === value ? " is-selected" : ""}`}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * A "Filters" bookmark tab stuck to the right edge of the screen; clicking it slides out a
 * panel holding `children` (usually <FilterGroup>s). `activeCount` shows as a badge on the tab.
 */
export default function FilterDrawer({
  open,
  onOpenChange,
  activeCount = 0,
  onReset,
  resultText,
  children,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) onOpenChange(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className={`mf-filter${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="mf-filter-tab"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="mf-filter-panel"
        aria-label={`Filters${activeCount ? ` (${activeCount} active)` : ""}`}
      >
        {activeCount > 0 && <span className="mf-filter-badge">{activeCount}</span>}
        <FiFilter size={16} />
        <span className="mf-filter-tab-label">Filters</span>
      </button>

      <aside
        id="mf-filter-panel"
        className="mf-filter-panel"
        role="dialog"
        aria-label="Filters"
      >
        <div className="mf-filter-panel-header">
          <h2 className="mf-filter-panel-title">Filters</h2>
          <button
            type="button"
            className="mf-filter-close"
            onClick={() => onOpenChange(false)}
            aria-label="Close filters"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="mf-filter-panel-body">{children}</div>

        <div className="mf-filter-panel-footer">
          {resultText && <span className="mf-filter-result">{resultText}</span>}
          <button
            type="button"
            className="mf-filter-reset"
            onClick={onReset}
            disabled={activeCount === 0}
          >
            <FiRotateCcw size={14} />
            Reset
          </button>
        </div>
      </aside>
    </div>
  );
}
