/**
 * ============================================================================
 * 🛡️ ADMIN CHAT FLAGS DASHBOARD - TRUST & SAFETY
 * ============================================================================
 * 
 * Admin-only dashboard for reviewing and managing chat flags:
 * - List all flagged chats with filters
 * - View flag details and context
 * - Update flag status (reviewed/resolved)
 * - Add admin notes
 * - Audit trail visibility
 */

import React, { useState, useEffect } from 'react';
import { chatFlagService, ChatFlag, FlagStatus, FlagReason } from '../lib/services/chatFlagService';
import { Shield, AlertTriangle, CheckCircle, Clock, Eye, FileText, Filter, RefreshCw, MessageSquare } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FlagFilter {
  status?: FlagStatus;
  reason?: FlagReason;
  reporterRole?: 'user' | 'therapist' | 'all';
}

// ============================================================================
// UTILITIES
// ============================================================================

const REASON_LABELS: Record<FlagReason, { label: string; icon: string; color: string }> = {
  inappropriate_behavior: { label: 'Inappropriate Behavior', icon: '⚠️', color: 'text-yellow-600' },
  harassment_abuse: { label: 'Harassment/Abuse', icon: '🛡️', color: 'text-red-600' },
  payment_issue: { label: 'Payment Issue', icon: '💳', color: 'text-blue-600' },
  scam_fraud: { label: 'Scam/Fraud', icon: '🚫', color: 'text-red-700' },
  therapist_no_show: { label: 'Therapist No-Show', icon: '👤', color: 'text-orange-600' },
  asked_for_contact_number: { label: 'Asked for Contact Number', icon: '📞', color: 'text-purple-600' },
  shared_contact_number: { label: 'Shared Contact Number', icon: '☎️', color: 'text-indigo-600' },
  other: { label: 'Other', icon: '📝', color: 'text-gray-600' }
};

const STATUS_LABELS: Record<FlagStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  open: { label: 'Open', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  reviewed: { label: 'Reviewed', icon: Eye, color: 'text-yellow-600 bg-yellow-50' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'text-green-600 bg-green-50' }
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface FlagCardProps {
  flag: ChatFlag;
  onStatusUpdate: (flagId: string, status: FlagStatus, notes?: string) => void;
}

function FlagCard({ flag, onStatusUpdate }: FlagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState(flag.adminNotes || '');
  
  const reasonInfo = REASON_LABELS[flag.reason];
  const statusInfo = STATUS_LABELS[flag.status];
  const StatusIcon = statusInfo.icon;

  const handleStatusChange = async (newStatus: FlagStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(flag.$id, newStatus, adminNotes.trim() || undefined);
    setIsUpdating(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.color}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-lg ${reasonInfo.color}`}>{reasonInfo.icon}</span>
                <h3 className="font-semibold text-gray-900">{reasonInfo.label}</h3>
              </div>
              <p className="text-sm text-gray-500">
                Reported by {flag.reporterRole} • {formatTimeAgo(flag.$createdAt)}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Chat: {flag.chatRoomId}</span>
          <span>Reporter: {flag.reporterId.substring(0, 8)}...</span>
          <span>Reported: {flag.reportedUserId.substring(0, 8)}...</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          {/* Flag Message */}
          {flag.message && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Report Details:</h4>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-gray-700 whitespace-pre-wrap">{flag.message}</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Admin Notes:</h4>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this report..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
            />
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {(['open', 'reviewed', 'resolved'] as FlagStatus[]).map((status) => {
              const info = STATUS_LABELS[status];
              const Icon = info.icon;
              const isActive = flag.status === status;
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating || isActive}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? `${info.color} cursor-default` 
                      : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                    }
                    disabled:opacity-50
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminChatFlagsPage() {
  const [flags, setFlags] = useState<ChatFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FlagFilter>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Load flags
  useEffect(() => {
    const loadFlags = async () => {
      setIsLoading(true);
      try {
        const allFlags = await chatFlagService.getAllFlags(filter.status, 100);
        
        // Apply client-side filters
        let filteredFlags = allFlags;
        
        if (filter.reason) {
          filteredFlags = filteredFlags.filter(flag => flag.reason === filter.reason);
        }
        
        if (filter.reporterRole && filter.reporterRole !== 'all') {
          filteredFlags = filteredFlags.filter(flag => flag.reporterRole === filter.reporterRole);
        }
        
        setFlags(filteredFlags);
      } catch (error) {
        console.error('Failed to load flags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlags();
  }, [filter, refreshKey]);

  // Handle status update
  const handleStatusUpdate = async (flagId: string, status: FlagStatus, notes?: string) => {
    const success = await chatFlagService.updateFlagStatus(flagId, status, notes);
    if (success) {
      // Update local state
      setFlags(prev => prev.map(flag => 
        flag.$id === flagId 
          ? { ...flag, status, adminNotes: notes }
          : flag
      ));
    }
  };

  // Stats
  const stats = {
    total: flags.length,
    open: flags.filter(f => f.status === 'open').length,
    reviewed: flags.filter(f => f.status === 'reviewed').length,
    resolved: flags.filter(f => f.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat Flags Dashboard</h1>
                <p className="text-gray-600">Trust & Safety Management</p>
              </div>
            </div>
            
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Flags', value: stats.total, color: 'bg-blue-500' },
            { label: 'Open', value: stats.open, color: 'bg-red-500' },
            { label: 'Reviewed', value: stats.reviewed, color: 'bg-yellow-500' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as FlagStatus || undefined }))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Reason Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select
                value={filter.reason || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, reason: e.target.value as FlagReason || undefined }))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
              >
                <option value="">All Reasons</option>
                {Object.entries(REASON_LABELS).map(([value, info]) => (
                  <option key={value} value={value}>{info.label}</option>
                ))}
              </select>
            </div>

            {/* Reporter Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
              <select
                value={filter.reporterRole || 'all'}
                onChange={(e) => setFilter(prev => ({ ...prev, reporterRole: e.target.value as 'user' | 'therapist' | 'all' }))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
              >
                <option value="all">All Reporters</option>
                <option value="user">Users Only</option>
                <option value="therapist">Therapists Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flags List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              <span className="ml-3 text-gray-600">Loading flags...</span>
            </div>
          ) : flags.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flags found</h3>
              <p className="text-gray-500">No chat reports match the current filters.</p>
            </div>
          ) : (
            flags.map((flag) => (
              <FlagCard
                key={flag.$id}
                flag={flag}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}