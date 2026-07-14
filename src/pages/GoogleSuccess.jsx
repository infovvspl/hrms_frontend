import { useEffect, useRef } from "react";

// ================= DECODE JWT PAYLOAD =================
function decodeJWTPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function GoogleSuccess() {
  // useRef prevents double-execution in React StrictMode
  const handled = useRef(false);

  useEffect(() => {
    // Guard: only run once even in StrictMode (which mounts twice in dev)
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const urlError = params.get("error");

    // ================= BACKEND ERROR =================
    if (urlError || !token) {
      console.error("Google OAuth error:", urlError || "No token in URL");
      window.location.replace("/login");
      return;
    }

    // ================= DECODE JWT =================
    const payload = decodeJWTPayload(token);

    if (!payload) {
      console.error("Failed to decode JWT payload");
      window.location.replace("/login");
      return;
    }

    // ================= BUILD COMPANY OBJECT =================
    const company = {
      id: payload.id,
      company_name: payload.company_name,
      email: payload.email,
      login_type: payload.login_type || "google",
    };

    // ================= SAVE TO LOCALSTORAGE =================
    localStorage.setItem("token", token);
    localStorage.setItem("role", "company");
    localStorage.setItem("company", JSON.stringify(company));
    localStorage.setItem("company_id", company.id);

    // ================= HARD REDIRECT TO DASHBOARD =================
    // Use window.location.replace instead of React Router navigate() to avoid
    // StrictMode double-fire and ensure a clean page load with fresh auth state
    window.location.replace("/dashboard");
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fb]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 bg-white border border-gray-200 shadow-xl rounded-2xl px-10 py-10 flex flex-col items-center gap-5 max-w-sm w-full">
        {/* Google G Icon */}
        <svg className="w-10 h-10" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>

        {/* Spinner */}
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-[#2390ea] animate-spin" />

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Signing you in with Google
          </h2>
          <p className="text-sm text-gray-500">
            Please wait, redirecting to dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}