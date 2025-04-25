"use client";

import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { selectAuthLoading, setCredentials, setLoading, updateAccessToken } from "@/store/authSlice";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CustomSnackbar from "../CustomSnackbar";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
// import SendEmailAlert from "../ui/alert/SendEmail";

const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
//   acceptTerms: z.literal(true, {
//     errorMap: () => ({ message: "You must accept the terms" }),
//   }),
});

type SignInValues = z.infer<typeof SignInSchema>;

const SignInForm = () => {
    useRedirectIfAuthenticated();
  const router = useRouter();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const [formValues, setFormValues] = useState<SignInValues>({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SignInValues, string>>>({});
//   const [loading, setLoading] = useState(false);
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

    const result = SignInSchema.safeParse(formValues);

    if (!result.success) {
      const errors: Partial<Record<keyof SignInValues, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignInValues;
        errors[field] = err.message;
      });
      setFormErrors(errors);
    //   setLoading(false);
      return;
    }

    try {
        dispatch(setLoading(true));
        console.log(formValues);

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/login`, {
        email: formValues.email,
        password: formValues.password,
      });

      const userData = res.data;

      if (res.status === 200) {
        const payload = {
            user: {
                id: userData?.data.id,
                email: userData?.data.email,
                firstName: userData?.data.firstName,
                role: userData?.data.role,
              },
              accessToken: userData?.token,
        }
        console.log("payload", payload);

        dispatch(setCredentials(payload));
        showFeedback("Login successful!", "success");
        router.push("/");
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Login failed";
      setFormErrors((prev) => ({ ...prev, email: msg }));
      showFeedback(msg, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };


  const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };


    async function handleForgot(email: string){
        console.log("email to forgot", email);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/forgot-password`, {email});
            const resData = res.data;
            console.log(resData);
            dispatch(updateAccessToken(resData?.resetToken));

            //* Here I need to call send email alert based on resData message
            showFeedback(resData?.message || "Email sent successfully", "success");

        } catch (error: unknown) {
            console.log(error);

            const msg = axios.isAxiosError(error) && error.response?.data?.message
                ? (error.message || error.response.data.message)
                : "Login failed";
                console.log(msg);

            setFormErrors((prev) => ({ ...prev, email: msg }));
            showFeedback(msg, "error");
            }
    }

  return (
    <>

    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <TextField
                label="Email"
                name="email"
                type="email"
                variant="filled"
                fullWidth
                required
                value={formValues.email}
                onChange={handleChange}
                helperText={formErrors.email}
              />

              <div className="my-4">
                <div className="relative">
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    variant="filled"
                    fullWidth
                    value={formValues.password}
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

              <div className="flex items-center justify-between">
                {/* <div className="flex items-center gap-3">
                  <Checkbox
                    name="acceptTerms"
                    checked={formValues.acceptTerms}
                    onChange={handleChange}
                  />
                  <span className="text-theme-sm text-gray-700 dark:text-gray-400">
                    Accept the terms and conditions
                  </span>
                </div> */}
                <button type="button" onClick={handleClickOpen}  className="text-sm text-brand-500 hover:text-brand-600">
                  Forgot password?
                </button>
              </div>

              <button
                disabled={loading}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Dialog
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              component: 'form',
              onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries((formData as any).entries());
                const email = formJson.email;
                handleForgot(email);
                handleClose();
              },
            },
          }}
        >
          <DialogTitle>Email Verification</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Verify your email to reset the password
            </DialogContentText>

            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <button onClick={handleClose} className="bg-gray-900 text-slate-50 p-1 px-2 rounded-sm" >Cancel</button>
            <button type="submit" className="bg-blue-900 text-slate-50 p-1 px-2 rounded-sm" >Send email</button>
          </DialogActions>
        </Dialog>
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

export default SignInForm;
