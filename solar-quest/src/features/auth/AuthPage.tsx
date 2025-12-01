// Authentication Page - Login & Register
import { useState, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGameManager } from "@/core/engine/GameContext";
import { Loader2, Rocket, Mail, Lock, User, AlertCircle } from "lucide-react";
import Galaxy from "@/ui/Galaxy";

// Memoize Galaxy to prevent re-renders
const MemoizedGalaxy = memo(Galaxy);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, loginWithGoogle, authError, clearAuthError } =
    useAuth();
  const { setScene } = useGameManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    clearAuthError();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          alert("Vui lòng nhập tên hiển thị");
          setIsLoading(false);
          return;
        }
        await register(email, password, displayName);
      }
    } catch {
      // Error đã được set trong AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearAuthError();
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // Error đã được set trong AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize Galaxy props để tránh re-render
  const galaxyConfig = useMemo(
    () => ({
      density: 0.5,
      speed: 0.3,
      glowIntensity: 0.8,
      mouseInteraction: false, // Tắt mouse interaction để tăng performance
    }),
    []
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-blue-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background - Memoized */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <MemoizedGalaxy {...galaxyConfig} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Auth Container - Split Layout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
      >
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden lg:flex flex-col justify-center space-y-4 px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.3 }}
            className="inline-block"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 rotate-12 hover:rotate-0 transition-transform duration-500">
              <Rocket className="w-12 h-12 text-white -rotate-12" />
            </div>
          </motion.div>

          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              Solar Quest
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Khám phá hệ mặt trời, chinh phục các hành tinh, và trở thành nhà
              thám hiểm vũ trụ huyền thoại!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: "🌍", label: "10 Planets" },
              { icon: "🎯", label: "Quiz Game" },
              { icon: "🏆", label: "Leaderboard" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs text-gray-300 font-medium">
                  {feature.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full"
        >
          <div className="bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 lg:p-8 shadow-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/50">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Solar Quest
              </h1>
            </div>

            {/* Toggle Login/Register */}
            <div className="flex gap-2 mb-4 bg-white/5 rounded-xl p-1.5 border border-white/10">
              <button
                onClick={() => {
                  setIsLogin(true);
                  clearAuthError();
                }}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  isLogin
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  clearAuthError();
                }}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  !isLogin
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-4 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl flex items-start gap-3 text-red-300"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-200 text-sm mb-1">
                      Đăng nhập thất bại
                    </p>
                    <p className="text-sm leading-relaxed">{authError}</p>
                  </div>
                  <button
                    onClick={() => clearAuthError()}
                    className="text-red-300 hover:text-red-100 transition-colors"
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Display Name (Register only) */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tên hiển thị
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/10 hover:border-white/20 transition-all"
                        placeholder="Nhập tên của bạn"
                        required={!isLogin}
                        autoComplete="name"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/10 hover:border-white/20 transition-all"
                    placeholder="email@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/10 hover:border-white/20 transition-all"
                    placeholder={
                      isLogin ? "Nhập mật khẩu" : "Tối thiểu 6 ký tự"
                    }
                    required
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 hover:from-cyan-700 hover:via-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-bold text-base shadow-lg shadow-cyan-500/50 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Đăng nhập" : "Đăng ký"}</span>
                    <Rocket className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <span className="text-gray-400 text-sm font-medium">hoặc</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Google Sign In */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed border-2 border-white/20 hover:border-white/30 rounded-xl text-white font-semibold shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Đăng nhập với Google</span>
            </motion.button>

            {/* Guest Mode Link */}
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Hoặc{" "}
                <button
                  onClick={() => {
                    // Chơi với chế độ khách - vào MainMenu
                    setScene("menu", { guestMode: true });
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                >
                  chơi với chế độ khách
                </button>
              </p>
              <p className="text-gray-600 text-xs mt-2">
                (Tiến độ sẽ không được lưu trên cloud)
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-gray-500 text-sm">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <a
            href="#"
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
          >
            Điều khoản sử dụng
          </a>
        </p>
      </div>
    </div>
  );
}
