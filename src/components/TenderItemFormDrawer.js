"use client";

import { Offcanvas } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiAlignLeft, FiBox, FiHash, FiPackage, FiTag, FiX } from "react-icons/fi";
import SelectField from "@/components/SelectField";
import { Field } from "@/components/TenantFormDrawer";

// Codes from the backend's tender_item_type master codes.
const ITEM_TYPE_OPTIONS = [
  { value: 5001, label: "Medicine" },
  { value: 5002, label: "Equipment" },
];

const itemSchema = Yup.object({
  itemTypeCode: Yup.number().required("Type is required!"),
  name: Yup.string().trim().max(255, "Keep the name under 255 characters.").required("Name is required!"),
  description: Yup.string(),
  quantity: Yup.number()
    .typeError("Quantity must be a number.")
    .moreThan(0, "Quantity must be greater than 0.")
    .test("decimals", "Use at most 3 decimal places.", (value) => {
      if (value == null) return true;
      const [, fraction = ""] = String(value).split(".");
      return !/e/i.test(String(value)) && fraction.length <= 3;
    })
    .test("digits", "Use at most 12 digits in total.", (value) => {
      if (value == null) return true;
      return String(value).replace(".", "").replace(/^0+(?=\d)/, "").length <= 12;
    })
    .required("Quantity is required!"),
  unit: Yup.string().trim().max(50, "Keep the unit under 50 characters.").required("Unit is required!"),
});

/**
 * Right-side panel for adding a tender item. `onSave(values)` does the API call and resolves
 * true when it worked, which closes the panel.
 */
export default function TenderItemFormDrawer({ show, tenderLabel, saving, onHide, onSave }) {
  const formik = useFormik({
    initialValues: { itemTypeCode: "", name: "", description: "", quantity: "", unit: "" },
    validationSchema: itemSchema,
    onSubmit: async (values) => {
      const saved = await onSave({
        itemTypeCode: Number(values.itemTypeCode),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        quantity: Number(values.quantity),
        unit: values.unit.trim(),
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
            <h2 className="mf-filter-panel-title">Add Item</h2>
            <p className="mf-tenant-form-subtitle">Add an item to {tenderLabel}.</p>
          </div>
          <button type="button" className="mf-filter-close" onClick={onHide} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="mf-filter-panel-body">
          <SelectField
            id="item-type"
            label="Type"
            required
            icon={<FiBox size={17} />}
            options={ITEM_TYPE_OPTIONS}
            value={formik.values.itemTypeCode === "" ? undefined : formik.values.itemTypeCode}
            onChange={(value) => formik.setFieldValue("itemTypeCode", value)}
            // Closing the menu right after a pick fires blur with the old value; don't validate then.
            onBlur={() => formik.setFieldTouched("itemTypeCode", true, false)}
            error={formik.touched.itemTypeCode || formik.submitCount > 0 ? formik.errors.itemTypeCode : undefined}
          />
          <Field id="item-name" name="name" label="Name" required icon={<FiPackage size={17} />} formik={formik} maxLength={255} />
          <Field id="item-description" name="description" label="Description" icon={<FiAlignLeft size={17} />} formik={formik} />
          <Field id="item-quantity" name="quantity" label="Quantity" type="number" min={0} required icon={<FiHash size={17} />} formik={formik} hint="Greater than 0, up to 12 digits and 3 decimal places" />
          <Field id="item-unit" name="unit" label="Unit" required icon={<FiTag size={17} />} formik={formik} maxLength={50} hint="e.g. box, strip, piece" />
        </div>

        <div className="mf-tenant-form-footer">
          <button type="button" className="mf-page-card-btn" onClick={onHide}>
            Cancel
          </button>
          <button type="submit" className="mf-page-card-btn mf-page-card-btn--add" disabled={saving}>
            Add Item
          </button>
        </div>
      </form>
    </Offcanvas>
  );
}
