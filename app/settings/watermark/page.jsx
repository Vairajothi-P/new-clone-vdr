"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

// ← Replace with your actual company_id (or fetch from auth context)
const COMPANY_ID = '11111111-1111-1111-1111-111111111111';

const DEFAULT_ATTRIBUTES = {
  userName:  true,
  dateTime:  true,
  email:     true,
  ipAddress: true,
  cmplogo:   false,
  cmpname:   false,
};

const DEFAULT_POSITIONS = {
  'top-left':      true,
  'top-center':    false,
  'top-right':     false,
  'middle-left':   false,
  'middle-center': true,
  'middle-right':  false,
  'bottom-left':   false,
  'bottom-center': false,
  'bottom-right':  true,
};

export default function WatermarkPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);

  const [activeType, setActiveType] = useState('dynamic');
  const [customText, setCustomText] = useState('Confidential');
  const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#64748B');
  const [textOpacity, setTextOpacity] = useState(25);
  const [rotation, setRotation] = useState(-30);
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);

  // ─── Fetch from DB on mount ───────────────────────────────────
  useEffect(() => {
    const fetchWatermark = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('watermark_settings')
        .select('*')
        .eq('company_id', COMPANY_ID)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching watermark settings:', error);
      }

      if (data) {
        setRecordId(data.id);
        setActiveType(data.watermark_type ?? 'dynamic');
        setCustomText(data.custom_text ?? 'Confidential');
        setFontSize(data.font_size ?? 14);
        setTextColor(data.text_color ?? '#64748B');
        setTextOpacity(data.text_opacity ?? 25);
        setRotation(data.rotation ?? -30);
        setAttributes({ ...DEFAULT_ATTRIBUTES, ...(data.attributes ?? {}) });
        setPositions({ ...DEFAULT_POSITIONS, ...(data.positions ?? {}) });
      }
      setLoading(false);
    };

    fetchWatermark();
  }, []);

  // ─── Save to DB ───────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const payload = {
      company_id:     COMPANY_ID,
      watermark_type: activeType,
      custom_text:    customText,
      font_size:      fontSize,
      text_color:     textColor,
      text_opacity:   textOpacity,
      rotation:       rotation,
      attributes:     attributes,
      positions:      positions,
    };

    let error;
    if (recordId) {
      ({ error } = await supabase
        .from('watermark_settings')
        .update(payload)
        .eq('id', recordId));
    } else {
      const { data, error: insertError } = await supabase
        .from('watermark_settings')
        .insert(payload)
        .select()
        .single();
      error = insertError;
      if (data) setRecordId(data.id);
    }

    setSaving(false);
    if (error) {
      alert('Failed to save: ' + error.message);
    } else {
      alert('Watermark settings saved successfully!');
    }
  };

  const handlePositionToggle = (pos) => {
    setPositions(prev => ({ ...prev, [pos]: !prev[pos] }));
  };

  const toggleAttribute = (attr) => {
    setAttributes(prev => ({ ...prev, [attr]: !prev[attr] }));
  };

  const getWatermarkText = () => {
    if (activeType === 'static') return customText;
    const parts = [customText];
    if (attributes.userName)  parts.push('John Doe');
    if (attributes.email)     parts.push('john@company.com');
    if (attributes.dateTime)  parts.push('2026-05-17 19:28');
    if (attributes.ipAddress) parts.push('192.168.1.100');
    return parts.filter(Boolean).join(' | ');
  };

  const hexToRGBA = (hex, opacity) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      c = '0x' + c.join('');
      return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity / 100})`;
    }
    return `rgba(100, 116, 139, ${opacity / 100})`;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading watermark settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>

      <div className="relative p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Watermark Settings</h1>
            <p className="text-gray-500 mt-2 text-[15px]">Protect your confidential files with customizable document watermarks.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Saving…</>
            ) : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left panel */}
          <div className="lg:col-span-7 space-y-6">

            {/* Configuration Card */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 p-6 space-y-6">

              {/* Type Switcher */}
              <div>
                <label className="block text-[14px] font-bold text-gray-800 mb-3">Watermark Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl">
                  <button
                    onClick={() => setActiveType('dynamic')}
                    className={`py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeType === 'dynamic' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-800'}`}
                  >Dynamic</button>
                  <button
                    onClick={() => setActiveType('static')}
                    className={`py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeType === 'static' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-800'}`}
                  >Static</button>
                </div>
              </div>

              {/* Watermark Text */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="customText" className="block text-[14px] font-bold text-gray-800 mb-2">Watermark Text</label>
                  <input
                    id="customText"
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter main watermark text..."
                    className="w-full px-4 py-2.5 text-[15px] font-medium text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
                  />
                </div>

                {activeType === 'dynamic' && (
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Included Variables</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'userName',  label: 'User Name' },
                        { id: 'email',     label: 'Email Address' },
                        { id: 'dateTime',  label: 'Date & Time' },
                        { id: 'ipAddress', label: 'IP Address' },
                        { id: 'cmplogo',   label: 'Company Logo' },
                        { id: 'cmpname',   label: 'Company Name' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleAttribute(item.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-[13px] font-semibold transition-all ${
                            attributes[item.id]
                              ? 'bg-blue-50/30 border-blue-500/40 text-blue-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{item.label}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${attributes[item.id] ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                            {attributes[item.id] && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Font Size & Opacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-2">Font Size ({fontSize}px)</label>
                  <input type="range" min="10" max="32" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-2">Opacity ({textOpacity}%)</label>
                  <input type="range" min="5" max="100" value={textOpacity} onChange={(e) => setTextOpacity(parseInt(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                </div>
              </div>

              {/* Rotation & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-2">Rotation Angle ({rotation}°)</label>
                  <input type="range" min="-90" max="90" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-2">Watermark Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent" />
                    <span className="text-sm font-semibold font-mono text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg flex-1 text-center">
                      {textColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Position Grid Card */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-md font-bold text-gray-900">Watermark Positions</h3>
                <p className="text-[13px] text-gray-500 mt-1">Select the areas on the document page where the watermark will overlay.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 max-w-sm mx-auto">
                {Object.keys(positions).map((pos) => {
                  const label = pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return (
                    <button
                      key={pos}
                      onClick={() => handlePositionToggle(pos)}
                      className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[11px] font-bold border transition-all ${
                        positions[pos]
                          ? 'bg-blue-500 border-blue-500 text-white shadow-sm scale-[1.03]'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="uppercase text-[9px] tracking-wider">{label}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${positions[pos] ? 'bg-white border-white text-blue-500' : 'border-gray-300 bg-gray-50'}`}>
                        {positions[pos] && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Live Preview */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-md font-bold text-gray-900">Live Document Preview</h3>
                <p className="text-[13px] text-gray-500 mt-1">Real-time simulation of a secured VDR document.</p>
              </div>

              <div className="relative flex-1 min-h-[420px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col p-4 shadow-inner">
                {/* Toolbar */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2 flex items-center justify-between mb-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">financial_report_q2.pdf</span>
                  <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
                  </div>
                </div>

                {/* Document */}
                <div className="relative flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col gap-3 select-none">
                  {/* Watermark Overlay */}
                  <div className="absolute inset-0 p-4 grid grid-cols-3 grid-rows-3 pointer-events-none z-10">
                    {[
                      { key: 'top-left',      cls: 'flex items-start justify-start' },
                      { key: 'top-center',    cls: 'flex items-start justify-center' },
                      { key: 'top-right',     cls: 'flex items-start justify-end' },
                      { key: 'middle-left',   cls: 'flex items-center justify-start' },
                      { key: 'middle-center', cls: 'flex items-center justify-center' },
                      { key: 'middle-right',  cls: 'flex items-center justify-end' },
                      { key: 'bottom-left',   cls: 'flex items-end justify-start' },
                      { key: 'bottom-center', cls: 'flex items-end justify-center' },
                      { key: 'bottom-right',  cls: 'flex items-end justify-end' },
                    ].map(({ key, cls }) => (
                      <div key={key} className={`${cls} overflow-hidden`}>
                        {positions[key] && (
                          <span
                            style={{
                              fontSize: `${fontSize}px`,
                              color: hexToRGBA(textColor, textOpacity),
                              transform: `rotate(${rotation}deg)`,
                              whiteSpace: 'nowrap',
                            }}
                            className="font-bold origin-center transition-all duration-200"
                          >
                            {getWatermarkText()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Dummy Content */}
                  <div className="h-6 w-1/3 bg-slate-200 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded-md mt-2"></div>
                  <div className="h-4 w-full bg-slate-100 rounded-md"></div>
                  <div className="h-4 w-4/5 bg-slate-100 rounded-md"></div>
                  <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col gap-2">
                    <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                        <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
                      </div>
                      <div className="w-16 h-16 bg-blue-100/50 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-md mt-auto"></div>
                  <div className="h-4 w-3/4 bg-slate-100 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
