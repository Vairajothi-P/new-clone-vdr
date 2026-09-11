"use client";

import { useState, useEffect } from "react";
import { FaPowerOff, FaCog, FaDatabase, FaPlus, FaEllipsisV, FaShieldAlt, FaTimes, FaSave, FaArrowLeft, FaBell, FaCheck } from "react-icons/fa";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function DealDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectName = searchParams.get('project') || "Project";
  
  const [deals, setDeals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [newDealName, setNewDealName] = useState("");
  const [newDealDesc, setNewDealDesc] = useState("");
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Deal form state
  const [formData, setFormData] = useState({
    name: "",
    dealType: "Majority Acquisition",
    geography: "North America",
    sector: "B2B SaaS",
    revenue: "TBD",
    ebitda: "TBD",
    growth: "--",
    employees: "--",
    overview: "A profitable mid-market company...",
    askingPrice: "Available upon qualified access",
  });

  useEffect(() => {
    const saved = localStorage.getItem(`dms_deals_${projectName}`);
    if (saved) {
      try {
        setDeals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse deals", e);
      }
    }
    
    const savedRequests = localStorage.getItem(`dms_requests_${projectName}`);
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error("Failed to parse requests", e);
      }
    }
  }, [projectName]);

  const handleCreateDeal = (e) => {
    e.preventDefault();
    if (!newDealName.trim()) return;
    
    const newDeal = { name: newDealName, desc: newDealDesc, status: "DRAFT", id: Date.now() };
    const updatedDeals = [...deals, newDeal];
    setDeals(updatedDeals);
    localStorage.setItem(`dms_deals_${projectName}`, JSON.stringify(updatedDeals));
    
    setIsAddDealModalOpen(false);
    setNewDealName("");
    setNewDealDesc("");
  };

  const handleDeleteDeal = (id) => {
    const updatedDeals = deals.filter(deal => deal.id !== id);
    setDeals(updatedDeals);
    localStorage.setItem(`dms_deals_${projectName}`, JSON.stringify(updatedDeals));
    setOpenDropdownId(null);
  };

  const handleSaveDeal = (e) => {
    e.preventDefault();
    
    const marketTeasers = JSON.parse(localStorage.getItem('dms_market_teasers') || '[]');
    const existingIndex = marketTeasers.findIndex(t => t.projectName === projectName);

    const newTeaser = {
      ...formData,
      projectName: projectName,
      id: existingIndex >= 0 ? marketTeasers[existingIndex].id : Date.now(),
      status: 'Active'
    };
    
    if (existingIndex >= 0) {
      marketTeasers[existingIndex] = newTeaser;
      alert("Teaser details updated successfully!");
    } else {
      marketTeasers.push(newTeaser);
      alert("Teaser details saved successfully and published to marketplace!");
    }
    
    localStorage.setItem('dms_market_teasers', JSON.stringify(marketTeasers));
    setIsModalOpen(false);
  };

  const handleOpenTeaserModal = () => {
    const marketTeasers = JSON.parse(localStorage.getItem('dms_market_teasers') || '[]');
    const existingTeaser = marketTeasers.find(t => t.projectName === projectName);
    if (existingTeaser) {
      setFormData(existingTeaser);
    } else {
      setFormData({
        name: "",
        sector: "",
        geography: "",
        overview: "",
        revenue: "",
        ebitda: "",
        growth: "",
        employees: "",
        dealType: "Majority Acquisition",
        askingPrice: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleRemoveTeaser = () => {
    if (confirm("Are you sure you want to remove this teaser from the marketplace?")) {
      const marketTeasers = JSON.parse(localStorage.getItem('dms_market_teasers') || '[]');
      const updatedTeasers = marketTeasers.filter(t => t.projectName !== projectName);
      localStorage.setItem('dms_market_teasers', JSON.stringify(updatedTeasers));
      alert("Teaser removed from marketplace");
      setIsModalOpen(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative p-8 md:p-16 flex justify-center items-start font-sans">
      
      {/* Top Right Buttons */}
      <div className="absolute top-8 right-8 flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FaBell className="text-sm" />
            {requests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {requests.filter(r => r.status === 'PENDING').length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                ) : (
                  requests.filter(r => r.status === 'PENDING').map(req => (
                    <div 
                      key={req.id} 
                      onClick={() => { setSelectedRequest(req); setShowNotificationMenu(false); }}
                      className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <p className="text-sm text-gray-800 font-bold">{req.fullName} <span className="font-normal text-gray-600">requested access</span></p>
                      <p className="text-xs text-gray-500 mt-1">{req.company} • {req.investorType}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/dms/login">
          <button className="w-10 h-10 rounded-full border border-red-200 bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm">
            <FaPowerOff className="text-sm" />
          </button>
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl min-h-[60vh] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-12 flex flex-col">
        
        {/* Header Row */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dms/workspace" className="text-gray-400 hover:text-gray-600 transition-colors mr-2">
              <FaArrowLeft />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{projectName}</h1>
            <span className="px-3 py-1 bg-[#e6fbf2] text-[#00c875] text-xs font-bold rounded-full tracking-wide">Deal Setup</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded pl-3 pr-8 py-1.5 outline-none hover:border-gray-300 transition-colors cursor-pointer shadow-sm">
                <option>Active</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f0f7f8] text-[#337a85] flex items-center justify-center">
                <FaDatabase className="text-sm" />
              </div>
              <div className="flex flex-col w-32">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mb-1">
                  <span>0 KB / 50 GB</span>
                  <span>[0%]</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#337a85] w-0"></div>
                </div>
              </div>
            </div>

            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <FaCog className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-8 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Deal Teaser Card */}
            <div 
              onClick={handleOpenTeaserModal} 
              className="h-44 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-4 relative flex flex-col hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-auto">
                <span className="px-2 py-0.5 bg-[#e6fbf2] text-[#00c875] text-[9px] font-bold rounded">
                  SETUP REQUIRED
                </span>
                <button className="text-gray-400 hover:text-gray-600 p-1 opacity-60 hover:opacity-100">
                  <FaEllipsisV className="text-[11px]" />
                </button>
              </div>
              
              <div className="flex flex-col items-center justify-center flex-1 gap-2 pb-2">
                <div className="w-12 h-12 rounded-full bg-[#f4f7f9] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <FaShieldAlt className="text-2xl text-[#b48629]" />
                </div>
                <span className="font-bold text-gray-800 text-sm">Deal Teaser</span>
              </div>
            </div>

            {/* Add New Deal Card */}
            <button 
              onClick={() => setIsAddDealModalOpen(true)}
              className="h-44 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
                <FaPlus />
              </div>
              <span className="text-[13px] text-gray-500 font-medium">Add New Deal</span>
            </button>

            {/* Existing Deals */}
            {deals.map((deal) => (
              <div 
                key={deal.id} 
                onClick={() => router.push('/documents')}
                className="h-44 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-4 relative flex flex-col hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-auto">
                  <span className="px-2 py-0.5 bg-[#fff8e6] text-[#b48629] text-[9px] font-bold rounded">
                    {deal.status}
                  </span>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === deal.id ? null : deal.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 opacity-60 hover:opacity-100"
                    >
                      <FaEllipsisV className="text-[11px]" />
                    </button>
                    
                    {openDropdownId === deal.id && (
                      <div className="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-100 z-10 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDeal(deal.id);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center flex-1 gap-2 pb-2">
                  <div className="w-12 h-12 rounded-full bg-[#f4f7f9] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                    <FaShieldAlt className="text-2xl text-[#b48629]" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{deal.name}</span>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </div>

      {/* Bottom Left Logo */}
      <div className="fixed bottom-6 left-6 w-8 h-8 rounded-full bg-[#303030] text-white flex items-center justify-center shadow-lg font-serif italic text-sm">
        N
      </div>

      {/* Access Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Access Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRequest.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Work Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Company</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRequest.company}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Job Title</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRequest.jobTitle}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Investor Type</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRequest.investorType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Investment Range</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRequest.investmentRange}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 mt-2">Message</p>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[80px] border border-gray-100">
                  {selectedRequest.message || "No message provided."}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => {
                  const updatedReqs = requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'REJECTED' } : r);
                  setRequests(updatedReqs);
                  localStorage.setItem(`dms_requests_${projectName}`, JSON.stringify(updatedReqs));
                  setSelectedRequest(null);
                }}
                className="px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold transition-colors text-sm"
              >
                Reject Request
              </button>
              <button 
                onClick={() => {
                  // Update request status
                  const updatedReqs = requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'ACCEPTED' } : r);
                  setRequests(updatedReqs);
                  localStorage.setItem(`dms_requests_${projectName}`, JSON.stringify(updatedReqs));
                  
                  // Auto-create a deal card based on company name
                  const newDeal = { 
                    name: selectedRequest.company || "New Deal", 
                    desc: "Created automatically from approved access request.", 
                    status: "DRAFT", 
                    id: Date.now() 
                  };
                  const updatedDeals = [...deals, newDeal];
                  setDeals(updatedDeals);
                  localStorage.setItem(`dms_deals_${projectName}`, JSON.stringify(updatedDeals));
                  
                  setSelectedRequest(null);
                  alert(`Deal card "${newDeal.name}" created automatically.`);
                }}
                className="px-5 py-2.5 bg-[#00c875] hover:bg-[#00a863] text-white rounded-lg font-bold transition-colors text-sm shadow-sm flex items-center gap-2"
              >
                <FaCheck /> Accept & Create Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Deal Modal */}
      {isAddDealModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Deal</h2>
            <form onSubmit={handleCreateDeal}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deal Name</label>
                <input 
                  type="text" 
                  required 
                  value={newDealName}
                  onChange={(e) => setNewDealName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]"
                  placeholder="Enter deal name..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deal Description</label>
                <textarea 
                  value={newDealDesc}
                  onChange={(e) => setNewDealDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]"
                  rows="3"
                  placeholder="Enter deal description..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddDealModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#00c875] hover:bg-[#00a863] text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Deal Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0b1120]/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#f4f7f9] w-full max-w-[900px] rounded-sm shadow-2xl relative flex flex-col max-h-[95vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center rounded-t-sm z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Deal</h2>
                <p className="text-sm text-[#00c875] font-bold tracking-wide mt-1">FOR {projectName.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-8 overflow-y-auto bg-[#f4f7f9] flex-1">
              <form id="deal-form" onSubmit={handleSaveDeal} className="space-y-8">
                
                {/* Deal Name */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Deal Information</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deal Name / Internal Code Name</label>
                    <input type="text" name="name" required placeholder="e.g. Project Apollo" value={formData.name} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                  </div>
                </div>

                {/* Basic Info Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Teaser Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sector</label>
                      <input type="text" name="sector" value={formData.sector} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Geography</label>
                      <input type="text" name="geography" value={formData.geography} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Overview</label>
                      <textarea name="overview" value={formData.overview} onChange={handleFormChange} rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875] resize-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* Financials Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Financial Snapshot</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue</label>
                      <input type="text" name="revenue" value={formData.revenue} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">EBITDA</label>
                      <input type="text" name="ebitda" value={formData.ebitda} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">YoY Growth</label>
                      <input type="text" name="growth" value={formData.growth} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Employees</label>
                      <input type="text" name="employees" value={formData.employees} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Deal Type</label>
                      <select name="dealType" value={formData.dealType} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875] bg-white">
                        <option>Majority Acquisition</option>
                        <option>Minority Investment</option>
                        <option>Asset Sale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Asking Price</label>
                      <input type="text" name="askingPrice" value={formData.askingPrice} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]" />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-gray-200 rounded-b-sm flex justify-between items-center z-10">
              <button 
                type="button"
                onClick={handleRemoveTeaser}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm rounded transition-colors flex items-center gap-2"
              >
                <FaTimes /> Remove from Marketplace
              </button>
              
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="deal-form"
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#0b1120] hover:bg-gray-800 text-white font-bold rounded-sm shadow-sm transition-colors"
                >
                  <FaSave />
                  Save Details
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
