"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import { FiShield } from "react-icons/fi";
import { supabase } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // 1. Fetch user fields aligning explicitly with your schema
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id, company_id, name, email, password_hash, role, status')
        .eq('email', email)
        .single();

      if (fetchError || !user) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // 2. Strict password validation check
      if (user.password_hash !== password) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // 3. Status boundary check
      if (user.status === 'suspended') {
        setError('This account has been suspended. Please contact your VDR Administrator.');
        setIsLoading(false);
        return;
      }

      setSuccess(`Welcome back, ${user.name}! 🎉`);
      
      // 4. 🔥 SESSION RETENTION GENERATION
      // Stores your real database properties into local browser memory
      localStorage.setItem('vdr_session', JSON.stringify({
        id: user.id,
        company_id: user.company_id,
        name: user.name,
        email: user.email,
        role: user.role
      }));

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect after success
      setTimeout(() => {
        router.push('/documents');
      }, 1500);

    } catch (err) {
      setError('Login failed: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center justify-center gap-3 mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-900 to-slate-800 flex items-center justify-center shadow-md shadow-gray-950/10">
            <FiShield className="text-white text-2xl" strokeWidth={2.8} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Login</h1>
            <p className="text-gray-600 text-sm">Virtual Data Room Access</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-500 mt-1">⚠️</span>
              <div>
                <p className="text-red-800 font-medium text-sm">Login Failed</p>
                <p className="text-red-700 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <p className="text-green-800 font-medium text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900"
                  required 
                />
                <button
                  type="button"
                  onClick={() => { if (!isLoading) setShowPassword(!showPassword); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">Or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="space-y-3">
            <button type="button" disabled={isLoading} className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50">
              <FaGoogle className="text-red-500 text-lg" />
              <span className="text-gray-700 font-medium text-sm">Sign in with Google</span>
            </button>
            <button type="button" disabled={isLoading} className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50">
              <FaFacebook className="text-blue-600 text-lg" />
              <span className="text-gray-700 font-medium text-sm">Sign in with Facebook</span>
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm p-2">
            Don't have an account?{' '}
            <Link href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition">Signup</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">Secure VDR Platform • Encrypted Connection</p>
      </div>
    </div>
  );
}





















// sundaresh code

// "use client";

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
// import { FiShield } from "react-icons/fi";
// import { supabase } from '@/utils/supabase/client';

// export default function LoginPage() {
//   const router = useRouter();
  
//   // Form States
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   // UI States
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setIsLoading(true);

//     try {
//       // Fetch user from Supabase
//       const { data: user, error: fetchError } = await supabase
//         .from('users')
//         .select('id, email, password_hash, name, role')
//         .eq('email', email)
//         .single();

//       if (fetchError || !user) {
//         setError('Invalid email or password');
//         setIsLoading(false);
//         return;
//       }

//       // Simple password comparison
//       // Note: For production, use bcryptjs to compare hashed passwords
//       if (user.password_hash !== password) {
//         setError('Invalid email or password');
//         setIsLoading(false);
//         return;
//       }

//       setSuccess(`Welcome back, ${user.name}! 🎉`);
      
//       // Store user info in localStorage
//       localStorage.setItem('user', JSON.stringify({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }));

//       // Remember me functionality
//       if (rememberMe) {
//         localStorage.setItem('rememberMe', 'true');
//       }

//       // Redirect after success
//       setTimeout(() => {
//         router.push('/documents');
//       }, 1500);

//     } catch (err) {
//       setError('Login failed: ' + err.message);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      
//       {/* Background decoration */}
//       <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
//       <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

//       {/* Login Card */}
//       <div className="relative w-full max-w-md">
        
//         {/* Header */}
//         <div className="flex flex-col items-center justify-center gap-3 mb-8 text-center">
//           <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-900 to-slate-800 flex items-center justify-center shadow-md shadow-gray-950/10">
//             <FiShield className="text-white text-2xl" strokeWidth={2.8} />
//           </div>
//           <div>
//             <h1 className="text-4xl font-bold text-slate-900">Login</h1>
//             <p className="text-gray-600 text-sm">Virtual Data Room Access</p>
//           </div>
//         </div>

//         {/* Form Container */}
//         <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          
//           {/* Error Message */}
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
//               <span className="text-red-500 mt-1">⚠️</span>
//               <div>
//                 <p className="text-red-800 font-medium text-sm">Login Failed</p>
//                 <p className="text-red-700 text-xs mt-1">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Success Message */}
//           {success && (
//             <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
//               <span className="text-green-500 mt-1">✓</span>
//               <p className="text-green-800 font-medium text-sm">{success}</p>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleLogin} className="space-y-5">
            
//             {/* Email Input */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
//                 <input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={isLoading}
//                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password Input */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
//                 <input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   disabled={isLoading}
//                   className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 placeholder-gray-400 text-gray-900"
//                   required 
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </button>
//               </div>
//             </div>

//             {/* Remember Me & Forgot Password */}
//             <div className="flex items-center justify-between text-sm">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   disabled={isLoading}
//                   className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
//                 />
//                 <span className="text-gray-600">Remember me</span>
//               </label>
//               <Link
//                 href="/forgot-password"
//                 className="text-blue-600 hover:text-blue-700 font-medium transition"
//               >
//                 Forgot Password?
//               </Link>
//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {isLoading ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Logging in...
//                 </>
//               ) : (
//                 'Login'
//               )}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="my-5 flex items-center gap-3">
//             <div className="flex-1 h-px bg-gray-200"></div>
//             <span className="text-gray-500 text-sm">Or</span>
//             <div className="flex-1 h-px bg-gray-200"></div>
//           </div>

//           {/* Social Login Buttons */}
//           <div className="space-y-3">
//             <button
//               type="button"
//               disabled={isLoading}
//               className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
//             >
//               <FaGoogle className="text-red-500 text-lg" />
//               <span className="text-gray-700 font-medium text-sm">Sign in with Google</span>
//             </button>

//             <button
//               type="button"
//               disabled={isLoading}
//               className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
//             >
//               <FaFacebook className="text-blue-600 text-lg" />
//               <span className="text-gray-700 font-medium text-sm">Sign in with Facebook</span>
//             </button>
//           </div>

//           {/* Sign Up Link */}
//           <p className="text-center text-gray-600 text-sm p-2">
//             Don t have an account?{' '}
//             <Link href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition">
//               Signup
//             </Link>
//           </p>
//         </div>

//         {/* Footer Info */}
//         <p className="text-center text-xs text-gray-500 mt-6">
//           Secure VDR Platform • Encrypted Connection
//         </p>
//       </div>
//     </div>
//   );
// }