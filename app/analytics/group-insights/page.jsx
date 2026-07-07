"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  LogIn, Download, Eye, FileSearch, MessageCircleQuestion,
  RefreshCw, CalendarDays, ChevronDown, SlidersHorizontal, X
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";

// ─── All 5 series from the screenshot ─────────────────────────────────────────
const SERIES = [
  { key: "logins",     label: "Total Login Occurrences",       color: "#f87171" },
  { key: "questions",  label: "Total Questions Asked",          color: "#60a5fa" },
  { key: "fenceViews", label: "Total Fence Document Views",     color: "#fbbf24" },
  { key: "docViews",   label: "Total Document Views",           color: "#5eead4" },
  { key: "downloads",  label: "Total Document Downloads",       color: "#34d399" },
];

// ─── SVG Line Chart with hover tooltip ────────────────────────────────────────
function LineChart({ data, groupName }) {
  const W = 900, H = 260, PL = 48, PR = 16, PT = 16, PB = 40;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  // max across ALL series
  const maxVal = useMemo(() => {
    let m = 1;
    data.forEach(d => SERIES.forEach(s => { if ((d[s.key] || 0) > m) m = d[s.key]; }));
    return Math.ceil(m / 5) * 5 || 10;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data found for the selected period
      </div>
    );
  }

  const xStep = chartW / Math.max(data.length - 1, 1);

  // Smooth cubic bezier path for a given series key
  const getPath = (key) => {
    if (data.length === 0) return "";
    const pts = data.map((d, i) => ({
      x: PL + i * xStep,
      y: PT + chartH - ((d[key] || 0) / maxVal) * chartH,
    }));
    let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX = ((prev.x + curr.x) / 2).toFixed(1);
      path += ` C ${cpX} ${prev.y.toFixed(1)}, ${cpX} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
    return path;
  };

  const yTicks = [];
  const step = Math.ceil(maxVal / 5);
  for (let v = 0; v <= maxVal; v += step) yTicks.push(v);

  // Find nearest data point on mouse move
  const handleMouseMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const chartMouseX = mouseX - PL;
    const idx = Math.round(chartMouseX / xStep);
    if (idx < 0 || idx >= data.length) return;

    const point = data[idx];
    const svgX = PL + idx * xStep;
    const svgY = PT + chartH - (point.logins / maxVal) * chartH;

    // Convert SVG coords to screen coords for tooltip positioning
    const screenX = rect.left + (svgX / W) * rect.width;
    const screenY = rect.top + (svgY / H) * rect.height;

    setTooltip({ screenX, screenY, point });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full cursor-crosshair"
        style={{ minHeight: 220 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        {yTicks.map(v => {
          const y = PT + chartH - (v / maxVal) * chartH;
          return (
            <g key={v}>
              <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text x={12} y={PT + chartH / 2} textAnchor="middle" fontSize="10" fill="#94a3b8"
          transform={`rotate(-90, 12, ${PT + chartH / 2})`}>
          Occurrences
        </text>

        {/* X-axis date labels */}
        {data.map((d, i) => {
          const showEvery = Math.ceil(data.length / 8);
          if (i % showEvery !== 0 && i !== data.length - 1) return null;
          const x = PL + i * xStep;
          return (
            <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {d.date.slice(5)}
            </text>
          );
        })}

        {/* Area fill for logins only */}
        <path
          d={`${getPath("logins")} L ${(PL + (data.length - 1) * xStep).toFixed(1)} ${PT + chartH} L ${PL} ${PT + chartH} Z`}
          fill="#f87171"
          opacity="0.06"
        />

        {/* All 5 series lines */}
        {SERIES.map(s => (
          <path
            key={s.key}
            d={getPath(s.key)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.9"
          />
        ))}

        {/* Dots for active (non-zero) data points on logins */}
        {data.map((d, i) => {
          if (!d.logins) return null;
          const x = PL + i * xStep;
          const y = PT + chartH - (d.logins / maxVal) * chartH;
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#f87171" opacity="0.9" />;
        })}

        {/* Hover vertical line */}
        {tooltip && (() => {
          const svg = svgRef.current;
          if (!svg) return null;
          const rect = svg.getBoundingClientRect();
          const scaleX = W / rect.width;
          const idx = data.findIndex(d => d === tooltip.point);
          if (idx < 0) return null;
          const x = PL + idx * xStep;
          return (
            <line
              x1={x} x2={x} y1={PT} y2={PT + chartH}
              stroke="#f87171" strokeWidth="1" strokeDasharray="4,3" opacity="0.5"
            />
          );
        })()}
      </svg>

      {/* Floating Tooltip Card */}
      {tooltip && tooltip.point.logins > 0 && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.screenX + 14, top: tooltip.screenY - 10 }}
        >
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[180px] max-w-[240px]">
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <span className="text-[11px] font-bold text-gray-700">{tooltip.point.date}</span>
              <span className="text-[11px] font-bold text-rose-500">
                {tooltip.point.logins} login{tooltip.point.logins > 1 ? "s" : ""}
              </span>
            </div>

            {/* Group name */}
            {groupName && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] inline-block" />
                <span className="text-[11px] text-gray-500 font-medium">{groupName}</span>
              </div>
            )}

            {/* Users who logged in */}
            <div className="flex flex-col gap-1">
              {(tooltip.point.users || []).slice(0, 5).map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
                    {(u.name || u.email || "?")[0]}
                  </div>
                  <span className="text-[11px] text-gray-700 truncate">{u.name || u.email || "Unknown"}</span>
                </div>
              ))}
              {(tooltip.point.users || []).length > 5 && (
                <span className="text-[10px] text-gray-400 mt-0.5">
                  +{tooltip.point.users.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GroupInsightsPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [showGroupDrop, setShowGroupDrop] = useState(false);

  const [chartData, setChartData] = useState([]);
  const [totalLogins, setTotalLogins] = useState(0);
  const [loadingChart, setLoadingChart] = useState(false);

  const [dateRange, setDateRange] = useState("");
  const [compDays, setCompDays] = useState("comparision days");

  // ── Fetch groups ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const rawSession = localStorage.getItem("vdr_session");
        if (!rawSession) return;
        const session = JSON.parse(rawSession);

        const { data: groupsData, error } = await supabase
          .from("groups")
          .select("id, name")
          .eq("company_id", session.company_id)
          .order("name", { ascending: true });

        if (error) throw error;
        setGroups(groupsData || []);
        if (groupsData && groupsData.length > 0) setSelectedGroup(groupsData[0]);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // ── Fetch login data for selected group ──────────────────────────────────────
  const fetchLoginData = useCallback(async (group) => {
    if (!group) return;
    try {
      setLoadingChart(true);
      const rawSession = localStorage.getItem("vdr_session");
      if (!rawSession) return;
      const session = JSON.parse(rawSession);

      // Step 1: Get user_ids in this group
      const { data: userGroupsData, error: ugError } = await supabase
        .from("user_groups")
        .select("user_id")
        .eq("group_id", group.id);
      if (ugError) throw ugError;

      const userIds = (userGroupsData || []).map(ug => ug.user_id);
      if (userIds.length === 0) { setChartData([]); setTotalLogins(0); return; }

      // Step 2: Fetch user names for those user_ids
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);
      if (usersError) throw usersError;

      // Build userId → user info map
      const userMap = {};
      (usersData || []).forEach(u => { userMap[u.id] = u; });

      // Step 3: Fetch login_history
      const { data: loginData, error: lhError } = await supabase
        .from("login_history")
        .select("user_id, created_at")
        .eq("company_id", session.company_id)
        .eq("action", "LOGIN")
        .in("user_id", userIds)
        .order("created_at", { ascending: true });
      if (lhError) throw lhError;

      // Step 4: Group by date — count + collect unique users per day
      const dateMap = {};
      (loginData || []).forEach(log => {
        const date = log.created_at.slice(0, 10);
        if (!dateMap[date]) dateMap[date] = { count: 0, userSet: new Set() };
        dateMap[date].count += 1;
        dateMap[date].userSet.add(log.user_id);
      });

      // Step 5: Build last-60-days array with user details
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 59);

      const result = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        const dayData = dateMap[dateStr];
        const users = dayData
          ? Array.from(dayData.userSet).map(uid => userMap[uid] || { name: "Unknown", email: "" })
          : [];
        result.push({ date: dateStr, logins: dayData ? dayData.count : 0, users });
      }

      setChartData(result);
      setTotalLogins((loginData || []).length);
    } catch (err) {
      console.error("Error fetching login data:", err);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) fetchLoginData(selectedGroup);
  }, [selectedGroup, fetchLoginData]);

  return (
    <div className="p-8 max-w-6xl">

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Group Insights</h1>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <SlidersHorizontal size={16} />
        </button>

        {/* Group Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowGroupDrop(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:border-gray-300 shadow-sm transition-all min-w-[140px]"
          >
            <span className="flex-1 text-left">
              {loadingGroups ? "Loading..." : selectedGroup ? selectedGroup.name : "Select Group"}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {showGroupDrop && !loadingGroups && (
            <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
              {groups.length === 0 ? (
                <p className="px-4 py-3 text-[13px] text-gray-400">No groups found</p>
              ) : groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => { setSelectedGroup(g); setShowGroupDrop(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${
                    selectedGroup?.id === g.id ? "text-[var(--brand)] font-semibold bg-blue-50/50" : "text-gray-700"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <CalendarDays size={14} className="text-gray-400" />
          <input
            type="text" placeholder="Date range" value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="text-[13px] text-gray-600 bg-transparent outline-none w-28 placeholder:text-gray-400"
          />
        </div>

        {/* Comparison Days */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <span className="text-[13px] text-gray-600">{compDays}</span>
          <button onClick={() => setCompDays("")} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={() => selectedGroup && fetchLoginData(selectedGroup)}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
        >
          <RefreshCw size={16} className={loadingChart ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── Chart Card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 pt-5 pb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {SERIES.map(s => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-7 h-[3px] rounded-full inline-block shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{s.label}</span>
            </div>
          ))}
          {selectedGroup && (
            <span className="ml-auto text-[12px] text-gray-400 font-medium whitespace-nowrap">
              Group: <span className="text-gray-700 font-semibold">{selectedGroup.name}</span>
            </span>
          )}
        </div>

        <div className="px-4 pb-4 relative min-h-[200px]">
          {loadingChart ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-rose-400 rounded-full animate-spin" />
            </div>
          ) : (
            <LineChart data={chartData} groupName={selectedGroup?.name} />
          )}
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-5">
        <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-4">Summary</h3>
        <div className="flex flex-wrap gap-6">

          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
              <LogIn size={16} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Logins</p>
              <p className="text-[15px] font-bold text-gray-800">{loadingChart ? "..." : totalLogins}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100 self-center" />

          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500 group-hover:bg-violet-100 transition-colors">
              <Download size={16} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Downloaded</p>
              <p className="text-[15px] font-bold text-gray-800">0</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100 self-center" />

          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
              <FileSearch size={16} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Fence Viewed</p>
              <p className="text-[15px] font-bold text-gray-800">0</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100 self-center" />

          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors">
              <Eye size={16} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Doc Viewed</p>
              <p className="text-[15px] font-bold text-gray-800">0</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100 self-center" />

          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
              <MessageCircleQuestion size={16} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Questions Asked</p>
              <p className="text-[15px] font-bold text-gray-800">0</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
