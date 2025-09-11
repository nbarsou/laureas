import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

const RegisterPage = () => {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
};

export default RegisterPage;
