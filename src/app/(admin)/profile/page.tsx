"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Camera,
  ArrowLeft,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import CustomSnackbar from "@/components/CustomSnackbar";

interface ProfileState {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  avatarFile: File | null;
  avatarPreview: string | null;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileState>({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    avatarFile: null,
    avatarPreview: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/profile");
        const data = res?.data?.data;

        setProfile((prev) => ({
          ...prev,
          name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
          email: data.email ?? "",
          phone: data.phone ?? "",
          avatar: data.profilePic ?? null,
          avatarPreview: data.profilePic ?? null,
          avatarFile: null,
        }));

        setSnackbar({
          open: true,
          message: "Profile loaded successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);

        setSnackbar({
          open: true,
          message: "Failed to load profile",
          severity: "error",
        });
      }
    };

    fetchProfile();
  }, []);


  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const [firstName, ...lastNameParts] = profile.name.trim().split(" ");
      const lastName = lastNameParts.join(" ");

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);

      if (profile.avatarFile) {
        formData.append("profilePic", profile.avatarFile);
      }

      await axiosInstance.put("/api/admin/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsEditing(false);
      setProfile((prev) => ({
        ...prev,
        avatar: prev.avatarPreview || prev.avatar,
        avatarFile: null,
      }));

      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Profile update failed:", error);

      setSnackbar({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    }
  };


  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setSnackbar({
        open: true,
        message: "All fields are required",
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "New password and confirm password do not match",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.put("/api/admin/update-password", {
        currentPassword: oldPassword,
        newPassword,
        confirmPassword,
      });

      setShowResetModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSnackbar({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Password update failed:", error);

      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message || "Failed to update password",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotModal(false);
    setResetEmail("");
    alert("Password reset link (simulated) sent to your email!");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setProfile((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: preview,
    }));
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Information Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Personal Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-800 dark:hover:bg-blue-700"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="relative h-24 w-24 rounded-full bg-blue-100 dark:bg-gray-700 overflow-hidden">
                    {profile.avatarPreview ? (
                      <Image
                        src={profile.avatarPreview}
                        alt="Avatar"
                        fill
                        className="object-cover rounded-full"
                        sizes="96px"
                        priority={false}
                      />
                    ) : (
                      <User className="h-12 w-12 text-blue-900 dark:text-gray-100" />
                    )}
                  </div>

                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-900 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profile.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Administrator</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <User className="inline h-4 w-4" />
                      Full name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Mail className="inline h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Phone className="inline h-4 w-4" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Phone"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-800 dark:hover:bg-blue-700"
                    >
                      Save changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Security Settings
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors group bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Update Password
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Change your account password
                      </p>
                    </div>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background blur layer */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowResetModal(false)}
          />

          {/* Modal content (stays sharp) */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-4">Update Password</h3>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Current password
                </label>
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg pr-10 bg-white dark:bg-gray-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showOld ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  New password
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg pr-10 bg-white dark:bg-gray-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Confirm new password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg pr-10 bg-white dark:bg-gray-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-4">Forgot Password</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />

    </div>
  );
};

export default Profile;
