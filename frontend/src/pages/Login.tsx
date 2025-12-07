"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { signIn, isAuthenticated, checkUserExists } from "../utils/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import LogoutToast from "../components/LogoutToast";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [search] = useSearchParams();
  const next = search.get("next") || "/";
  const nav = useNavigate();

  // Sign In States
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Sign Up States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Password validation states
  const [passLength, setPassLength] = useState(false);
  const [passUpper, setPassUpper] = useState(false);
  const [passLower, setPassLower] = useState(false);
  const [passNumber, setPassNumber] = useState(false);
  const [passSpecial, setPassSpecial] = useState(false);
  const [passNoSpace, setPassNoSpace] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const headline = useMemo(
    () => (mode === "signin" ? "Welcome back" : "Create account"),
    [mode]
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
    setEmailError(null);
    // Reset signup states
    setFirstName("");
    setLastName("");
    setSignupEmail("");
    setOtp("");
    setSentOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setSignupPassword("");
    setOtpTimer(0);
  };

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Validate password in real-time
  useEffect(() => {
    if (signupPassword) {
      setPassLength(signupPassword.length >= 8 && signupPassword.length <= 16);
      setPassUpper(/[A-Z]/.test(signupPassword));
      setPassLower(/[a-z]/.test(signupPassword));
      setPassNumber(/[0-9]/.test(signupPassword));
      setPassSpecial(/[@#$&!]/.test(signupPassword));
      setPassNoSpace(!/\s/.test(signupPassword));
    } else {
      setPassLength(false);
      setPassUpper(false);
      setPassLower(false);
      setPassNumber(false);
      setPassSpecial(false);
      setPassNoSpace(true);
    }
  }, [signupPassword]);

  // Handle name input - only letters and spaces
  const handleNameChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setter(value);
    }
  };

  // Handle Sign In email input - check if user exists
  const handleSignInEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
    setError(null);

    // Real-time check if email exists (only after complete email with .com)
    if (value.trim() && value.endsWith(".com")) {
      if (!checkUserExists(value)) {
        setEmailError(
          "This email is not registered. Please create an account."
        );
      }
    }
  };

  // Handle email input - must end with @gmail.com + check if already exists
  const handleEmailChange = (value: string) => {
    setSignupEmail(value);

    // Check if user already exists (real-time)
    if (value.endsWith("@gmail.com")) {
      if (checkUserExists(value)) {
        showToast("User already exists! Please sign in instead.");
        setError("User already exists");
      } else {
        setError(null);
      }
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    // Validate inputs
    if (!firstName.trim()) {
      showToast("Please enter your first name!");
      return;
    }
    if (!lastName.trim()) {
      showToast("Please enter your last name!");
      return;
    }
    if (!signupEmail.trim()) {
      showToast("Please enter your email!");
      return;
    }
    if (!signupEmail.endsWith("@gmail.com")) {
      showToast("Only @gmail.com emails are allowed!");
      return;
    }

    // Check again before sending OTP
    if (checkUserExists(signupEmail)) {
      showToast("User already exists! Please sign in instead.");
      setError("User already exists");
      return;
    }

    setIsLoading(true);
    try {
      // Generate 6-digit OTP
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      setSentOtp(generatedOtp);

      // Send OTP via Apps Script
      const OTP_SCRIPT_URL = import.meta.env.VITE_OTP_SCRIPT_URL;
      if (!OTP_SCRIPT_URL) {
        throw new Error("OTP service not configured");
      }

      await fetch(OTP_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          otp: generatedOtp,
          name: `${firstName} ${lastName}`,
        }),
      });

      setOtpSent(true);
      setOtpTimer(60); // 60 seconds timer
      showToast("OTP sent to your email!");
    } catch (err) {
      showToast("Failed to send OTP. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (otp !== sentOtp) {
      showToast("Invalid OTP! Please enter correct OTP.");
      return;
    }
    setOtpVerified(true);
    showToast("OTP verified successfully!");
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtp("");
    setSentOtp("");
    setOtpSent(false);
    handleSendOtp();
  };

  // Sign In Submit
  async function submitSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    // Check if email exists first
    if (!checkUserExists(email)) {
      const errMsg = "This email is not registered. Please create an account.";
      setEmailError(errMsg);
      showToast(errMsg);
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn(email, pass);
      showToast(res?.message || "Logged in successfully!");

      setTimeout(() => {
        if (isAuthenticated()) nav(next);
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong!";
      // If credentials are invalid, it means password is wrong (email already checked)
      const displayMsg = msg.includes("Invalid credentials")
        ? "Invalid password. Please try again."
        : msg;
      setError(displayMsg);
      showToast(displayMsg);
      setIsLoading(false);
    }
  }

  // Sign Up Submit
  async function submitSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Final validation
    if (
      !passLength ||
      !passUpper ||
      !passLower ||
      !passNumber ||
      !passSpecial ||
      !passNoSpace
    ) {
      showToast("Please meet all password requirements!");
      return;
    }

    setIsLoading(true);
    try {
      // Import signUp here to avoid circular dependency
      const { signUp } = await import("../utils/auth");
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const res = await signUp(signupEmail, signupPassword, fullName);
      showToast(res?.message || "Welcome to EchoIntellect!");

      setTimeout(() => {
        if (isAuthenticated()) nav(next);
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong!";
      setError(msg);
      showToast(msg);
      setIsLoading(false);
    }
  }

  // Auto-hide toast
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  const allPasswordValid =
    passLength &&
    passUpper &&
    passLower &&
    passNumber &&
    passSpecial &&
    passNoSpace;

  return (
    <div
      className="fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden text-white"
      style={{
        backgroundImage: "url('/Images/LoginBG.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 -z-10" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-white/4 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl shadow-emerald-500/20">
          <div className="p-6">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {headline}
              </h2>
              <p className="text-gray-300 text-sm">
                {mode === "signin"
                  ? "Sign in to access your account"
                  : "Join us and start your journey"}
              </p>
            </div>

            {/* SIGN IN FORM */}
            {mode === "signin" && (
              <form onSubmit={submitSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-100">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="username@gmail.com"
                    required
                    value={email}
                    onChange={(e) => handleSignInEmailChange(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  {emailError && (
                    <p className="text-red-400 text-xs mt-1">{emailError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-100">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    required
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {error && (
                  <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-md disabled:opacity-50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/30"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === "signup" && (
              <form onSubmit={submitSignUp} className="space-y-4">
                {!otpVerified ? (
                  <>
                    {/* First Name */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-100">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="John"
                        required
                        value={firstName}
                        onChange={(e) =>
                          handleNameChange(e.target.value, setFirstName)
                        }
                        disabled={isLoading || otpSent}
                        className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-100">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Doe"
                        required
                        value={lastName}
                        onChange={(e) =>
                          handleNameChange(e.target.value, setLastName)
                        }
                        disabled={isLoading || otpSent}
                        className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-100">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="username@gmail.com"
                        required
                        value={signupEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        disabled={isLoading || otpSent}
                        className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                      {signupEmail && !signupEmail.endsWith("@gmail.com") && (
                        <p className="text-red-400 text-xs mt-1">
                          Only @gmail.com emails are allowed
                        </p>
                      )}
                      {error === "User already exists" && (
                        <p className="text-red-400 text-xs mt-1">
                          This email is already registered. Please sign in
                          instead.
                        </p>
                      )}
                    </div>

                    {/* Send OTP / OTP Input */}
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading || error === "User already exists"}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-md disabled:opacity-50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/30"
                      >
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-gray-100">
                            Enter OTP
                          </label>
                          <input
                            type="text"
                            placeholder="6-digit OTP"
                            required
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center text-lg tracking-widest"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otp.length !== 6}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-md disabled:opacity-50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/30"
                          >
                            Verify OTP
                          </button>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={otpTimer > 0}
                            className="px-4 py-2.5 text-sm rounded-md text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/15 transition-all duration-200 disabled:opacity-50"
                          >
                            {otpTimer > 0 ? `${otpTimer}s` : "Resend"}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Email (Read-only) */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-100">
                        Email
                      </label>
                      <input
                        type="email"
                        value={signupEmail}
                        readOnly
                        className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-100">
                        Create Password
                      </label>
                      <input
                        type="password"
                        placeholder="Create a strong password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 bg-gray-800/40 border border-emerald-500/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-800/40 border border-emerald-500/30 rounded-md p-3 space-y-1.5">
                      <p className="text-xs text-gray-300 font-semibold mb-2">
                        Password Requirements:
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`${
                              passLength ? "text-emerald-400" : "text-gray-400"
                            }`}
                          >
                            {passLength ? "✓" : "○"}
                          </span>
                          <span
                            className={
                              passLength ? "text-emerald-400" : "text-gray-400"
                            }
                          >
                            8-16 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`${
                              passUpper ? "text-emerald-400" : "text-gray-400"
                            }`}
                          >
                            {passUpper ? "✓" : "○"}
                          </span>
                          <span
                            className={
                              passUpper ? "text-emerald-400" : "text-gray-400"
                            }
                          >
                            At least one uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`${
                              passLower ? "text-emerald-400" : "text-gray-400"
                            }`}
                          >
                            {passLower ? "✓" : "○"}
                          </span>
                          <span
                            className={
                              passLower ? "text-emerald-400" : "text-gray-400"
                            }
                          >
                            At least one lowercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`${
                              passNumber ? "text-emerald-400" : "text-gray-400"
                            }`}
                          >
                            {passNumber ? "✓" : "○"}
                          </span>
                          <span
                            className={
                              passNumber ? "text-emerald-400" : "text-gray-400"
                            }
                          >
                            At least one number
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`${
                              passSpecial ? "text-emerald-400" : "text-gray-400"
                            }`}
                          >
                            {passSpecial ? "✓" : "○"}
                          </span>
                          <span
                            className={
                              passSpecial ? "text-emerald-400" : "text-gray-400"
                            }
                          >
                            At least one special character (@#$&!)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`${
                              passNoSpace ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {passNoSpace ? "✓" : "✕"}
                          </span>
                          <span
                            className={
                              passNoSpace ? "text-emerald-400" : "text-red-400"
                            }
                          >
                            No spaces allowed
                          </span>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !allPasswordValid}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-md disabled:opacity-50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/30"
                    >
                      {isLoading ? "Creating account..." : "Sign up"}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Toggle */}
            <div className="mt-4 pt-3 border-t border-gray-700/50 text-center">
              <p className="text-gray-300 text-xs mb-1.5">
                {mode === "signin" ? "New here?" : "Already have an account?"}
              </p>
              <button
                onClick={switchMode}
                disabled={isLoading}
                className="px-5 py-1.5 text-sm rounded-md text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/15 transition-all duration-200 disabled:opacity-50"
              >
                {mode === "signin" ? "Create account" : "Go to sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <LogoutToast
        show={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />

      <style>{`
        html, body {
          overflow: hidden !important;
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
        }
        ::-webkit-scrollbar {
          display: none !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </div>
  );
}
