"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaShieldAlt, FaCheckCircle } from "react-icons/fa";

export default function SignNdaPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [companyData, setCompanyData] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [ndaAccepted, setNdaAccepted] = useState(false);

    // 1. Fetch User Session and Company NDA on Load
    useEffect(() => {
        const fetchRequiredData = async () => {
            try {
                // Get the user's session from localStorage
                const rawSession = localStorage.getItem("vdr_session");
                if (!rawSession) {
                    throw new Error("No active session found. Please log in again.");
                }
                const session = JSON.parse(rawSession);
                setSessionData(session);

                // Fetch the company's NDA text using the user's company_id
                const { data: company, error: compErr } = await supabase
                    .from("companies")
                    .select("id, name, nda_text")
                    .eq("id", session.company_id)
                    .single();

                if (compErr || !company) {
                    throw new Error("Could not load the Non-Disclosure Agreement for your organization.");
                }

                setCompanyData(company);

            } catch (err) {
                console.error("NDA Fetch Error:", err);
                setErrorMsg(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequiredData();
    }, []);

    // 2. Handle Final Submission (Accepting the NDA)
    const handleAcceptNda = async () => {
        if (!ndaAccepted) return;

        setSubmitting(true);
        setErrorMsg("");

        try {
            // Update the user's status in the database to record the legal acceptance
            const { error: updateErr } = await supabase
                .from("users")
                .update({
                    nda_status: "accepted",
                    nda_accepted_at: new Date().toISOString()
                })
                .eq("id", sessionData.id);

            if (updateErr) throw updateErr;

            // Update the local storage session so they don't get trapped in a loop
            const updatedSession = { ...sessionData, nda_status: "accepted" };
            localStorage.setItem("vdr_session", JSON.stringify(updatedSession));

            // Route to Dashboard!
            router.push("/documents");

        } catch (err) {
            console.error("Failed to accept NDA:", err);
            setErrorMsg("A database error occurred while saving your signature. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-[var(--brand)] rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Loading security agreement...</p>
                </div>
            </div>
        );
    }

    if (errorMsg && !companyData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaShieldAlt size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--brand)]/5 via-[#F8FAFC] to-[var(--brand-secondary)]/5 flex flex-col items-center justify-center p-4">

            <div className="max-w-3xl w-full">

                {/* Header Section */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4">
                        <FaShieldAlt className="text-[var(--brand)] text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Agreement Required</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        You must review and accept the Non-Disclosure Agreement for <span className="text-slate-800 font-bold">{companyData?.name}</span> to access the Virtual Data Room.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                    {errorMsg && (
                        <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <div className="p-8">

                        {/* The NDA Document Viewer */}
                        <div className="relative mb-8">
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-slate-50 to-transparent z-10 pointer-events-none rounded-t-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none rounded-b-2xl"></div>

                            <div className="w-full h-96 overflow-y-auto border-2 border-slate-100 bg-slate-50 rounded-2xl p-8 custom-scrollbar">
                                {/* 🔥 Render the HTML Exactly as the Admin Formatted It 🔥 */}
                                <div
                                    className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-[var(--brand)]"
                                    dangerouslySetInnerHTML={{ __html: companyData?.nda_text || "No terms provided." }}
                                />
                            </div>
                        </div>

                        {/* Acceptance Checkbox Gate */}
                        <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${ndaAccepted
                            ? 'border-[var(--brand)] bg-[var(--brand)]/5'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}>
                            <div className="pt-0.5">
                                <input
                                    type="checkbox"
                                    checked={ndaAccepted}
                                    onChange={(e) => setNdaAccepted(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer transition-colors"
                                />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-slate-800 mb-0.5">
                                    I accept the terms of the Non-Disclosure Agreement
                                </span>
                                <span className="block text-xs text-slate-500 font-medium">
                                    By checking this box, I acknowledge that this is a legally binding digital signature recorded on {new Date().toLocaleDateString()}.
                                </span>
                            </div>
                        </label>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('vdr_session');
                                    router.push('/login');
                                }}
                                className="flex-[1] py-3.5 border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Decline & Logout
                            </button>

                            <button
                                onClick={handleAcceptNda}
                                disabled={!ndaAccepted || submitting}
                                className={`flex-[2] py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${ndaAccepted
                                    ? 'bg-gradient-to-r from-[var(--brand)] to-[var(--brand-secondary)] text-white shadow-lg shadow-[var(--brand)]/20 hover:-translate-y-0.5'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Recording Signature...
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle /> Accept & Enter Workspace
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Legal Footer */}
                <p className="text-center text-xs font-medium text-slate-400 mt-8">
                    Protected by Secure VDR Platform • Digital Signature Audit Active
                </p>

            </div>

            {/* Custom Scrollbar CSS for the document viewer */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
}