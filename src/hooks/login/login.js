"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address!")
    .required("Email is required!"),
  password: Yup.string().required("Password is required!"),
});

export default function useLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      // TODO: wire up to the auth API once available.
      console.log("Login submitted:", values, { rememberMe });
      router.push("/admin/dashboard");
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  const showFieldError = (field) =>
    focusedField !== field &&
    (formik.touched[field] || formik.submitCount > 0) &&
    formik.errors[field];

  const handleFieldFocus = (field) => setFocusedField(field);

  const handleFieldBlur = (e) => {
    setFocusedField(null);
    formik.handleBlur(e);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    formik,
    showPassword,
    togglePassword,
    rememberMe,
    setRememberMe,
    showFieldError,
    handleFieldFocus,
    handleFieldBlur,
  };
}
