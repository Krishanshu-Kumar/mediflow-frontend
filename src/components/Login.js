"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Carousel, Col, Container, Form, Row } from "react-bootstrap";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

const loginSchema = Yup.object({
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
    image: "/login_pic_1.png",
  },
  {
    title: "Schedule Appointments",
    text: "Book, reschedule, and track appointments without the back-and-forth.",
    color: "#198754",
    image: "/login_img2.png",
  },
  {
    title: "Secure Records",
    text: "Your data is protected with industry-standard security practices.",
    color: "#6610f2",
    image: "/login_img3.png",
  },
];

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      // TODO: wire up to the auth API once available.
      console.log("Login submitted:", values);
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

  return (
    <Container fluid className="min-vh-100 d-flex flex-column py-2 mf-login-bg">
      <Row className="flex-grow-1 g-1">
        <Col md={7} className="d-none d-md-block">
          <Carousel
            variant="dark"
            controls={false}
            className="h-100 mf-carousel"
            fade
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
          <div style={{ width: "100%", maxWidth: "430px" }}>
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold mb-2">Welcome Back</h1>
              <p className="text-muted mb-0">Sign in to continue to MediFlow</p>
            </div>

            <Form onSubmit={formik.handleSubmit}>
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

              <Button
                type="submit"
                variant="dark"
                size="lg"
                className="w-100 rounded-pill fw-semibold"
              >
                Login
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
