// types/driver.ts

export interface UserBankDetails {
    pan: string;
    name: string;
    dob?: string;
    phone: string;
  }

  export interface User {
    _id: string;
    role: "user";
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    gender: "male" | "female" | "" | null | undefined;
    experienceInYears: number;
    address: string;
    profilePic?: string;
    isProfileComplete: boolean;
    isProfileVerified: boolean;
    createdAt: string;
    updatedAt: string;
    bankDetails?: UserBankDetails;
    status?: "blocked" | "active";
  }
