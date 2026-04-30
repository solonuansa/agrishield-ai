/**
 * Halaman login dan registrasi.
 * Mode: /login → login, /login?mode=register → register
 */
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginPayload, type RegisterPayload } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get("mode") === "register";
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Form state ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // --- Mutations ---
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token);
      navigate("/dashboard");
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err);
      setErrorMessage(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token);
      navigate("/dashboard");
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err);
      setErrorMessage(msg);
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMessage("Nama lengkap wajib diisi");
        return;
      }
      registerMutation.mutate({ email, password, full_name: fullName });
    } else {
      loginMutation.mutate({ email, password });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold text-primary">🌿 AgriShield AI</span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">
            {isRegister ? "Buat akun baru" : "Masuk ke akun Anda"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Tab switch */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <Link
              to="/login"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                !isRegister
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Masuk
            </Link>
            <Link
              to="/login?mode=register"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                isRegister
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Daftar
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Budi Santoso"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="petani@contoh.com"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {isLoading
                ? "Memproses..."
                : isRegister
                ? "Buat Akun"
                : "Masuk"}
            </button>
          </form>

          {!isRegister && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Belum punya akun?{" "}
              <Link to="/login?mode=register" className="text-primary font-medium hover:underline">
                Daftar gratis
              </Link>
            </p>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Atau{" "}
              <Link to="/scan" className="text-primary hover:underline">
                coba tanpa login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function extractErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
  ) {
    return (err as { response: { data: { detail: string } } }).response.data.detail;
  }
  return "Terjadi kesalahan. Silakan coba lagi.";
}
