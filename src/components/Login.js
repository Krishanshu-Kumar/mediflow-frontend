"use client";

import { useState } from "react";
import { Button, Carousel, Col, Container, Form, Row } from "react-bootstrap";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

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
  },
  {
    title: "Secure Records",
    text: "Your data is protected with industry-standard security practices.",
    color: "#6610f2",
  },
];

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    // TODO: wire up to the auth API once available.
    console.log("Login submitted:", formData);
  };

  return (
    <Container fluid className="min-vh-100 d-flex flex-column py-2">
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

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <Form onSubmit={handleSubmit}>
              <div className="mf-field mb-3">
                <span className="mf-field-icon">
                  <FiMail size={20} />
                </span>
                <div className="mf-field-body">
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="mf-field-input"
                  />
                  <label htmlFor="login-email" className="mf-field-label">
                    Email
                  </label>
                </div>
              </div>

              <div className="mf-field mb-4">
                <span className="mf-field-icon">
                  <FiLock size={20} />
                </span>
                <div className="mf-field-body">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="mf-field-input"
                  />
                  <label htmlFor="login-password" className="mf-field-label">
                    Password
                  </label>
                </div>
                <button
                  type="button"
                  className="mf-field-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
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
