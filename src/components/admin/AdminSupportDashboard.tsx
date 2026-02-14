/**
 * Admin Support Dashboard - Contact inquiries/tickets management
 * Reply via email or WhatsApp
 */

import React, { useState, useEffect } from 'react';
import { databases, Query } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../../lib/appwrite.config';
import { Mail, MessageCircle, CheckCircle, Filter, Search } from 'lucide-react';

interface SupportTicket {
  $id: string;
  fullName?: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  issueCategory?: string;
  department?: string;
  status?: string;
  priority?: string;
  userRole?: string;
  country?: string;
  submittedAt?: string;
  $createdAt: string;
  adminNotes?: string;
}

const SUPPORT_COLLECTION = APPWRITE_CONFIG.collections?.contactInquiries || 'contact_inquiries';
const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const SUPPORT_EMAIL = 'indastreet.id@gmail.com';
const SUPPORT_WHATSAPP = '6281392000050';

const AdminSupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await databases.listDocuments(DATABASE_ID, SUPPORT_COLLECTION, [
        Query.orderDesc('$createdAt'),
        Query.limit(200),
      ]);
      setTickets((res.documents as SupportTicket[]) || []);
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateTicketStatus = async (id: string, status: string, notes?: string) => {
    try {
      await databases.updateDocument(DATABASE_ID, SUPPORT_COLLECTION, id, {
        status,
        adminNotes: notes ?? undefined,
        resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
      });
      fetchTickets();
      setSelectedTicket(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  const openEmailReply = (ticket: SupportTicket) => {
    const subject = `Re: ${ticket.subject || 'Your IndaStreet Support Request'}`;
    const body = `Dear ${ticket.fullName || 'Customer'},\n\n[Your response here]\n\n---\nOriginal message:\n${ticket.message}`;
    window.open(`mailto:${ticket.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const openWhatsAppReply = (ticket: SupportTicket) => {
    const phone = (ticket.phone || '').replace(/\D/g, '').replace(/^0/, '62');
    const text = encodeURIComponent(`Dear ${ticket.fullName || 'Customer'}, thank you for contacting IndaStreet. We're looking into your request.`);
    window.open(`https://wa.me/${phone || SUPPORT_WHATSAPP}?text=${text}`, '_blank');
  };

  const filtered = tickets.filter((t) => {
    const matchDept = filterDept === 'all' || t.department === filterDept;
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'open' && t.status !== 'resolved') ||
      (filterStatus === 'resolved' && t.status === 'resolved') ||
      (filterStatus !== 'open' && filterStatus !== 'resolved' && t.status === filterStatus);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || 
      (t.fullName || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.message || '').toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q);
    return matchDept && matchStatus && matchSearch;
  });

  const openCount = tickets.filter((t) => t.status !== 'resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Support Tickets</h2>
        <p className="text-gray-600">Reply to customers via email or WhatsApp</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{tickets.length}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <p className="text-sm text-orange-600">Open</p>
          <p className="text-2xl font-bold text-orange-700">{openCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600">Resolved</p>
          <p className="text-2xl font-bold text-green-700">{resolvedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <button onClick={fetchTickets} className="text-sm text-orange-600 font-medium hover:underline">Refresh</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Departments</option>
          <option value="booking-support">Booking Support</option>
          <option value="finance">Finance</option>
          <option value="therapist-support">Therapist Support</option>
          <option value="admin">Admin</option>
          <option value="compliance">Compliance</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Ticket list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tickets match your filters.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((ticket) => (
              <div
                key={ticket.$id}
                className={`p-4 hover:bg-gray-50 ${selectedTicket?.$id === ticket.$id ? 'bg-orange-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ticket.subject || ticket.issueCategory || 'No subject'}</p>
                    <p className="text-sm text-gray-600 truncate">{ticket.fullName || '—'} • {ticket.email}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.message}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{ticket.department || '—'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {ticket.status || 'open'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {ticket.$createdAt ? new Date(ticket.$createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEmailReply(ticket)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Reply via Email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                    {ticket.phone && (
                      <button
                        onClick={() => openWhatsAppReply(ticket)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Reply via WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    )}
                    {ticket.status !== 'resolved' && (
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Add notes / Mark resolved"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add notes / Mark resolved */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Ticket: {selectedTicket.subject || selectedTicket.issueCategory}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedTicket.message}</p>
            <p className="text-xs text-gray-500 mb-4">
              From: {selectedTicket.fullName} • {selectedTicket.email} • {selectedTicket.phone || '—'}
            </p>
            <textarea
              placeholder="Internal notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-sm"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => updateTicketStatus(selectedTicket.$id, 'resolved', adminNotes)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => updateTicketStatus(selectedTicket.$id, 'pending', adminNotes)}
                className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
              >
                Mark Pending
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="py-2 px-4 border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportDashboard;
