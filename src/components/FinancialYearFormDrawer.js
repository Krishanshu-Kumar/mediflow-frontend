"use client";

import { Offcanvas } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiCalendar, FiInfo, FiLock, FiTag, FiX } from "react-icons/fi";
import { Field } from "@/components/TenantFormDrawer";

// Matches the API: "20YY-YY", e.g. 2026-27.
const LABEL_PATTERN = /^20[0-9]{2}-[0-9]{2}$/;

const financialYearSchema = Yup.object({
  label: Yup.string()
    .trim()
    .max(20, "Keep the label under 20 characters.")
    .matches(LABEL_PATTERN, "Use the format 2026-27.")
    .required("Label is required!"),
  startDate: Yup.string().required("Start date is required!"),
  endDate: Yup.string()
    .required("End date is required!")
    .test("after-start", "End date must be after the start date.", function (value) {
      const { startDate } = this.parent;
      return !value || !startDate || value > startDate;
    }),
});

/**
 * Right-side panel for adding a financial year (`financialYear` null) or editing one.
 * `onSave(values)` does the API call and resolves true when it worked, which closes the panel.
 */
export default function FinancialYearFormDrawer({ show, financialYear, saving, onHide, onSave }) {
  const isEdit = Boolean(financialYear);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      label: financialYear?.label ?? "",
      startDate: financialYear?.start_date ?? "",
      endDate: financialYear?.end_date ?? "",
    },
    validationSchema: financialYearSchema,
    onSubmit: async (values) => {
      const saved = await onSave({
        // The label is locked on edit, so it isn't sent in the update call.
        label: isEdit ? undefined : values.label.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
      });
      if (saved) onHide();
    },
  });

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      onExited={() => formik.resetForm()}
      placement="end"
      className="mf-tenant-drawer"
    >
      <form className="mf-tenant-form" onSubmit={formik.handleSubmit} noValidate>
        <div className="mf-filter-panel-header">
          <div>
            <h2 className="mf-filter-panel-title">
              {isEdit ? "Edit Financial Year" : "Add Financial Year"}
            </h2>
            <p className="mf-tenant-form-subtitle">
              {isEdit ? `Update ${financialYear.label}.` : "Create a new financial year."}
            </p>
          </div>
          <button type="button" className="mf-filter-close" onClick={onHide} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="mf-filter-panel-body">
          {isEdit ? (
            <div className="mf-field-group">
              <div className="mf-field is-locked" title="The label can't be changed once set.">
                <span className="mf-field-icon">
                  <FiTag size={17} />
                </span>
                <div className="mf-field-body">
                  <input
                    id="fy-label"
                    type="text"
                    className="mf-field-input"
                    placeholder=" "
                    value={formik.values.label}
                    disabled
                    readOnly
                  />
                  <label htmlFor="fy-label" className="mf-field-label">
                    Label
                  </label>
                </div>
                <span className="mf-field-lock">
                  <FiLock size={12} />
                  Locked
                </span>
              </div>
              <p className="mf-locked-note">
                <FiInfo size={13} />
                <span>Label can&apos;t be edited once added.</span>
              </p>
            </div>
          ) : (
            <Field
              id="fy-label"
              name="label"
              label="Label"
              required
              icon={<FiTag size={17} />}
              formik={formik}
              maxLength={20}
              hint="Format 20YY-YY, e.g. 2026-27"
            />
          )}
          <Field
            id="fy-start-date"
            name="startDate"
            label="Start date"
            type="date"
            required
            icon={<FiCalendar size={17} />}
            formik={formik}
          />
          <Field
            id="fy-end-date"
            name="endDate"
            label="End date"
            type="date"
            required
            icon={<FiCalendar size={17} />}
            formik={formik}
          />
        </div>

        <div className="mf-tenant-form-footer">
          <button type="button" className="mf-page-card-btn" onClick={onHide}>
            Cancel
          </button>
          <button type="submit" className="mf-page-card-btn mf-page-card-btn--add" disabled={saving}>
            {isEdit ? "Save changes" : "Add Financial Year"}
          </button>
        </div>
      </form>
    </Offcanvas>
  );
}
