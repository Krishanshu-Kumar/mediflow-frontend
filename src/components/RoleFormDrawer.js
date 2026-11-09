"use client";

import { Offcanvas } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiHome, FiShield, FiX } from "react-icons/fi";
import SelectField from "@/components/SelectField";
import { Field } from "@/components/TenantFormDrawer";

// True when the value is only digits (and separators), e.g. "123" or "12-34".
const isOnlyNumbers = (value) => /^[\d\s-]+$/.test(value);

// True when the value has at least one letter (so "!!!" or "@#$" is rejected).
const hasLetter = (value) => /\p{L}/u.test(value);

const roleSchema = Yup.object({
  tenantId: Yup.string().required("Pick a tenant."),
  name: Yup.string()
    .trim()
    .max(255, "Keep the name under 255 characters.")
    .test("not-only-numbers", "Name can't be only numbers.", (value) => !value || !isOnlyNumbers(value))
    .test("not-only-symbols", "Name needs at least one letter.", (value) => !value || hasLetter(value))
    .required("Name is required!"),
});

/**
 * Right-side panel for adding a role (`role` null) or editing one (the tenant is fixed then).
 * `tenants` are the choices for the Tenant dropdown and
 * `defaultTenantId` is preselected. `onSave(values)` does the API call and resolves true when
 * it worked, which closes the panel.
 */
export default function RoleFormDrawer({ show, role, tenants, defaultTenantId, saving, onHide, onSave }) {
  const isEdit = Boolean(role);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { tenantId: role?.tenant_id ?? defaultTenantId ?? "", name: role?.name ?? "" },
    validationSchema: roleSchema,
    onSubmit: async (values) => {
      const saved = await onSave({ ...values, name: values.name.trim() });
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
            <h2 className="mf-filter-panel-title">{isEdit ? "Edit Role" : "Add Role"}</h2>
            <p className="mf-tenant-form-subtitle">
              {isEdit ? `Update ${role.name}.` : "Create a new role for a tenant."}
            </p>
          </div>
          <button type="button" className="mf-filter-close" onClick={onHide} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="mf-filter-panel-body">
          <SelectField
            id="role-tenant"
            label="Tenant"
            disabled={isEdit}
            icon={<FiHome size={17} />}
            options={tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))}
            value={formik.values.tenantId}
            onChange={(id) => formik.setFieldValue("tenantId", id)}
            onBlur={() => formik.setFieldTouched("tenantId", true)}
            error={
              formik.touched.tenantId || formik.submitCount > 0 ? formik.errors.tenantId : undefined
            }
          />
          <Field
            id="role-name"
            name="name"
            label="Role name"
            icon={<FiShield size={17} />}
            formik={formik}
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
            {isEdit ? "Save changes" : "Add Role"}
          </button>
        </div>
      </form>
    </Offcanvas>
  );
}
