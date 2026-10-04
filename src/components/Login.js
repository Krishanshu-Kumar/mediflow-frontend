"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Carousel, Col, Container, Form, Row } from "react-bootstrap";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiHome } from "react-icons/fi";
import { ApiError } from "@/api/apiHelper";
import { login } from "@/api/authApi";

const buildLoginSchema = (needsTenant) =>
  Yup.object({
    ...(needsTenant && {
      tenantSlug: Yup.string()
        .trim()
        .matches(/^[a-z0-9-]+$/i, "Use letters, numbers and dashes only!")
        .required("Clinic ID is required!"),
    }),
    email: Yup.string()
      .email("Enter a valid email address!")
      .required("Email is required!"),
    password: Yup.string().required("Password is required!"),
  });

const SLIDES = [
  {
    title: "Manage Patients",
    text: "Keep every patient record organized and accessible in one place.",
    color: "#0d6efd",
    image: "/images/login_pic_1.png",
  },
  {
    title: "Schedule Appointments",
    text: "Book, reschedule, and track appointments without the back-and-forth.",
    color: "#198754",
    image: "/images/login_img2.png",
  },
  {
    title: "Secure Records",
    text: "Your data is protected with industry-standard security practices.",
    color: "#6610f2",
    image: "/images/login_img3.png",
  },
];

// `tenantSlug` comes from the /[tenant]/login route; on plain /login it is
// undefined and the user types their Clinic ID instead.
export default function Login({ tenantSlug }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const formik = useFormik({
    initialValues: { tenantSlug: "", email: "", password: "" },
    validationSchema: buildLoginSchema(!tenantSlug),
    onSubmit: async (values) => {
      setSubmitError("");
      try {
        await login({
          tenantSlug: tenantSlug ?? values.tenantSlug.trim().toLowerCase(),
          email: values.email.trim(),
          password: values.password,
          remember: rememberMe,
        });
        router.push("/admin/dashboard");
      } catch (err) {
        setSubmitError(
          err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        );
      }
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

  return (
    <Container fluid className="min-vh-100 d-flex flex-column py-2 mf-login-bg">
      <Row className="flex-grow-1 g-1">
        <Col md={7} className="d-none d-md-block">
          <Carousel
            variant="dark"
            controls={false}
            className="h-100 mf-carousel"
            fade
            interval={4000}
            pause={false}
          >
            {SLIDES.map((slide) => (
              <Carousel.Item key={slide.title} className="h-100">
                <div
                  className="position-relative d-flex flex-column align-items-center justify-content-center text-center text-white h-100 px-4 rounded overflow-hidden"
                  style={{ backgroundColor: slide.color }}
                >
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  {!slide.image && (
                    <div className="position-relative">
                      <h1 className="display-6 fw-bold mb-3">{slide.title}</h1>
                      <p className="mb-0" style={{ maxWidth: "420px" }}>
                        {slide.text}
                      </p>
                    </div>
                  )}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={5} className="d-flex align-items-center justify-content-center">
          <div className="mf-login-form" style={{ width: "100%", maxWidth: "430px" }}>
            <div className="text-center mb-4">
              <Image
                src="/images/mediflow-wordmark.png"
                alt="MediFlow"
                width={903}
                height={196}
                priority
                className="mf-login-logo"
              />
              <h1 className="display-6 fw-bold mb-2">Welcome Back</h1>
              <p className="text-muted mb-0">Sign in to continue to MediFlow</p>
            </div>

            <Form onSubmit={formik.handleSubmit}>
              {!tenantSlug && (
                <div className="mf-field-group mb-3">
                  <div
                    className={`mf-field${
                      showFieldError("tenantSlug") ? " is-invalid" : ""
                    }`}
                  >
                    <span className="mf-field-icon">
                      <FiHome size={17} />
                    </span>
                    <div className="mf-field-body">
                      <input
                        id="login-tenant"
                        type="text"
                        name="tenantSlug"
                        placeholder=" "
                        value={formik.values.tenantSlug}
                        onChange={formik.handleChange}
                        onFocus={() => handleFieldFocus("tenantSlug")}
                        onBlur={handleFieldBlur}
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="none"
                        className="mf-field-input"
                      />
                      <label htmlFor="login-tenant" className="mf-field-label">
                        Clinic ID
                      </label>
                    </div>
                    {showFieldError("tenantSlug") && (
                      <span className="mf-field-alert">
                        <FiAlertCircle size={19} />
                      </span>
                    )}
                  </div>
                  <div
                    className={`mf-field-error${
                      showFieldError("tenantSlug") ? " is-visible" : ""
                    }`}
                  >
                    <div>
                      <span>{formik.errors.tenantSlug}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mf-field-group mb-3">
                <div
                  className={`mf-field${
                    showFieldError("email") ? " is-invalid" : ""
                  }`}
                >
                  <span className="mf-field-icon">
                    <FiMail size={17} />
                  </span>
                  <div className="mf-field-body">
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder=" "
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onFocus={() => handleFieldFocus("email")}
                      onBlur={handleFieldBlur}
                      autoComplete="new-password"
                      spellCheck="false"
                      className="mf-field-input"
                    />
                    <label htmlFor="login-email" className="mf-field-label">
                      Email
                    </label>
                  </div>
                  {showFieldError("email") && (
                    <span className="mf-field-alert">
                      <FiAlertCircle size={19} />
                    </span>
                  )}
                </div>
                <div
                  className={`mf-field-error${
                    showFieldError("email") ? " is-visible" : ""
                  }`}
                >
                  <div>
                    <span>{formik.errors.email}</span>
                  </div>
                </div>
              </div>

              <div className="mf-field-group mb-4">
                <div
                  className={`mf-field${
                    showFieldError("password") ? " is-invalid" : ""
                  }`}
                >
                  <span className="mf-field-icon">
                    <FiLock size={17} />
                  </span>
                  <div className="mf-field-body">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder=" "
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onFocus={() => handleFieldFocus("password")}
                      onBlur={handleFieldBlur}
                      autoComplete="new-password"
                      className="mf-field-input"
                    />
                    <label htmlFor="login-password" className="mf-field-label">
                      Password
                    </label>
                  </div>
                  {showFieldError("password") ? (
                    <span className="mf-field-alert">
                      <FiAlertCircle size={19} />
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="mf-field-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                    </button>
                  )}
                </div>
                <div
                  className={`mf-field-error${
                    showFieldError("password") ? " is-visible" : ""
                  }`}
                >
                  <div>
                    <span>{formik.errors.password}</span>
                  </div>
                </div>
              </div>

              <div
                className="d-flex align-items-center justify-content-between mb-3"
                style={{ paddingLeft: "0.35rem", paddingRight: "0.5rem" }}
              >
                <Form.Check
                  type="checkbox"
                  id="remember-me"
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mf-checkbox small"
                />
                <a href="#" className="text-decoration-none small">
                  Forgot Password?
                </a>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="alert alert-danger d-flex align-items-center gap-2 py-2 small"
                >
                  <FiAlertCircle size={16} className="flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="dark"
                size="lg"
                disabled={formik.isSubmitting}
                className="w-100 rounded-pill fw-semibold"
              >
                {formik.isSubmitting ? "Signing in..." : "Login"}
              </Button>

              <p className="text-center text-muted mt-4 mb-0">
                Don&apos;t have an account?{" "}
                <a href="#" className="text-decoration-none fw-semibold">
                  Sign up
                </a>
              </p>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
