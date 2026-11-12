"use client";

import { Dropdown } from "react-bootstrap";
import { FiAlertCircle, FiCheck, FiChevronDown } from "react-icons/fi";

// Popper modifier: make the menu exactly as wide as the field box that opened it.
const sameWidth = {
  name: "sameWidth",
  enabled: true,
  phase: "beforeWrite",
  requires: ["computeStyles"],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => {
    state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
  },
};
const POPPER_CONFIG = { strategy: "fixed", modifiers: [sameWidth] };

/**
 * Reusable dropdown for picking ONE value out of many. Looks like the floating-label
 * `.mf-field` boxes so it sits nicely beside text inputs.
 *
 * options: [{ value, label }]
 * value / onChange(value): controlled, like any input.
 * error: message string to show under the box (optional).
 */
export default function SelectField({
  id,
  label,
  icon,
  options,
  value,
  onChange,
  onBlur,
  error,
  hint,
  disabled = false,
  required = false,
  placeholder = "Select…",
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="mf-field-group">
      <Dropdown
        className="mf-select"
        onSelect={(key) => {
          const option = options.find((o) => String(o.value) === key);
          if (option) onChange(option.value);
        }}
        onToggle={(isOpen) => {
          if (!isOpen) onBlur?.();
        }}
      >
        <Dropdown.Toggle
          as="button"
          type="button"
          id={id}
          disabled={disabled}
          className={`mf-field mf-select-toggle${error ? " is-invalid" : ""}`}
        >
          {icon && <span className="mf-field-icon">{icon}</span>}
          <span className="mf-field-body">
            <span className="mf-select-label">
              {label}
              {required && <span className="mf-required"> *</span>}
            </span>
            <span className={`mf-select-value${selected ? "" : " is-placeholder"}`}>
              {selected ? selected.label : placeholder}
            </span>
          </span>
          {error && (
            <span className="mf-field-alert">
              <FiAlertCircle size={19} />
            </span>
          )}
          <FiChevronDown size={18} className="mf-select-chevron" />
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="mf-select-menu"
          popperConfig={POPPER_CONFIG}
          renderOnMount
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Dropdown.Item
                key={option.value}
                eventKey={String(option.value)}
                active={isSelected}
                className="mf-select-option"
              >
                <span>{option.label}</span>
                {isSelected && <FiCheck size={16} />}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>

      <div className={`mf-field-error${error ? " is-visible" : ""}`}>
        <div>
          <span>{error}</span>
        </div>
      </div>
      {hint && !error && <p className="mf-tenant-form-hint">{hint}</p>}
    </div>
  );
}
