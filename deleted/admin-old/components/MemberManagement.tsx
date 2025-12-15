import React, { useState, useEffect } from 'react';
import { 
    Calendar, DollarSign, Eye, CheckCircle, XCircle, 
    AlertTriangle, TrendingUp, MapPin, Phone, Mail, Star,
    ToggleLeft, ToggleRight, Activity
} from 'lucide-react';

interface MemberStats {
    clicksThisMonth: number;
    viewsThisMonth: number;
    bookingsThisMonth: number;
    revenue: number;
}

interface MemberSubscription {
    activationDate: string;
    currentMonth: number;
    monthlyFee: number;
    nextPaymentDate: string;
    daysUntilDue: number;
    paymentHistory: PaymentRecord[];
    status: 'active' | 'pending' | 'overdue';
}

interface PaymentRecord {
    month: number;
    amount: number;
    paidDate: string | null;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
}

interface Member {
    $id: string;
    name: string;
    type: 'therapist' | 'massage_place' | 'facial_place';
    location: string;
    phone?: string;
    email?: string;
    profileImage?: string;
    images?: string[];
    status: 'active' | 'inactive' | 'pending';
    verified: boolean;
    visibleOnHomepage: boolean;
    stats: MemberStats;
    subscription: MemberSubscription;
}

interface MemberManagementProps {
    members: Member[];
    onUpdateMember: (memberId: string, updates: Partial<Member>) => Promise<void>;
    onRefresh: () => Promise<void>;
}

// Pricing tiers based on membership month
const getPricingTier = (month: number): number => {
    if (month === 1) return 0; // Free first month
    if (month === 2) return 100000; // 100k IDR
    if (month === 3) return 135000; // 135k IDR
    if (month === 4) return 175000; // 175k IDR
    return 200000; // 200k IDR for month 5+
};

