"use client";

import React from "react";
import { ShieldCheck, Activity, Users, FileText, Lock } from "lucide-react";

export default function ControlAuditsPage() {
    return (
        <div className="min-h-screen p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[var(--brand)]" />
                        Control & Audits
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Monitor compliance, track user activities, and review system audit logs.
                    </p>
                </div>

                {/* Dashboard Grid Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Activity Logs */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-lg">Activity Logs</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Review platform-wide user actions and Q&A interactions.
                        </p>
                    </div>

                    {/* User Actions */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-lg">User Actions</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Track login history, session durations, and user profile changes.
                        </p>
                    </div>

                    {/* Document Access */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-lg">Document Access</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Audit document viewing, downloading, printing, and redactions.
                        </p>
                    </div>

                    {/* Security Events */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-lg">Security Events</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Monitor permission alterations, role changes, and system alerts.
                        </p>
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center mt-12">
                    <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">Audit Data Under Construction</h2>
                    <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
                        This module is a placeholder. In future iterations, this interface will aggregate existing database tables (such as <code>documentAccessLogs</code>, <code>loginHistory</code>, <code>documentEditLogs</code>, and <code>qnaActivityLogs</code>) to provide comprehensive security oversight.
                    </p>
                </div>

            </div>
        </div>
    );
}
