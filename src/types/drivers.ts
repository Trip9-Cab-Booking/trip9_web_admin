// types/driver.ts

export interface DriverBankDetails {
    pan: string;
    name: string;
    dob?: string;
    phone: string;
  }

  export interface Driver {
    _id: string;
    role: "driver";
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    gender: "male" | "female" | "other";
    dob: string;
    experienceInYears: number;
    address: string;
    profileImage?: string;
    idProofImage: string;
    drivingLicenseImage: string;
    isProfileComplete: boolean;
    isProfileVerified: boolean;
    createdAt: string;
    updatedAt: string;
    bankDetails?: DriverBankDetails;
    status?: "approved" | "pending" | "rejected";
  }
