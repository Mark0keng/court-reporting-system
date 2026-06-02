import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useSnackbar } from "../../context/SnackbarContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { callAPI, urls } from "../../services/api.js";
import Input from "../../components/Input/Input.js";
import Button from "../../components/Button/Button.js";
import { Gavel, ArrowRight } from "lucide-react";
import "./Login.scss";

interface LoginFormInput {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>();

  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await callAPI(urls.login, "POST", {
        email: data.email,
        password: data.password,
      });

      if (response && response.success) {
        const { token, user } = response.data;
        login(token, user);
        showSnackbar(`Welcome back, ${user.name}!`, "success");
        navigate("/", { replace: true });
      } else {
        showSnackbar(
          response.message || "Login failed, please check your credentials.",
          "error",
        );
      }
    } catch (error: any) {
      showSnackbar(
        error.message || "A system error occurred during login.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Dynamic Background Glows */}
      <div className="login-bg-glow-1"></div>
      <div className="login-bg-glow-2"></div>

      {/* Main Login Card */}
      <div className="login-card-wrapper animate-fade-in">
        <div className="login-card">
          {/* Logo & Brand */}
          <div className="login-brand-header">
            <div className="login-logo-ring">
              <div className="login-logo">
                <Gavel />
              </div>
            </div>
            <h1 className="login-title">COURT CRS</h1>
            <p className="login-subtitle">
              Supreme Court Court Reporting System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="login-input-group">
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                className="login-input-field"
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format",
                  },
                })}
              />
            </div>

            <div className="login-input-group">
              <Input
                label="Password"
                type="password"
                error={errors.password?.message}
                className="login-input-field"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="login-submit-btn w-full"
              icon={<ArrowRight size={18} />}
            >
              Log In to Portal
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
