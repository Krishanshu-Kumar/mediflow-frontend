"use client";

import { Modal } from "react-bootstrap";
import { FiAlertTriangle } from "react-icons/fi";

// Confirmation dialog for destructive actions. Styles live in globals.css (.mf-confirm*).
export default function ConfirmModal({
  show,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      show={show}
      onHide={busy ? undefined : onCancel}
      centered
      backdrop={busy ? "static" : true}
      keyboard={!busy}
      dialogClassName="mf-confirm-dialog"
      contentClassName="mf-confirm"
    >
      <Modal.Body className="mf-confirm-body">
        <span className="mf-confirm-icon">
          <FiAlertTriangle size={26} />
        </span>
        <h5 className="mf-confirm-title">{title}</h5>
        <p className="mf-confirm-message">{message}</p>
        <div className="mf-confirm-actions">
          <button type="button" className="mf-confirm-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="mf-confirm-btn is-danger"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
