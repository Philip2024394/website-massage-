import React, { useEffect, useState } from 'react';
import { 
    DollarSign, Filter, Calendar, Users, CheckCircle, XCircle, 
    Clock, AlertTriangle, Download, Search, Eye, CreditCard 
} from 'lucide-react';
import { leadGenerationService } from '../../../../lib/appwriteService';

interface Lead {
    $id: string;
    leadId: string;
    memberId: string;
    memberType: string;
    memberName: string;
    memberWhatsApp: string;
    customerName: string;
    customerWhatsApp: string;
    serviceType: string;
    duration: number;
    requestedDateTime: string;
    leadCost: number;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    sentAt: string;
    respondedAt?: string;
    billed: boolean;
    paymentStatus: 'pending' | 'paid' | 'overdue';
}

interface BillingSummary {
    memberId: string;
    memberName: string;
    memberType: string;
    billingMonth: string;
    totalLeads: number;
    acceptedLeads: number;
    declinedLeads: number;
    expiredLeads: number;
    totalOwed: number;
    totalPaid: number;
    balance: number;
}

const LeadManagement: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLeads: 0,
        acceptedLeads: 0,
        declinedLeads: 0,
        expiredLeads: 0,
        totalRevenue: 0,
        outstandingPayments: 0
    });
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [memberTypeFilter, setMemberTypeFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    
    useEffect(() => {
        loadLeads();
    }, []);
    
    useEffect(() => {
        applyFilters();
    }, [leads, statusFilter, memberTypeFilter, dateFrom, dateTo, searchQuery]);
    
    const loadLeads = async () => {
        setLoading(true);
        try {
            const allLeads = await leadGenerationService.getAllLeads();
            setLeads(allLeads as Lead[]);
            calculateStats(allLeads);
        } catch (error) {
            console.error('Error loading leads:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const calculateStats = (leadsData: any[]) => {
        const totalLeads = leadsData.length;
        const acceptedLeads = leadsData.filter(l => l.status === 'accepted').length;
        const declinedLeads = leadsData.filter(l => l.status === 'declined').length;
        const expiredLeads = leadsData.filter(l => l.status === 'expired').length;
        const totalRevenue = acceptedLeads * leadGenerationService.LEAD_COST;
        const outstandingPayments = leadsData.filter(
            l => l.status === 'accepted' && l.paymentStatus !== 'paid'
        ).length * leadGenerationService.LEAD_COST;
        
        setStats({
            totalLeads,
            acceptedLeads,
            declinedLeads,
            expiredLeads,
            totalRevenue,
            outstandingPayments
        });
    };
    
    const applyFilters = () => {
        let filtered = [...leads];
        
        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(l => l.status === statusFilter);
        }
        
        // Member type filter
        if (memberTypeFilter !== 'all') {
            filtered = filtered.filter(l => l.memberType === memberTypeFilter);
        }
        
        // Date range filter
        if (dateFrom) {
            filtered = filtered.filter(l => new Date(l.sentAt) >= new Date(dateFrom));
        }
        if (dateTo) {
            filtered = filtered.filter(l => new Date(l.sentAt) <= new Date(dateTo));
        }
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(l => 
                l.memberName.toLowerCase().includes(query) ||
                l.customerName.toLowerCase().includes(query) ||
                l.customerWhatsApp.includes(query) ||
                l.memberWhatsApp.includes(query)
            );
        }
        
        setFilteredLeads(filtered);
    };
    
    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            accepted: 'bg-green-100 text-green-800 border-green-200',
            declined: 'bg-red-100 text-red-800 border-red-200',
            expired: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        
        const icons = {
            pending: <Clock className="w-3 h-3" />,
            accepted: <CheckCircle className="w-3 h-3" />,
            declined: <XCircle className="w-3 h-3" />,
            expired: <AlertTriangle className="w-3 h-3" />
        };
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };
    
    const getPaymentBadge = (paymentStatus: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[paymentStatus as keyof typeof styles]}`}>
                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </span>
        );
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const calculateResponseTime = (lead: Lead) => {
        if (!lead.respondedAt) return 'No response';
        const sent = new Date(lead.sentAt).getTime();
        const responded = new Date(lead.respondedAt).getTime();
        const diffMinutes = Math.floor((responded - sent) / 1000 / 60);
        return `${diffMinutes} min`;
    };
    
    const exportToCSV = () => {
        const headers = ['Lead ID', 'Date', 'Member', 'Type', 'Customer', 'Phone', 'Service', 'Duration', 'Status', 'Payment', 'Amount'];
        const rows = filteredLeads.map(lead => [
            lead.leadId,
            formatDate(lead.sentAt),
            lead.memberName,
            lead.memberType,
            lead.customerName,
            lead.customerWhatsApp,
            lead.serviceType,
            lead.duration,
            lead.status,
            lead.paymentStatus,
            lead.status === 'accepted' ? lead.leadCost : 0
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading leads...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lead Generation Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Pay-per-lead system for members without active subscriptions</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-600">Total Leads</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600">Accepted</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.acceptedLeads}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-gray-600">Declined</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.declinedLeads}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">Expired</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">{stats.expiredLeads}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-gray-600">Total Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-orange-600">Rp {stats.totalRevenue.toLocaleString()}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-600">Outstanding</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-600">Rp {stats.outstandingPayments.toLocaleString()}</p>
                </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search member, customer, phone..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="expired">Expired</option>
                    </select>
                    
                    {/* Member Type Filter */}
                    <select
                        value={memberTypeFilter}
                        onChange={(e) => setMemberTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="therapist">Therapist</option>
                        <option value="massage_place">Massage Place</option>
                        <option value="facial_place">Facial Place</option>
                    </select>
                    
                    {/* Date From */}
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="From date"
                    />
                    
                    {/* Date To */}
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="To date"
                    />
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredLeads.length}</span> of <span className="font-semibold">{leads.length}</span> leads
                    </p>
                    <button
                        onClick={() => {
                            setStatusFilter('all');
                            setMemberTypeFilter('all');
                            setDateFrom('');
                            setDateTo('');
                            setSearchQuery('');
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
            
            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date & Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Member</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Service</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Response Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.$id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {formatDate(lead.sentAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{lead.memberName}</p>
                                            <p className="text-xs text-gray-500">{lead.memberType.replace('_', ' ')}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{lead.customerName}</p>
                                            <p className="text-xs text-gray-500">{lead.customerWhatsApp}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm text-gray-900">{lead.serviceType}</p>
                                            <p className="text-xs text-gray-500">{lead.duration} min</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(lead.status)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {calculateResponseTime(lead)}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold">
                                        {lead.status === 'accepted' ? (
                                            <span className="text-green-600">Rp {lead.leadCost.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {lead.status === 'accepted' ? getPaymentBadge(lead.paymentStatus) : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedLead(lead)}
                                            className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredLeads.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No leads found matching your filters</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Lead Details Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLead(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Lead Details</h3>
                                <p className="text-sm text-gray-500 mt-1">ID: {selectedLead.leadId}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <div className="mt-1">
                                        {selectedLead.status === 'accepted' ? getPaymentBadge(selectedLead.paymentStatus) : '-'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Member Information</h4>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedLead.memberName}</p>
                                    <p className="text-sm"><span className="text-gray-500">Type:</span> {selectedLead.memberType.replace('_', ' ')}</p>
                                    <p className="text-sm"><span className="text-gray-500">WhatsApp:</span> {selectedLead.memberWhatsApp}</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedLead.customerName}</p>
                                    <p className="text-sm"><span className="text-gray-500">WhatsApp:</span> {selectedLead.customerWhatsApp}</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="text-gray-500">Service:</span> {selectedLead.serviceType}</p>
                                    <p className="text-sm"><span className="text-gray-500">Duration:</span> {selectedLead.duration} minutes</p>
                                    <p className="text-sm"><span className="text-gray-500">Requested:</span> {selectedLead.requestedDateTime}</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="text-gray-500">Sent:</span> {formatDate(selectedLead.sentAt)}</p>
                                    {selectedLead.respondedAt && (
                                        <p className="text-sm"><span className="text-gray-500">Responded:</span> {formatDate(selectedLead.respondedAt)}</p>
                                    )}
                                    <p className="text-sm"><span className="text-gray-500">Response Time:</span> {calculateResponseTime(selectedLead)}</p>
                                </div>
                            </div>
                            
                            {selectedLead.status === 'accepted' && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Billing</h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-sm text-green-800">
                                            <span className="font-bold">Amount:</span> Rp {selectedLead.leadCost.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-green-800 mt-1">
                                            <span className="font-bold">Billed:</span> {selectedLead.billed ? 'Yes' : 'No'}
                                        </p>
                                        <p className="text-sm text-green-800 mt-1">
                                            <span className="font-bold">Payment Status:</span> {selectedLead.paymentStatus}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadManagement;
