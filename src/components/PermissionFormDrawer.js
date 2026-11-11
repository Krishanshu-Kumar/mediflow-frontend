"use client";

import { Offcanvas } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiAlignLeft, FiGlobe, FiKey, FiTag, FiX } from "react-icons/fi";
import SelectField from "@/components/SelectField";
import { Field } from "@/components/TenantFormDrawer";

export const SCOPE_OPTIONS = [
  { value: "platform", label: "Platform" },
  { value: "tenant", label: "Tenant" },
];

const permissionSchema = Yup.object({
  code: Yup.string()
    .trim()
    .max(100, "Keep the code under 100 characters.")
    .matches(/^[a-z0-9_]+\.[a-z0-9_]+$/, "Use resource.action in lowercase, e.g. user.create.")
    .required("Code is required!"),
  displayName: Yup.string().trim().max(255, "Keep the display name under 255 characters."),
  description: Yup.string().trim().required("Description is required!"),
  scope: Yup.string().required("Pick a scope."),
});

/**
 * Right-side panel for adding a permission (`permission` null) or editing one (the code is
 * fixed then). `onSave(values)` does the API call and resolves true when it worked, which
 * closes the panel.
 */
export default function PermissionFormDrawer({ show, permission, saving, onHide, onSave }) {
  const isEdit = Boolean(permission);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: permission?.code ?? "",
      displayName: permission?.display_name ?? "",
      description: permission?.description ?? "",
      scope: permission?.scope ?? "",
    },
    validationSchema: permissionSchema,
    onSubmit: async (values) => {
      const saved = await onSave({
        code: values.code.trim(),
        displayName: values.displayName.trim(),
        description: values.description.trim(),
        scope: values.scope,
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
            <h2 className="mf-filter-panel-title">{isEdit ? "Edit Permission" : "Add Permission"}</h2>
            <p className="mf-tenant-form-subtitle">
              {isEdit ? `Update ${permission.code}.` : "Create a new permission."}
            </p>
          </div>
          <button type="button" className="mf-filter-close" onClick={onHide} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="mf-filter-panel-body">
          {isEdit ? (
            <div className="mf-field-group">
              <div className="mf-field">
                <span className="mf-field-icon">
                  <FiKey size={17} />
                </span>
                <div className="mf-field-body">
                  <input
                    id="permission-code"
                    type="text"
                    className="mf-field-input"
                    placeholder=" "
                    value={formik.values.code}
                    disabled
                    readOnly
                  />
                  <label htmlFor="permission-code" className="mf-field-label">
                    Code
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <Field
              id="permission-code"
              name="code"
              label="Code"
              icon={<FiKey size={17} />}
              formik={formik}
              hint="Lowercase resource.action, e.g. user.create"
            />
          )}
          <Field
            id="permission-display-name"
            name="displayName"
            label="Display name (optional)"
            icon={<FiTag size={17} />}
            formik={formik}
          />
          <Field
            id="permission-description"
            name="description"
            label="Description"
            icon={<FiAlignLeft size={17} />}
            formik={formik}
          />
          <SelectField
            id="permission-scope"
            label="Scope"
            icon={<FiGlobe size={17} />}
            options={SCOPE_OPTIONS}
            value={formik.values.scope}
            onChange={(value) => formik.setFieldValue("scope", value)}
            onBlur={() => formik.setFieldTouched("scope", true)}
            error={formik.touched.scope || formik.submitCount > 0 ? formik.errors.scope : undefined}
          />
        </div>

        <div className="mf-tenant-form-footer">
          <button type="button" className="mf-page-card-btn" onClick={onHide}>
            Cancel
          </button>
          <button
            type="submit"
            className="mf-page-card-btn mf-page-card-btn--add"
            disabled={saving}
          >
            {isEdit ? "Save changes" : "Add Permission"}
          </button>
        </div>
      </form>
    </Offcanvas>
  );
}
