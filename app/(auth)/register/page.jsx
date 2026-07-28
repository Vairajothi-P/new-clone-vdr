"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { FiShield } from "react-icons/fi";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [inviteData, setInviteData] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg("Invalid or missing invitation token.");
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const { data: invite, error: inviteErr } = await supabase
          .from("invitations")
          .select("*, groups(company_id)")
          .eq("token", token)
          .single();

        if (inviteErr || !invite) throw new Error("Invitation not found or expired.");
        if (invite.status !== "pending") throw new Error("This invitation has already been used.");

        setInviteData(invite);
        setEmail(invite.email);

        const { data: company } = await supabase
          .from("companies")
          .select("id, name")
          .eq("id", invite.groups.company_id)
          .single();

        if (company) setCompanyData(company);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: inviteData.email,
        password: password,
      });

      if (authErr) throw authErr;

      const assignedNdaStatus = inviteData.requires_nda ? "pending" : "not_required";
      let userId = authData?.user?.id || crypto.randomUUID();

      // 2. Insert into users table
      const { error: userErr } = await supabase.from("users").insert([
        {
          id: userId,
          company_id: companyData.id,
          name: name.trim(),
          email: inviteData.email,
          password_hash: password,
          role: "user",
          status: "active",
          nda_status: assignedNdaStatus,
        },
      ]);

      if (userErr) {
        console.error("User database insert error:", userErr);
        throw new Error(userErr.message || "Failed to create user account.");
      }

      await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", inviteData.id);

      // THE FORK IN THE ROAD
      if (inviteData.requires_nda) {
        // NDA is required! Keep session temporarily and pass the '?from=register' flag
        localStorage.setItem('vdr_session', JSON.stringify({
          id: userId,
          company_id: companyData.id,
          name: name,
          email: inviteData.email,
          role: "user",
          nda_status: assignedNdaStatus
        }));
        router.push("/sign-nda?from=register"); // <-- Tells NDA page to show Login button at the end
      } else {
        // NDA is OFF. Wipe session and show the success screen with Login button.
        localStorage.removeItem('vdr_session');
        setIsSuccess(true);
      }

    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Validating Invitation...</div>;

  // SUCCESS SCREEN
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--brand)]/10 via-white to-[var(--brand-secondary)]/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-100 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
            <FaCheckCircle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 text-sm mb-6">Your account has been created. You can now log in to access the Virtual Data Room.</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[var(--brand)]/20"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ERROR SCREEN
  if (errorMsg && !inviteData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 max-w-md w-full text-center">
          <FaShieldAlt className="text-rose-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
          <button onClick={() => router.push('/login')} className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand)]/10 via-white to-[var(--brand-secondary)]/10 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand)]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--brand-secondary)]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 mb-8 text-center">
          <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-[var(--brand)]/20">
            <FiShield className="text-white text-2xl" strokeWidth={2.8} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Join {companyData?.name || "Workspace"}</h1>
            <p className="text-gray-600 text-sm mt-1">Register for Virtual Data Room Access</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm border border-gray-100">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <div>
                <p className="text-red-800 font-medium text-sm">Registration Error</p>
                <p className="text-red-700 text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  disabled={true}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand)]/20"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{inviteData?.requires_nda ? "Next: Review Security Terms" : "Complete Registration"}</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

