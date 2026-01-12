'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog/Dialog';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Label } from '@/components/ui/label/Label';
import { cn } from '@/lib/utils';

type CreateUserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<any>;
  initialData?: Partial<UserFormData>;
};

export interface UserFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  dob?: string;
  phoneNumber?: string;
  fullName?: string;
  accountNumber?: string;
  bankName?: string;
  panNumber?: string;
  image?: File | null;
  imageUrl?: string | null;
  profilePic?: string | null;
  userId: string;
}

export default function CreateUserModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CreateUserModalProps) {
  const [formData, setFormData] = React.useState<UserFormData>({
    userId: initialData?.userId ?? '',
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    mobileNumber: initialData?.mobileNumber ?? '',
    email: initialData?.email ?? '',
    image: (initialData?.image as File) ?? null,
    dob: initialData?.dob ?? '',
    fullName: initialData?.fullName ?? '',
    phoneNumber: initialData?.phoneNumber ?? "",
    panNumber: initialData?.panNumber ?? '',
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const isEditMode = Boolean(initialData && (initialData.userId || initialData.email || initialData.firstName));

  const [errors, setErrors] = React.useState<{
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    phoneNumber: string;
    panNumber: string;
    fullName: string;
  }>({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    phoneNumber: '',
    panNumber: '',
    fullName: ''
  });

  React.useEffect(() => {
    if (!initialData) return;
    setFormData((prev) => ({
      ...prev,
      firstName: initialData.firstName ?? prev.firstName,
      lastName: initialData.lastName ?? prev.lastName,
      mobileNumber: initialData.mobileNumber ?? prev.mobileNumber,
      email: initialData.email ?? prev.email,
      dob: initialData.dob ?? prev.dob,
      accountNumber: initialData.accountNumber ?? prev.accountNumber,
      bankName: initialData.bankName ?? prev.bankName,
      panNumber: initialData.panNumber ?? prev.panNumber,
      image: null,
      imageUrl: initialData.imageUrl ?? initialData.profilePic ?? null,
    }));
  }, [initialData]);

  React.useEffect(() => {
    // prefer file preview if user selected a file
    if (formData.image instanceof File) {
      const url = URL.createObjectURL(formData.image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }

    // otherwise use remote URL if available
    if (formData.imageUrl) {
      setImagePreview(formData.imageUrl);
      return;
    }

    setImagePreview(null);
  }, [formData.image, formData.imageUrl]);


  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    const errorField = field as keyof typeof errors;
    const error = validateField(errorField, value);

    setErrors(prev => ({
      ...prev,
      [errorField]: error
    }));
  };


  const handleFileSelect = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const validateField = (field: keyof typeof errors, value: string): string => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Only letters and spaces allowed';
        if (value.trim().length < 2) return 'First name must be 2+ characters';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Only letters and spaces allowed';
        if (value.trim().length < 2) return 'Last name is required (at least 2 character)';
        return '';
      case 'fullName':
        if (value && !/^[a-zA-Z\s]*$/.test(value)) return 'Only letters and spaces allowed';
        return '';

      case 'mobileNumber':
        if (value && !/^\d*$/.test(value)) return 'Numbers only';
        if (value.length !== 10 && value.length > 0) return 'Exactly 10 digits required';
        return '';

      case 'phoneNumber':
        if (value && !/^\d*$/.test(value)) return 'Numbers only';
        if (value.length !== 10 && value.length > 0) return 'Exactly 10 digits required';
        return '';

      case 'email':
        if (value && !value.includes('@')) return 'Must contain @';
        if (value && !value.includes('.com')) return 'Must end with .com';
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';

      case 'panNumber':
        if (value && !/^[A-Za-z0-9]*$/.test(value)) return 'Letters and numbers only';
        return '';

      default:
        return '';
    }
  };

  const isValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.mobileNumber.length === 10 &&
    formData.email.trim().length > 0 &&
    Object.values(errors).every(error => error === '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true, lastName: true, mobileNumber: true, email: true
    });

    if (!formData.firstName.trim() || !formData.lastName.trim() ||
      formData.mobileNumber.length !== 10 || !formData.email.trim() || !isValid) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);

      setFormData({
        userId: '', firstName: '', lastName: '', mobileNumber: '', email: '',
        image: null, dob: '', fullName: '', phoneNumber: '', panNumber: ''
      });
      setImagePreview(null);
      setTouched({});
      setErrors({
        firstName: '', lastName: '', mobileNumber: '', email: '',
        phoneNumber: '', panNumber: '', fullName: ''
      });
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const initials = `${(formData.firstName || '').slice(0, 1)}${(formData.lastName || '').slice(0, 1)}`.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          `
        max-w-3xl 
        max-h-[90vh] 
        overflow-y-auto 
        px-4
        rounded-xl
        shadow-[0_10px_40px_rgba(0,0,0,0.90)]
        backdrop-blur-sm
        animate-modalIn
      `,
          "bg-white text-gray-900",
          "dark:bg-gray-800 dark:text-gray-100"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {isEditMode ? "Edit User" : "Create User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="order-1 lg:order-1 flex flex-col items-center gap-4 rounded-lg">
              {/* left panel card bg */}
              <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl font-semibold text-gray-600 dark:text-gray-100 overflow-hidden border border-gray-200 dark:border-gray-700"
                    aria-hidden
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initials || "U"}</span>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formData.firstName || formData.lastName
                        ? `${formData.firstName} ${formData.lastName}`
                        : "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Profile image (optional)
                    </p>
                  </div>
                </div>

                <div className="w-full mt-4">
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0] ?? null;
                      if (file && file.type.startsWith("image/")) handleFileSelect(file);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                      setIsDragging(true);
                    }}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    aria-label="Upload profile image; click or drop to upload"
                    className={cn(
                      "w-full flex flex-col items-center justify-between p-3 rounded-lg border-2 transition-shadow  cursor-pointer",
                      // light/dark backgrounds + borders
                      "bg-white dark:bg-gray-700",
                      isDragging
                        ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 shadow-md ring-2 ring-indigo-100 dark:ring-indigo-900"
                        : "border-dashed border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                        {imagePreview ? (
                          <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                        )}
                      </div>

                      <div className="text-sm min-w-0">
                        <div className="font-medium truncate text-gray-900 dark:text-gray-100">
                          {formData.image?.name ?? "Choose an image"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG · up to 5MB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {formData.image && (
                        <div className="flex gap-1 items-center mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileSelect(null);
                              setIsDragging(false);
                            }}
                            className="text-xs px-2 py-1 rounded-md border bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100"
                            aria-label="Remove selected image"
                          >
                            Remove
                          </button>
                          <div className="text-xs text-indigo-600 dark:bg-indigo-600 dark:text-white dark:border dark:rounded-md dark:px-2 dark:py-1 font-medium select-none w-full">
                            Browse
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Right columns: Form fields */}
            <div className="lg:col-span-2 order-2 lg:order-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    onBlur={() => setTouched((s) => ({ ...s, firstName: true }))}
                    placeholder="Enter first name"
                    className={`h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600`}
                    aria-invalid={Boolean(touched.firstName && errors.firstName)}
                    aria-describedby={touched.firstName && errors.firstName ? "err-firstName" : undefined}
                  />
                  {touched.firstName && errors.firstName && (
                    <p id="err-firstName" className="text-xs text-red-600 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={() => setTouched((s) => ({ ...s, lastName: true }))}
                    placeholder="Enter last name"
                    className="h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    aria-invalid={Boolean(touched.lastName && errors.lastName)}
                    aria-describedby={touched.lastName && errors.lastName ? "err-lastName" : undefined}
                  />
                  {touched.lastName && errors.lastName && (
                    <p id="err-lastName" className="text-xs text-red-600 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleChange("mobileNumber", e.target.value)}
                    onBlur={() => setTouched((s) => ({ ...s, mobileNumber: true }))}
                    placeholder="Enter mobile number"
                    className="h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    aria-invalid={Boolean(touched.mobileNumber && errors.mobileNumber)}
                    aria-describedby={touched.mobileNumber && errors.mobileNumber ? "err-mobile" : undefined}
                  />
                  {touched.mobileNumber && errors.mobileNumber && (
                    <p id="err-mobile" className="text-xs text-red-600 mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                    placeholder="Enter email address"
                    className="h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? "err-email" : undefined}
                  />
                  {touched.email && errors.email && (
                    <p id="err-email" className="text-xs text-red-600 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-base font-semibold mt-2 text-gray-900 dark:text-gray-100">
                    Bank Details
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-normal ml-1">(optional)</span>
                  </h3>
                </div>

                <div>
                  <Label htmlFor="dob" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    className="w-full h-11 bg-white  text-gray-900 dark:bg-gray-700 dark:text-gray-100 border  dark:border-gray-600 border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Enter full name"
                    className="h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="Enter phone number"
                    className="h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="panNumber" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    PAN Number
                  </Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => handleChange("panNumber", e.target.value)}
                    placeholder="Enter PAN number"
                    className="h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                  />
                  {errors.panNumber && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{errors.panNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="gray"
                onClick={handleClose}
                className="h-11 px-6 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!isValid || submitting}
                aria-disabled={!isValid || submitting}
              >
                {submitting ? (isEditMode ? "Updating…" : "Saving…") : isEditMode ? "Update User" : "Create User"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
