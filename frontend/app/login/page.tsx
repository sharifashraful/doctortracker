import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm
        showDemo={process.env.SHOW_DEMO_LOGIN === "true"}
        demoEmail={process.env.ADMIN_EMAIL ?? ""}
        demoPassword={process.env.ADMIN_PASSWORD ?? ""}
      />
    </Suspense>
  );
}
