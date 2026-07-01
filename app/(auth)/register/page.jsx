// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import {
//   FaUser,
//   FaEnvelope,
//   FaPhone,
//   FaLock,
//   FaEye,
//   FaEyeSlash,
//   FaCheckCircle,
// } from "react-icons/fa";
// import { FiShield } from "react-icons/fi";

// export default function RegisterPage() {
//   const [step, setStep] = useState(1);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleOtpChange = (value, index) => {
//     const updatedOtp = [...otp];
//     updatedOtp[index] = value;
//     setOtp(updatedOtp);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
//       <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
//       <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>

//       <div className="relative w-full max-w-md">
//         <div className="flex flex-col items-center gap-3 mb-6 text-center">
//           <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-900 to-slate-800 flex items-center justify-center shadow-md">
//             <FiShield className="text-white text-2xl" />
//           </div>

//           <h1 className="text-4xl font-bold text-slate-900">
//             {step === 1
//               ? "Create Account"
//               : step === 2
//               ? "Verify OTP"
//               : "Success"}
//           </h1>

//           <p className="text-gray-600 text-sm">
//             Secure VDR Registration
//           </p>
//         </div>

//         <div className="flex justify-center mb-6">
//           <div className="flex items-center gap-4">
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-500"}`}>
//               1
//             </div>
//
//             <div className="w-16 h-1 bg-gray-300 rounded"></div>
//
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-500"}`}>
//               2
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-3xl shadow-2xl p-8">

//           {step === 1 && (
//             <div className="space-y-5">

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Full Name
//                 </label>

//                 <div className="relative">
//                   <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="Enter your full name"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Email Address
//                 </label>

//                 <div className="relative">
//                   <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email address"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Mobile Number
//                 </label>

//                 <div className="relative">
//                   <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

//                   <input
//                     type="tel"
//                     name="mobile"
//                     value={formData.mobile}
//                     onChange={handleChange}
//                     placeholder="Enter your mobile number"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Password
//                 </label>

//                 <div className="relative">
//                   <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Create password"
//                     className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2"
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Confirm Password
//                 </label>

//                 <div className="relative">
//                   <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     placeholder="Confirm password"
//                     className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2"
//                   >
//                     {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 onClick={() => setStep(2)}
//                 className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition"
//               >
//                 Continue
//               </button>
//             </div>
//           )}

//           {step === 2 && (
//             <div className="space-y-6">
//               <div className="text-center">
//                 <h2 className="text-xl font-bold text-slate-900">
//                   Email Verification
//                 </h2>

//                 <p className="text-gray-600 mt-2">
//                   Enter the 6-digit OTP sent to your email address
//                 </p>
//               </div>

//               <div className="flex justify-center gap-3">
//                 {otp.map((digit, index) => (
//                   <input
//                     key={index}
//                     maxLength={1}
//                     value={digit}
//                     onChange={(e) => handleOtpChange(e.target.value, index)}
//                     className="w-12 h-12 border border-gray-300 rounded-xl text-center text-xl font-bold"
//                   />
//                 ))}
//               </div>

//               <button
//                 onClick={() => setStep(3)}
//                 className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold"
//               >
//                 Verify OTP
//               </button>
//             </div>
//           )}

//           {step === 3 && (
//             <div className="text-center py-6">
//               <FaCheckCircle className="text-green-500 text-7xl mx-auto" />

//               <h2 className="text-3xl font-bold mt-4 text-slate-900">
//                 Registration Successful
//               </h2>

//               <p className="text-gray-600 mt-2">
//                 Your account has been created successfully.
//               </p>

//               <Link
//                 href="/login"
//                 className="block mt-6 w-full py-3 bg-gray-800 text-white rounded-xl"
//               >
//                 Go To Login
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";
import { FiShield } from "react-icons/fi";

function RegisterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);

  // Invitation Details Storage
  const [invitationDetails, setInvitationDetails] = useState(null);

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Debounced Email Check
  useEffect(() => {
    const checkEmail = async () => {
      // Don't check if empty or if using a token (token emails are already validated/invited)
      if (!formData.email || !!token) return;
      
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle();

      if (data) {
        setEmailError("This email already exists");
      } else {
        setEmailError("");
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, token]);

  // Debounced Mobile Check
  useEffect(() => {
    const checkMobile = async () => {
      if (!formData.mobile) return;
      
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", formData.mobile)
        .maybeSingle();

      if (data) {
        setMobileError("This mobile number already exists");
      } else {
        setMobileError("");
      }
    };

    const timeoutId = setTimeout(checkMobile, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.mobile]);

  // Password Match Check
  useEffect(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);

  // 1. Fetch Invitation Details if token exists in URL
  useEffect(() => {
    const checkInvitation = async () => {
      if (!token) return;

      setLoadingInvite(true);
      try {
        // Fetch invitation joined with groups table to get the target role (group name)
        const { data, error } = await supabase
          .from("invitations")
          .select("*, groups(name, company_id)")
          .eq("token", token)
          .eq("status", "pending")
          .single();

        if (error || !data) {
          alert("Invitation link is invalid, expired, or has already been accepted.");
          return;
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          alert("This invitation link has expired.");
          return;
        }

        // Autofill email and lock it
        setInvitationDetails(data);
        setFormData((prev) => ({
          ...prev,
          email: data.email,
        }));
      } catch (err) {
        console.error("Check invitation error:", err);
      } finally {
        setLoadingInvite(false);
      }
    };

    checkInvitation();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (value, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  const sendOtp = async () => {
    try {
      setIsSendingOtp(true);

      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // SAVE OTP TO DATABASE
      const { data, error } = await supabase
        .from("email_otps")
        .insert({
          email: formData.email,
          otp: generatedOtp,
          expires_at: new Date(
            Date.now() + 5 * 60 * 1000
          ).toISOString(),
          verified: false,
        })
        .select();

      console.log("OTP DATA:", data);
      console.log("OTP ERROR:", error);

      if (error) {
        throw error;
      }
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: generatedOtp,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      alert("OTP sent successfully!");
      setStep(2);

    } catch (error) {
      alert(error.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Perform database user registration and complete invitation status update
  const handleFinalSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const enteredOtp = otp.join("");

      if (!token) {
        const { data: otpRecord } =
          await supabase
            .from("email_otps")
            .select("*")
            .eq("email", formData.email)
            .eq("otp", enteredOtp)
            .eq("verified", false)
            .order("created_at", {
              ascending: false,
            })
            .limit(1)
            .single();

        if (!otpRecord) {
          alert("Invalid OTP");
          return;
        }

        if (
          new Date(
            otpRecord.expires_at
          ) < new Date()
        ) {
          alert("OTP Expired");
          return;
        }

        await supabase
          .from("email_otps")
          .update({
            verified: true,
          })
          .eq("id", otpRecord.id);
      }

      const { data: existingUser } =
        await supabase
          .from("users")
          .select("id")
          .eq("email", formData.email)
          .maybeSingle();

      if (existingUser) {
        alert("Email already registered");
        return;
      }
      // Create Company First
      const {
        data: companyData,
        error: companyError,
      } = await supabase
        .from("companies")
        .insert({
          name: formData.companyName,
          email: formData.email,
          status: "pending",
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      const companyId = companyData.id;

      // Create User
      const {
        data: newUser,
        error: userError,
      } = await supabase
        .from("users")
        .insert({
          company_id: companyId,
          company_name: formData.companyName,

          name: formData.name,
          email: formData.email,
          phone_number: formData.mobile,

          password_hash: formData.password,

          role: "super_admin",
          status: "active",
        })
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      if (userError) {
        throw new Error(userError.message);
      }

      // If registered using an invite token, mark invitation status to 'accepted'
      if (token) {
        await supabase
          .from("invitations")
          .update({ status: "accepted" })
          .eq("token", token);
      }

      // Proceed to success page
      setStep(token ? 2 : 3);
    }
    catch (err) {
      console.error("Registration Error:", err);
      alert("Failed to complete registration: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-900 to-slate-800 flex items-center justify-center shadow-md">
            <FiShield className="text-white text-2xl" />
          </div>

          <h1 className="text-4xl font-bold text-slate-900">
            {step === 1
              ? "Create Account"
              : step === 2
                ? "Verify OTP"
                : "Success"}
          </h1>

          <p className="text-gray-600 text-sm">
            {invitationDetails ? `Accepting Invitation for sector @${invitationDetails.groups.name}` : "Secure VDR Registration"}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-500"}`}>
              1
            </div>

            <div className="w-16 h-1 bg-gray-300 rounded"></div>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${(token ? step >= 2 : step >= 3) ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-500"}`}>
              <FaCheckCircle className={(token ? step >= 2 : step >= 3) ? "text-white" : "text-gray-400"} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          {loadingInvite ? (
            <div className="text-center py-12 text-slate-500 font-semibold animate-pulse">
              Verifying invitation token...
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Company Name
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!!invitationDetails} // Read-only if using invitation token
                        placeholder="Enter your email address"
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-slate-500 ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter your mobile number"
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${mobileError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        required
                      />
                    </div>
                    {mobileError && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{mobileError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{passwordError}</p>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      if (
                        !formData.companyName ||
                        !formData.name ||
                        !formData.email ||
                        !formData.mobile ||
                        !formData.password
                      ) {
                        alert("Please fill all required fields.");
                        return;
                      }

                      if (emailError || mobileError) {
                        alert("Please resolve the errors before continuing.");
                        return;
                      }

                      if (passwordError || formData.password !== formData.confirmPassword) {
                        alert("Passwords do not match.");
                        return;
                      }

                      if (token) {
                        await handleFinalSubmit();
                      } else {
                        await sendOtp();
                      }
                    }}
                    disabled={isSendingOtp}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition"
                  >
                    {isSendingOtp ? "Sending OTP..." : token ? "Verify & Create Account" : "Continue"}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900">
                      Email Verification
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Enter the 6-digit OTP sent to your email address
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        id={`otp-${index}`}
                        key={index}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-xl text-center text-lg sm:text-xl font-bold text-slate-900"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleFinalSubmit}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold"
                  >
                    Verify & Create Account
                  </button>
                </div>
              )}

              {step === (token ? 2 : 3) && (
                <div className="text-center py-6">
                  <FaCheckCircle className="text-green-500 text-7xl mx-auto" />
                  <h2 className="text-3xl font-bold mt-4 text-slate-900">
                    Registration Successful
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Your account has been created successfully.
                  </p>
                  <Link
                    href="/login"
                    className="block mt-6 w-full py-3 bg-gray-800 text-white rounded-xl"
                  >
                    Go To Login
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-semibold">Loading registration form...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
