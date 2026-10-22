"use client";

import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiAlertCircle, FiHome, FiLink, FiX } from "react-icons/fi";
import { FilterGroup } from "@/components/FilterDrawer";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const tenantSchema = Yup.object({
  name: Yup.string().trim().max(255, "Keep the name under 255 characters.").required("Name is required!"),
  slug: Yup.string()
    .max(100, "Keep the slug under 100 characters.")
    .matches(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens only.")
    .required("Slug is required!"),
  planCode: Yup.number().required("Pick a plan."),
});

// "Sunrise Family Clinic" -> "sunrise-family-clinic"
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

/** One floating-label field, styled like the login form. */
function Field({ id, name, label, icon, formik, onChange, hint }) {
  const showError = (formik.touched[name] || formik.submitCount > 0) && formik.errors[name];

  return (
    <div className="mf-field-group">
      <div className={`mf-field${showError ? " is-invalid" : ""}`}>
        <span className="mf-field-icon">{icon}</span>
        <div className="mf-field-body">
          <input
            id={id}
            type="text"
            name={name}
            placeholder=" "
            value={formik.values[name]}
            onChange={onChange ?? formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="off"
            spellCheck="false"
            className="mf-field-input"
          />
          <label htmlFor={id} className="mf-field-label">
            {label}
          </label>
        </div>
        {showError && (
          <span className="mf-field-alert">
            <FiAlertCircle size={19} />
          </span>
        )}
      </div>
      <div className={`mf-field-error${showError ? " is-visible" : ""}`}>
        <div>
          <span>{formik.errors[name]}</span>
        </div>
      </div>
      {hint && !showError && <p className="mf-tenant-form-hint">{hint}</p>}
    </div>
  );
}

/**
 * Right-side panel for adding a tenant (`tenant` null) or editing one. `onSave(values)` does
 * the API call and resolves true when it worked, which closes the panel.
 */
export default function TenantFormDrawer({ show, tenant, plans, saving, onHide, onSave }) {
  const isEdit = Boolean(tenant);
  // While adding, the slug follows the name until the user types in the slug field.
  const [slugEdited, setSlugEdited] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: tenant?.name ?? "",
      slug: tenant?.slug ?? "",
      planCode: tenant?.plan_code ?? plans[0]?.code ?? "",
    },
    validationSchema: tenantSchema,
    onSubmit: async (values) => {
      const saved = await onSave({ ...values, name: values.name.trim() });
      if (saved) onHide();
    },
  });

  const handleNameChange = (event) => {
    formik.handleChange(event);
    if (!isEdit && !slugEdited) formik.setFieldValue("slug", slugify(event.target.value));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);
    formik.setFieldValue("slug", event.target.value.toLowerCase());
  };

  const handleExited = () => {
    formik.resetForm();
    setSlugEdited(false);
  };

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      onExited={handleExited}
      placement="end"
      className="mf-tenant-drawer"
    >
      <form className="mf-tenant-form" onSubmit={formik.handleSubmit} noValidate>
        <div className="mf-filter-panel-header">
          <div>
            <h2 className="mf-filter-panel-title">{isEdit ? "Edit Tenant" : "Add Tenant"}</h2>
            <p className="mf-tenant-form-subtitle">
              {isEdit ? `Update ${tenant.name}'s details.` : "Set up a new clinic on MediFlow."}
            </p>
          </div>
          <button type="button" className="mf-filter-close" onClick={onHide} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="mf-filter-panel-body">
          <Field
            id="tenant-name"
            name="name"
            label="Clinic name"
            icon={<FiHome size={17} />}
            formik={formik}
            onChange={handleNameChange}
          />
          <Field
            id="tenant-slug"
            name="slug"
            label="Slug"
            icon={<FiLink size={17} />}
            formik={formik}
            onChange={handleSlugChange}
            hint={`Staff sign in at /${formik.values.slug || "your-slug"}/login`}
          />
          <FilterGroup
            label="Plan"
            options={plans.map((plan) => ({ value: plan.code, label: plan.display_name }))}
            value={formik.values.planCode}
            onChange={(code) => formik.setFieldValue("planCode", code)}
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
            {isEdit ? "Save changes" : "Add Tenant"}
          </button>
        </div>
      </form>
    </Offcanvas>
  );
}
