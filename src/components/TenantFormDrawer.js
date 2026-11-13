"use client";

import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiAlertCircle, FiHome, FiInfo, FiLayers, FiLink, FiLock, FiX } from "react-icons/fi";
import SelectField from "@/components/SelectField";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// True when the value is only digits (and separators), e.g. "123" or "12-34".
const isOnlyNumbers = (value) => /^[\d\s-]+$/.test(value);

// True when the value has at least one letter (so "!!!" or "@#$" is rejected).
const hasLetter = (value) => /\p{L}/u.test(value);

const tenantSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(255, "Keep the name under 255 characters.")
    .test("not-only-numbers", "Name can't be only numbers.", (value) => !value || !isOnlyNumbers(value))
    .test("not-only-symbols", "Name needs at least one letter.", (value) => !value || hasLetter(value))
    .required("Name is required!"),
  slug: Yup.string()
    .max(100, "Keep the slug under 100 characters.")
    .matches(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens only.")
    .test("not-only-numbers", "Slug can't be only numbers.", (value) => !value || !isOnlyNumbers(value))
    .test("not-only-symbols", "Slug needs at least one letter.", (value) => !value || hasLetter(value))
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
export function Field({ id, name, label, icon, formik, onChange, hint, maxLength, required }) {
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
            maxLength={maxLength}
            className="mf-field-input"
          />
          <label htmlFor={id} className="mf-field-label">
            {label}
            {required && <span className="mf-required"> *</span>}
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
          {isEdit ? (
            <div className="mf-field-group">
              <div className="mf-field is-locked" title="The slug can't be changed once set.">
                <span className="mf-field-icon">
                  <FiLink size={17} />
                </span>
                <div className="mf-field-body">
                  <input
                    id="tenant-slug"
                    type="text"
                    className="mf-field-input"
                    placeholder=" "
                    value={formik.values.slug}
                    disabled
                    readOnly
                  />
                  <label htmlFor="tenant-slug" className="mf-field-label">
                    Slug
                  </label>
                </div>
                <span className="mf-field-lock">
                  <FiLock size={12} />
                  Locked
                </span>
              </div>
              <p className="mf-locked-note">
                <FiInfo size={13} />
                <span>Slug can&apos;t be edited once added.</span>
              </p>
            </div>
          ) : (
            <Field
              id="tenant-slug"
              name="slug"
              label="Slug"
              icon={<FiLink size={17} />}
              formik={formik}
              onChange={handleSlugChange}
              hint={`Staff sign in at /${formik.values.slug || "your-slug"}/login`}
            />
          )}
          <SelectField
            id="tenant-plan"
            label="Plan"
            icon={<FiLayers size={17} />}
            options={plans.map((plan) => ({ value: plan.code, label: plan.display_name }))}
            value={formik.values.planCode}
            onChange={(code) => formik.setFieldValue("planCode", code)}
            onBlur={() => formik.setFieldTouched("planCode", true)}
            error={
              (formik.touched.planCode || formik.submitCount > 0) ? formik.errors.planCode : undefined
            }
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
