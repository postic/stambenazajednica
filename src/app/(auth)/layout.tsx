import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import OnboardingModal from "@/components/onboarding-modal"

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      {/* Onboarding mora biti ovde */}
      <OnboardingModal />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {children}
      </div>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}
