"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaShieldAlt, FaBuilding } from "react-icons/fa";
import { FiShield } from "react-icons/fi";

// =========================================================================
// 1. INVITE REGISTRATION COMPONENT (FOR USERS WITH A TOKEN)
// =========================================================================
function InviteRegisterContent({ token }) {
  const router = useRouter();

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

      if (userErr) throw new Error(userErr.message || "Failed to create user account.");

      await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", inviteData.id);

      // THE FORK IN THE ROAD
      if (inviteData.requires_nda) {
        localStorage.setItem('vdr_session', JSON.stringify({
          id: userId,
          company_id: companyData.id,
          name: name,
          email: inviteData.email,
          role: "user",
          nda_status: assignedNdaStatus
        }));
        router.push("/sign-nda?from=register");
      } else {
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type="email"
                  value={email}
                  disabled={true}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none transition disabled:bg-gray-100 text-gray-900 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
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
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
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
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg"
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


// =========================================================================
// 2. COMPANY REGISTRATION COMPONENT (NO TOKEN)
// =========================================================================
function CompanyRegisterContent() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [otpCode, setOtpCode] = useState("");
  const MOCK_OTP = "123456";

  const [selectedPlanId, setSelectedPlanId] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data || []);
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!companyName.trim() || !adminName.trim() || !adminEmail.trim() || !phone.trim()) {
      setErrorMsg("Please fill in all required fields.");
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
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim() }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (otpCode.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit code.");
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), otp: otpCode }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP code");
      
      setStep(3);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim(),
          phone: phone.trim(),
          password,
          planId: selectedPlanId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register company.");
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--brand)]/10 via-white to-[var(--brand-secondary)]/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-100 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
            <FaCheckCircle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Your VDR account is currently pending executive approval. You will be notified once our team reviews your request.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand)]/10 via-white to-[var(--brand-secondary)]/10 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand)]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--brand-secondary)]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className={`relative w-full ${step === 3 ? "max-w-4xl" : "max-w-lg"}`}>
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 mb-8 text-center">
          <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-[var(--brand)]/20">
            <FiShield className="text-white text-2xl" strokeWidth={2.8} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              {step === 1 && "Get Started"}
              {step === 2 && "Verify Email"}
              {step === 3 && "Select a Plan"}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {step === 1 && "Register your organization for VDR Access"}
              {step === 2 && `We sent a code to ${adminEmail}`}
              {step === 3 && "Choose the right capacity for your organization"}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-6">
          <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-[var(--brand)]' : 'bg-gray-200'}`}></div>
          <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-[var(--brand)]' : 'bg-gray-200'}`}></div>
          <div className={`h-1.5 w-12 rounded-full ${step >= 3 ? 'bg-[var(--brand)]' : 'bg-gray-200'}`}></div>
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

          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization Name</label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={submitting}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                  />
                </div>
              </div>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Admin Details</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    disabled={submitting}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={submitting}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">📞</span>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
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
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
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

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
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
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900 text-sm"
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send OTP Verification</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-4">
                <div className="text-5xl mb-4 text-slate-300">📧</div>
                <p className="text-slate-600 text-sm">Please enter the 6-digit verification code sent to <strong className="text-slate-900">{adminEmail}</strong>.</p>
                <p className="text-amber-600 text-xs mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100 inline-block">If you didn't configure SMTP, check the terminal console for the OTP.</p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  disabled={submitting}
                  required
                  className="w-full text-center text-3xl tracking-[0.5em] py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition disabled:bg-gray-100 placeholder-gray-300 font-mono text-slate-900"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold rounded-xl transition-all duration-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || otpCode.length !== 6}
                  className="flex-1 py-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Plan Selection */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {loadingPlans ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Loading subscription plans...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-500 font-medium">No plans available.</p>
                  <p className="text-sm text-red-400 mt-2">Please contact support.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden p-6 flex flex-col items-center text-center
                          ${selectedPlanId === plan.id 
                            ? 'border-[var(--brand)] shadow-xl shadow-[var(--brand)]/20 bg-[var(--brand)]/5 scale-[1.02]' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'}`}
                      >
                        {selectedPlanId === plan.id && (
                          <div className="absolute top-4 right-4 text-[var(--brand)] animate-in zoom-in duration-300">
                            <FaCheckCircle className="text-xl" />
                          </div>
                        )}
                        <h3 className={`text-xl font-bold mb-2 ${selectedPlanId === plan.id ? 'text-[var(--brand)]' : 'text-slate-900'}`}>
                          {plan.name}
                        </h3>
                        <div className="w-12 h-1 bg-gray-200 rounded-full my-4"></div>
                        <p className="text-3xl font-black text-slate-900 mb-1">
                          {plan.storage_limit_mb >= 1024 && plan.storage_limit_mb % 1024 === 0 ? (
                            <>
                              {plan.storage_limit_mb / 1024}
                              <span className="text-base font-semibold text-slate-500">GB</span>
                            </>
                          ) : (
                            <>
                              {plan.storage_limit_mb}
                              <span className="text-base font-semibold text-slate-500">MB</span>
                            </>
                          )}
                        </p>
                        <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-wider">Total Storage</p>
                        
                        <div className="w-full bg-slate-50 py-3 rounded-lg border border-slate-100 mt-auto">
                          <p className="text-sm font-semibold text-slate-700 flex items-center justify-center gap-2">
                            <FaUser className="text-slate-400" />
                            Up to {plan.users_limit} Users
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center max-w-sm mx-auto">
                    <button
                      type="submit"
                      disabled={submitting || !selectedPlanId}
                      className="w-full py-4 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] hover:shadow-lg hover:shadow-[var(--brand)]/30 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 text-lg"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Finalizing...</span>
                        </>
                      ) : (
                        <span>Complete Registration</span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Login Link (Only show on Step 1) */}
          {step === 1 && (
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already registered?{" "}
                <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. MAIN COMPONENT (SWITCHES BASED ON TOKEN)
// =========================================================================
function RegisterController() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If token exists, use the INVITE flow.
  // Otherwise, use the COMPANY REGISTRATION flow.
  if (token) {
    return <InviteRegisterContent token={token} />;
  }

  return <CompanyRegisterContent />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading...</div>}>
      <RegisterController />
    </Suspense>
  );
}