// Calculate subscription details
const calculateSubscription = (activationDate: string): MemberSubscription => {
    const activated = new Date(activationDate);
    const now = new Date();
    
    // Calculate how many months since activation
    const monthsDiff = (now.getFullYear() - activated.getFullYear()) * 12 + 
                       (now.getMonth() - activated.getMonth());
    const currentMonth = Math.max(1, monthsDiff + 1);
    
    // Calculate next payment date (30 days from last month-end)
    const nextPayment = new Date(activated);
    nextPayment.setMonth(activated.getMonth() + currentMonth);
    
    // Days until due
    const daysUntilDue = Math.ceil((nextPayment.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate payment history
    const paymentHistory: PaymentRecord[] = [];
    for (let i = 1; i <= currentMonth; i++) {
        const monthDue = new Date(activated);
        monthDue.setMonth(activated.getMonth() + i);
        
        paymentHistory.push({
            month: i,
            amount: getPricingTier(i),
            paidDate: i < currentMonth ? monthDue.toISOString() : null,
            dueDate: monthDue.toISOString(),
            status: i < currentMonth ? 'paid' : (daysUntilDue < 0 ? 'overdue' : 'pending')
        });
    }
    
    return {
        activationDate,
        currentMonth,
        monthlyFee: getPricingTier(currentMonth),
        nextPaymentDate: nextPayment.toISOString(),
        daysUntilDue,
        paymentHistory,
        status: daysUntilDue < 0 ? 'overdue' : (daysUntilDue <= 7 ? 'pending' : 'active')
    };
};

export const MemberManagement: React.FC<MemberManagementProps> = ({ 
    members, 
    onUpdateMember, 
    onRefresh 
}) => {
    const [filter, setFilter] = useState<'all' | 'therapist' | 'massage_place' | 'facial_place'>('all');
    const [sortBy, setSortBy] = useState<'clicks' | 'revenue' | 'dueDate'>('dueDate');
    const [showDueSoon, setShowDueSoon] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    // Filter members
    const filteredMembers = members.filter(member => {
        const matchesType = filter === 'all' || member.type === filter;
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             member.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDueSoon = !showDueSoon || member.subscription.daysUntilDue <= 7;
        
        return matchesType && matchesSearch && matchesDueSoon;
    });

    // Sort members
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        if (sortBy === 'clicks') return b.stats.clicksThisMonth - a.stats.clicksThisMonth;
        if (sortBy === 'revenue') return b.stats.revenue - a.stats.revenue;
        if (sortBy === 'dueDate') return a.subscription.daysUntilDue - b.subscription.daysUntilDue;
        return 0;
    });

    // Count members with payments due within 7 days
    const dueSoonCount = members.filter(m => m.subscription.daysUntilDue <= 7 && m.subscription.daysUntilDue >= 0).length;
    const overdueCount = members.filter(m => m.subscription.daysUntilDue < 0).length;

    const handleToggleVerified = async (memberId: string, currentVerified: boolean) => {
        setUpdating(memberId);
        try {
            await onUpdateMember(memberId, { verified: !currentVerified });
            await onRefresh();
        } finally {
            setUpdating(null);
        }
    };

    const handleToggleVisibility = async (memberId: string, currentVisible: boolean) => {
        setUpdating(memberId);
        try {
            await onUpdateMember(memberId, { visibleOnHomepage: !currentVisible });
            await onRefresh();
        } finally {
            setUpdating(null);
        }
    };

    const handleToggleStatus = async (memberId: string, currentStatus: string) => {
        setUpdating(memberId);
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await onUpdateMember(memberId, { status: newStatus as 'active' | 'inactive' });
            await onRefresh();
        } finally {
            setUpdating(null);
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'therapist': return 'Therapist';
            case 'massage_place': return 'Massage Place';
            case 'facial_place': return 'Facial Place';
            default: return type;
        }
    };

    const getStatusColor = (daysUntilDue: number) => {
        if (daysUntilDue < 0) return 'text-red-600 bg-red-50';
        if (daysUntilDue <= 7) return 'text-orange-600 bg-orange-50';
        return 'text-green-600 bg-green-50';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Members</p>
                            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Due Within 7 Days</p>
                            <p className="text-2xl font-bold text-orange-600">{dueSoonCount}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Overdue</p>
                            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Members</p>
                            <p className="text-2xl font-bold text-green-600">
                                {members.filter(m => m.status === 'active').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="therapist">Therapists</option>
                        <option value="massage_place">Massage Places</option>
                        <option value="facial_place">Facial Places</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="dueDate">Sort by Due Date</option>
                        <option value="clicks">Sort by Clicks</option>
                        <option value="revenue">Sort by Revenue</option>
                    </select>

                    <button
                        onClick={() => setShowDueSoon(!showDueSoon)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                            showDueSoon 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Due Soon Only
                    </button>
                </div>
            </div>

            {/* Members List */}
            <div className="space-y-4">
                {sortedMembers.map(member => (
                    <div key={member.$id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-4 sm:p-6">
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                {/* Profile Image */}
                                <div className="flex-shrink-0">
                                    {member.profileImage || (member.images && member.images[0]) ? (
                                        <div className="relative">
                                            <img
                                                src={member.profileImage || member.images?.[0]}
                                                alt={member.name}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                            {member.verified && (
                                                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="text-2xl text-gray-400">
                                                {member.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Member Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {member.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2">{getTypeLabel(member.type)}</p>
                                            
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {member.location}
                                                </span>
                                                {member.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {member.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                            member.status === 'active' 
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {member.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-500">Clicks This Month</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {member.stats.clicksThisMonth}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Views</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {member.stats.viewsThisMonth}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Bookings</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {member.stats.bookingsThisMonth}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Revenue</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(member.stats.revenue)}
                                    </p>
                                </div>
                            </div>

                            {/* Subscription Info */}
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm text-gray-700">
                                                Member since: <strong>{formatDate(member.subscription.activationDate)}</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-gray-700">
                                                Month {member.subscription.currentMonth}: <strong>{formatCurrency(member.subscription.monthlyFee)}</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className={`w-4 h-4 ${
                                                member.subscription.daysUntilDue < 0 ? 'text-red-600' :
                                                member.subscription.daysUntilDue <= 7 ? 'text-orange-600' :
                                                'text-green-600'
                                            }`} />
                                            <span className={`text-sm font-medium ${getStatusColor(member.subscription.daysUntilDue)}`}>
                                                {member.subscription.daysUntilDue < 0 
                                                    ? `Overdue by ${Math.abs(member.subscription.daysUntilDue)} days`
                                                    : `Due in ${member.subscription.daysUntilDue} days`
                                                } ({formatDate(member.subscription.nextPaymentDate)})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Timeline */}
                                    <div className="flex flex-wrap gap-1">
                                        {member.subscription.paymentHistory.slice(-6).map((payment) => (
                                            <div
                                                key={payment.month}
                                                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                                                    payment.status === 'paid' 
                                                        ? 'bg-green-500 text-white'
                                                        : payment.status === 'overdue'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-orange-400 text-white'
                                                }`}
                                                title={`Month ${payment.month}: ${formatCurrency(payment.amount)} - ${payment.status}`}
                                            >
                                                {payment.month}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleToggleVerified(member.$id, member.verified)}
                                    disabled={updating === member.$id}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        member.verified
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    } disabled:opacity-50`}
                                >
                                    {member.verified ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Verified
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            Not Verified
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleToggleVisibility(member.$id, member.visibleOnHomepage)}
                                    disabled={updating === member.$id}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        member.visibleOnHomepage
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    } disabled:opacity-50`}
                                >
                                    {member.visibleOnHomepage ? (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Visible on Homepage
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            Hidden
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleToggleStatus(member.$id, member.status)}
                                    disabled={updating === member.$id}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        member.status === 'active'
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    } disabled:opacity-50`}
                                >
                                    {member.status === 'active' ? (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            Deactivate
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Activate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {sortedMembers.length === 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">No members found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberManagement;
