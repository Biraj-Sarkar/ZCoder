import React, { useState } from "react";
import logo from "../assets/zcoder-logo.png";
import "../styles/login-styles.css";
import SvgIcon from "@mui/material/SvgIcon";
import { Link, useNavigate } from "react-router-dom";

function GoogleIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </SvgIcon>
  );
}

export default function Login() {
  const [tab, setTab] = useState(0);
  const [loginData, setLoginData] = useState({
    loginId: "", // Combined field for username or email
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state
    const { loginId, password } = loginData;

    if (!loginId || !password) {
      setError("Please enter both username/email and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await res.json(); // Parse the JSON response
      localStorage.setItem("username", data.user.username); // Store the username
      alert(`Login successful! Redirecting to dashboard...`);
      navigate("/home");
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login would be initiated here");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const email = prompt(
      "Please enter your email address to reset your password:"
    );
    if (email) {
      alert(`Password reset link would be sent to: ${email}`);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src={logo} alt="Z Coder Logo" className="login-logo" />
      </div>
      <div className="login-right">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>
        <div className="login-form">
          <div className="form-tabs">
            <button
              className={`tab-button ${tab === 0 ? "active" : ""}`}
              onClick={() => setTab(0)}
            >
              Username
            </button>
            <button
              className={`tab-button ${tab === 1 ? "active" : ""}`}
              onClick={() => setTab(1)}
            >
              Email
            </button>
          </div>
          {error && (
            <div
              role="alert"
              style={{
                color: "red",
                fontWeight: "600",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div className={`tab-content ${tab === 0 ? "active" : ""}`}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="loginId">Username</label>
                <input
                  type="text"
                  id="loginId"
                  name="loginId"
                  value={loginData.loginId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="login-button" type="submit">
                Sign In
              </button>
            </form>
          </div>

          <div className={`tab-content ${tab === 1 ? "active" : ""}`}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="loginId">Email</label>
                <input
                  type="email"
                  id="loginId"
                  name="loginId"
                  value={loginData.loginId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password-email">Password</label>
                <input
                  type="password"
                  id="password-email"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                className="login-button"
                type="submit"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#333")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#111")
                }
              >
                Sign In
              </button>
            </form>
          </div>

          <div className="forgot-password">
            <a href="#" onClick={handleForgotPassword}>
              Forgot your password?
            </a>
          </div>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button
              className="social-button google"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon className="social-icon" />
              Continue with Google
            </button>
          </div>

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
