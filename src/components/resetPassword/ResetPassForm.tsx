"use client";


import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { selectAccessToken, updateAccessToken } from "@/store/authSlice";
import CustomSnackbar from "../CustomSnackbar";
import { useAuthGuard } from "@/hooks/useAuthGaurd";

const ResetSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Confirm password required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInValues = z.infer<typeof ResetSchema>;

const ResetPasswordForm = () => {
    useAuthGuard();
  const router = useRouter();
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);

  const [formValues, setFormValues] = useState<SignInValues>({
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SignInValues, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // New states for alert/snackbar
      const [alertMessage, setAlertMessage] = useState("");
      const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");
      const [showAlert, setShowAlert] = useState(false);

      const showFeedback = (message: string, severity: "success" | "error" | "info" = "info") => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setShowAlert(true);
      };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    const result = ResetSchema.safeParse(formValues);

    if (!result.success) {
      const errors: Partial<Record<keyof SignInValues, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignInValues;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
        console.log(formValues);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/reset-password`, {
              newPassword: formValues.password,
              token: accessToken!,
            });

      const result = res.data;
      console.log("result from reset: ", result );
      showFeedback(result?.message || "Email sent successfully", "success");

      if (res.status === 200) {
        dispatch(updateAccessToken(null));
        router.push("/signin");
      }
    } catch (error: unknown) {
        console.log(error);
        const msg = axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Login failed";
        showFeedback(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              ResetPassword
            </h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6 flex flex-col gap-4">
              <TextField
                label="Password"
                name="password"
                type="password"
                variant="filled"
                fullWidth
                value={formValues.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />

              <div>
                {/* <label>Password <span className="text-error-500">*</span></label> */}
                <div className="relative">
                  <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    variant="filled"
                    fullWidth
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                  </span>
                </div>
              </div>
              <button
                disabled={loading}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Reset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <CustomSnackbar
        open={showAlert}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setShowAlert(false)}
        />
    </>
  );
};

export default ResetPasswordForm;
