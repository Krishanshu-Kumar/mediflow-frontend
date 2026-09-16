"use client";

import { useState } from "react";
import { Button, Carousel, Col, Container, Form, Row } from "react-bootstrap";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const SLIDES = [
  {
    title: "Manage Patients",
    text: "Keep every patient record organized and accessible in one place.",
    color: "#0d6efd",
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
    <Container fluid style={{ minHeight: "100vh" }}>
      <Row style={{ minHeight: "100vh" }}>
        <Col md={6} className="d-none d-md-block p-0">
          <Carousel variant="dark" controls={false} className="h-100" fade>
            {SLIDES.map((slide) => (
              <Carousel.Item key={slide.title} className="h-100">
                <div
                  className="d-flex flex-column align-items-center justify-content-center text-center text-white px-4"
                  style={{ height: "100vh", backgroundColor: slide.color }}
                >
                  <h1 className="display-6 fw-bold mb-3">{slide.title}</h1>
                  <p className="mb-0" style={{ maxWidth: "420px" }}>
                    {slide.text}
                  </p>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col
          md={6}
          className="d-flex align-items-center justify-content-center p-4"
        >
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

              <div className="text-end mb-3">
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
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
