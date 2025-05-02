import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "trip9 | trip9 Dashboard",
  description: "This is trip9 Signin Page for Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
