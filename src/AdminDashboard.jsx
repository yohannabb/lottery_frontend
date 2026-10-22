import React, { useState, useEffect } from 'react';
import { Plus, X, Car, Clock, User, Phone, CreditCard, Edit3, Trash2, Send, Image as ImageIcon, Megaphone, Users } from 'lucide-react';

export default function AdminDashboard({ 
  tickets = [], 
  lotteries = [], 
  onApprove, 
  onReject, 
  onAddLottery, 
  onUpdateLottery, 
  onDeleteLottery,
  apiUrl = 'http://localhost:5000' 
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingLottery, setEditingLottery] = useState(null);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastImage, setBroadcastImage] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    color: '',
    imageUrl: '',
    ticketPrice: 6000,
    totalTickets: 4000,
    durationDays: 30,
    isFeatured: true
  });

  // Fetch registered user count on load
  useEffect(() => {
    fetch(`${apiUrl}/api/admin/user-count`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRegisteredUserCount(data.count);
        }
      })
      .catch(err => console.error('Error fetching user count:', err));
  }, [apiUrl]);

  const handleOpenAddModal = () => {
    setFormData({ 
      title: '', 
      color: '', 
      imageUrl: '', 
      ticketPrice: 6000, 
      totalTickets: 4000, 
      durationDays: 30, 
      isFeatured: true 
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (lottery) => {
    setEditingLottery(lottery);
    setFormData({
      title: lottery.title || '',
      color: lottery.color || '',
      imageUrl: lottery.imageUrl || '',
      ticketPrice: lottery.ticketPrice || 6000,
      totalTickets: lottery.totalTickets || 4000,
      durationDays: lottery.durationDays || 30,
      isFeatured: lottery.isFeatured !== undefined ? lottery.isFeatured : true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted! onAddLottery prop exists?", !!onAddLottery);

    if (editingLottery) {
      if (onUpdateLottery) {
        await onUpdateLottery(editingLottery._id, formData);
      }
      setEditingLottery(null);
    } else {
      if (onAddLottery) {
        await onAddLottery(formData);
      } else {
        console.error("❌ CRITICAL: onAddLottery prop is missing!");
      }
      setIsAddModalOpen(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setIsPosting(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: broadcastText, 
          imageUrl: broadcastImage 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        setBroadcastText('');
        setBroadcastImage('');
        setIsPostModalOpen(false);
      } else {
        alert('❌ Failed to send broadcast');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error sending broadcast');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-white space-y-8">
      {/* Top Bar with POST, Add Buttons & Registered Users Counter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-bold">Admin Management</h1>
          <p className="text-xs text-gray-400">Manage active lotteries, pending orders, and broadcasts</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Registered Users Badge */}
          <div className="bg-[#121e14] border border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-emerald-400 font-black">{registeredUserCount}</span>
              <span className="text-gray-400 ml-1">users registered</span>
            </div>
          </div>

          {/* POST BUTTON */}
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
          >
            <Megaphone className="w-4 h-4" /> POST
          </button>

          <button 
            onClick={handleOpenAddModal}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Car
          </button>
        </div>
      </div>

      {/* SECTION 1: ACTIVE CAR LOTTERIES LIST */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
          <Car className="w-4 h-4 text-amber-400" /> Active Car Lotteries ({lotteries.length})
        </h3>

        {lotteries.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center bg-[#121e14] rounded-2xl border border-gray-800">
            No active car lotteries found. Click above to add one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lotteries.map((lottery) => (
              <div key={lottery._id} className="bg-[#121e14] border border-gray-800 rounded-2xl p-4 flex gap-3 items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img 
                    src={lottery.imageUrl} 
                    alt={lottery.title} 
                    className="w-16 h-16 object-cover rounded-xl border border-gray-800 shrink-0" 
                  />
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-amber-400 truncate">{lottery.title}</h4>
                    <p className="text-xs text-gray-400">Color: {lottery.color}</p>
                    <p className="text-xs text-gray-300 mt-1 font-semibold">
                      {lottery.ticketPrice} Birr • {lottery.totalTickets} Tickets
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    onClick={() => handleOpenEditModal(lottery)}
                    className="bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black p-2.5 rounded-xl text-xs flex items-center gap-1 font-bold transition"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => onDeleteLottery && onDeleteLottery(lottery._id)}
                    className="bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white p-2.5 rounded-xl text-xs flex items-center gap-1 font-bold transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: PENDING ORDERS LIST */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-300">
          Pending Orders ({tickets.filter(t => t.status === 'PENDING REVIEW').length})
        </h3>
        
        {tickets.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center bg-[#121e14] rounded-2xl border border-gray-800">
            No ticket submissions found.
          </p>
        ) : (
          tickets.map((t) => (
            <div key={t._id || t.orderId} className="bg-[#121e14] border border-gray-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-400">#{t.orderId}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    t.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    t.status === 'REJECTED' ? 'bg-red-950 text-red-400 border border-red-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {new Date(t.createdAt).toLocaleString()}
                </span>
              </div>

              {/* DETAILED USER PAYMENT INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5 bg-[#0e1610] p-3 rounded-xl border border-gray-800/60">
                  <p className="flex items-center gap-1.5 text-gray-300">
                    <User className="w-3.5 h-3.5 text-amber-400" /> 
                    <span className="font-semibold">Full Name:</span> {t.fullName || 'N/A'}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> 
                    <span className="font-semibold">Phone Number:</span> {t.phoneNumber || 'N/A'}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-300">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" /> 
                    <span className="font-semibold">Sender Account:</span> <span className="font-mono text-white">{t.senderAccount || 'Not provided'}</span>
                  </p>
                </div>

                <div className="space-y-1.5 bg-[#0e1610] p-3 rounded-xl border border-gray-800/60">
                  <p className="text-gray-300">
                    <span className="font-semibold">Tickets Count:</span> {t.ticketCount} ({t.totalPrice} Birr)
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Selected Numbers:</span> {t.selectedNumbers?.join(', ') || 'Random / Quick Pick'}
                  </p>
                </div>
              </div>

              {/* RECEIPT IMAGE PREVIEW & ACTIONS */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-3">
                {t.receiptUrl ? (
                  <div className="flex items-center gap-3">
                    <a 
                      href={`${apiUrl}${t.receiptUrl}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl border border-emerald-500/50 hover:opacity-90 transition"
                    >
                      <img 
                        src={`${apiUrl}${t.receiptUrl}`} 
                        alt="Payment Receipt" 
                        className="w-16 h-16 object-cover" 
                      />
                    </a>
                    <a 
                      href={`${apiUrl}${t.receiptUrl}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-amber-400 hover:underline font-semibold"
                    >
                      🔍 Click to view full receipt image
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic">No receipt image uploaded</span>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {t.status === 'PENDING REVIEW' && (
                    <>
                      <button 
                        onClick={() => onApprove(t.orderId)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => onReject(t.orderId)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* POST BROADCAST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#101811] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Megaphone className="text-emerald-400" /> Broadcast Post to Telegram
              </h3>
              <button 
                onClick={() => setIsPostModalOpen(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Image URL (Optional)
                </label>
                <input 
                  type="url" 
                  placeholder="https://example.com/car.jpg"
                  value={broadcastImage}
                  onChange={(e) => setBroadcastImage(e.target.value)}
                  className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Description / Message</label>
                <textarea 
                  rows="4"
                  required
                  placeholder="🚨 New car added! Select your numbers now..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <button 
                type="submit"
                disabled={isPosting}
                className="w-full py-3.5 bg-emerald-500 text-black font-extrabold rounded-2xl mt-2 hover:bg-emerald-400 text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" /> {isPosting ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT CAR LOTTERY MODAL */}
      {(isAddModalOpen || editingLottery) && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#101811] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Car className="text-amber-400" /> {editingLottery ? 'Edit Car Lottery' : 'Add New Car Lottery'}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingLottery(null); }} 
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300">Car Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. 6 Gech EV Makina Equb"
                  required
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Color/Variant</label>
                <input 
                  type="text" 
                  placeholder="e.g. Black / Metallic"
                  required
                  value={formData.color} 
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  required
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-300">Ticket Price (Birr)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.ticketPrice} 
                    onChange={e => setFormData({...formData, ticketPrice: Number(e.target.value)})}
                    className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Total Tickets</label>
                  <input 
                    type="number" 
                    required
                    value={formData.totalTickets} 
                    onChange={e => setFormData({...formData, totalTickets: Number(e.target.value)})}
                    className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Countdown Duration (Days)
                </label>
                <input 
                  type="number" 
                  min="1"
                  required
                  placeholder="e.g. 5, 12, 50, 2..."
                  value={formData.durationDays} 
                  onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})}
                  className="w-full mt-1 bg-[#162218] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-amber-500 text-black font-bold rounded-2xl mt-2 hover:bg-amber-400 text-sm transition"
              >
                {editingLottery ? 'Update & Save Changes' : 'Save & Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}