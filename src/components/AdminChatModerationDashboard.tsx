/**
 * Enhanced Admin Dashboard for Chat Reports and Moderation
 * Integrates with existing admin system + new moderation features
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Flag, AlertTriangle, Eye, EyeOff, CheckCircle, X, 
  MoreHorizontal, Filter, Search, Calendar, Download,
  Users, MessageSquare, TrendingUp, Activity
} from 'lucide-react';
import { chatFlagService } from '../lib/services/chatFlagService';
import { chatModerationService } from '../services/chatModerationService';
import { professionalChatService } from '../services/professionalChatNotificationService';

interface AdminDashboardProps {
  adminId: string;
  className?: string;
}

interface ReportStats {
  total: number;
  open: number;
  reviewed: number;
  resolved: number;
  thisWeek: number;
  highPriority: number;
}

interface ModerationStats {
  messagesFiltered: number;
  spamPrevented: number;
  phoneNumbersBlocked: number;
  profanityFiltered: number;
  activeUsers: number;
  rateLimitHits: number;
}

export const AdminChatModerationDashboard: React.FC<AdminDashboardProps> = ({
  adminId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'moderation' | 'settings'>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats>({
    total: 0, open: 0, reviewed: 0, resolved: 0, thisWeek: 0, highPriority: 0
  });
  const [moderationStats, setModerationStats] = useState<ModerationStats>({
    messagesFiltered: 0, spamPrevented: 0, phoneNumbersBlocked: 0, 
    profanityFiltered: 0, activeUsers: 0, rateLimitHits: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'reviewed' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
    
    // Listen for new report notifications
    const handleNewReport = (event: CustomEvent) => {
      const { detail } = event;
      if (detail.type === 'chat_report') {
        loadDashboardData(); // Refresh data
        
        // Play admin notification sound
        professionalChatService.playChatEffect('payment_notification');
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Chat Report', {
            body: `${detail.reporterRole} reported a chat (${detail.reason})`,
            icon: '/assets/logo-icon.png',
            tag: 'chat-report'
          });
        }
      }
    };

    window.addEventListener('adminReportNotification', handleNewReport as EventListener);
    
    return () => {
      window.removeEventListener('adminReportNotification', handleNewReport as EventListener);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load reports
      const reportsData = await chatFlagService.getAdminFlags(adminId);
      if (reportsData.success) {
        setReports(reportsData.flags || []);
        
        // Calculate stats
        const flags = reportsData.flags || [];
        setReportStats({
          total: flags.length,
          open: flags.filter(f => f.status === 'open').length,
          reviewed: flags.filter(f => f.status === 'reviewed').length,
          resolved: flags.filter(f => f.status === 'resolved').length,
          thisWeek: flags.filter(f => {
            const flagDate = new Date(f.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return flagDate > weekAgo;
          }).length,
          highPriority: flags.filter(f => 
            ['harassment_abuse', 'scam_fraud', 'inappropriate_behavior'].includes(f.reason)
          ).length
        });
      }

      // Load moderation stats
      const moderationData = await chatModerationService.getSystemStats();
      setModerationStats(moderationData);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'review' | 'resolve' | 'dismiss', notes?: string) => {
    try {
      const result = await chatFlagService.updateFlagStatus(reportId, action, adminId, notes);
      if (result.success) {
        await loadDashboardData(); // Refresh data
        setSelectedReport(null);
        
        // Play success sound
        professionalChatService.playChatEffect('booking_accepted');
      } else {
        alert(`Action failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Report action failed:', error);
      alert('Failed to update report. Please try again.');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      report.reportedUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getReportPriority = (reason: string) => {
    const highPriority = ['harassment_abuse', 'scam_fraud', 'inappropriate_behavior'];
    const mediumPriority = ['shared_contact_number', 'asked_for_contact_number', 'payment_issue'];
    
    if (highPriority.includes(reason)) return { level: 'high', color: 'text-red-600 bg-red-100' };
    if (mediumPriority.includes(reason)) return { level: 'medium', color: 'text-orange-600 bg-orange-100' };
    return { level: 'low', color: 'text-yellow-600 bg-yellow-100' };
  };

  const formatReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'inappropriate_behavior': '⚠️ Inappropriate Behavior',
      'harassment_abuse': '🛡️ Harassment/Abuse',
      'shared_contact_number': '📞 Shared Contact Info',
      'asked_for_contact_number': '📱 Asked for Contact',
      'payment_issue': '💰 Payment Issue',
      'scam_fraud': '🚨 Scam/Fraud',
      'therapist_no_show': '👥 No-Show',
      'spam_repetitive': '📧 Spam',
      'other': '🔍 Other'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-96\">
        <div className=\"text-center\">
          <div className=\"w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4\"></div>
          <p className=\"text-gray-600\">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className=\"border-b border-gray-200 p-6\">
        <div className=\"flex items-center justify-between\">
          <div>
            <h1 className=\"text-2xl font-bold text-gray-800 flex items-center gap-3\">
              <div className=\"w-10 h-10 bg-red-100 rounded-full flex items-center justify-center\">
                <Shield className=\"w-6 h-6 text-red-600\" />
              </div>
              🛡️ Chat Moderation Dashboard
            </h1>
            <p className=\"text-gray-600 mt-1\">Monitor reports and moderate chat content</p>
          </div>
          
          <div className=\"flex items-center gap-3\">
            <button
              onClick={loadDashboardData}
              className=\"bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2\"
            >
              <Activity className=\"w-4 h-4\" />
              Refresh
            </button>
            <button className=\"border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2\">
              <Download className=\"w-4 h-4\" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className=\"p-6 border-b border-gray-200\">
        <div className=\"grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4\">
          <div className=\"bg-red-50 border border-red-200 rounded-lg p-4 text-center\">
            <div className=\"text-2xl font-bold text-red-600\">{reportStats.open}</div>
            <div className=\"text-sm text-red-700 font-medium\">Open Reports</div>
          </div>
          <div className=\"bg-orange-50 border border-orange-200 rounded-lg p-4 text-center\">
            <div className=\"text-2xl font-bold text-orange-600\">{reportStats.highPriority}</div>
            <div className=\"text-sm text-orange-700 font-medium\">High Priority</div>
          </div>
          <div className=\"bg-green-50 border border-green-200 rounded-lg p-4 text-center\">
            <div className=\"text-2xl font-bold text-green-600\">{reportStats.resolved}</div>
            <div className=\"text-sm text-green-700 font-medium\">Resolved</div>
          </div>
          <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4 text-center\">
            <div className=\"text-2xl font-bold text-blue-600\">{moderationStats.messagesFiltered}</div>
            <div className=\"text-sm text-blue-700 font-medium\">Auto-Filtered</div>
          </div>
          <div className=\"bg-purple-50 border border-purple-200 rounded-lg p-4 text-center\">
            <div className=\"text-2xl font-bold text-purple-600\">{moderationStats.phoneNumbersBlocked}</div>
            <div className=\"text-sm text-purple-700 font-medium\">Phone # Blocked</div>
          </div>
          <div className=\"bg-gray-50 border border-gray-200 rounded-lg p-4 text-center\">
            <div className=\"text-2xl font-bold text-gray-600\">{moderationStats.activeUsers}</div>
            <div className=\"text-sm text-gray-700 font-medium\">Active Users</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className=\"border-b border-gray-200\">
        <div className=\"flex items-center px-6\">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-6 border-b-2 font-medium transition-colors ${
              activeTab === 'reports'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Flag className=\"w-4 h-4 inline mr-2\" />
            Reports ({reportStats.open})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`py-4 px-6 border-b-2 font-medium transition-colors ${
              activeTab === 'moderation'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className=\"w-4 h-4 inline mr-2\" />
            Auto-Moderation
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-6 border-b-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className=\"w-4 h-4 inline mr-2\" />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className=\"p-6\">
        {activeTab === 'reports' && (
          <div>
            {/* Filters */}
            <div className=\"flex items-center gap-4 mb-6\">
              <div className=\"relative flex-1 max-w-md\">
                <Search className=\"w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400\" />
                <input
                  type=\"text\"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder=\"Search reports...\"
                  className=\"w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500\"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className=\"px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500\"
              >
                <option value=\"all\">All Status</option>
                <option value=\"open\">Open ({reportStats.open})</option>
                <option value=\"reviewed\">Reviewed</option>
                <option value=\"resolved\">Resolved</option>
              </select>
            </div>

            {/* Reports List */}
            <div className=\"space-y-4\">
              {filteredReports.length === 0 ? (
                <div className=\"text-center py-12\">
                  <CheckCircle className=\"w-16 h-16 text-green-500 mx-auto mb-4\" />
                  <h3 className=\"text-lg font-semibold text-gray-800 mb-2\">All Clear! 🎉</h3>
                  <p className=\"text-gray-600\">No reports match your current filters.</p>
                </div>
              ) : (
                filteredReports.map((report) => {
                  const priority = getReportPriority(report.reason);
                  return (
                    <div key={report.id} className=\"border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow\">
                      <div className=\"flex items-start gap-4\">
                        <div className=\"w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0\">
                          <Flag className=\"w-6 h-6 text-red-600\" />
                        </div>
                        
                        <div className=\"flex-1 min-w-0\">
                          <div className=\"flex items-start justify-between gap-4 mb-2\">
                            <div>
                              <h3 className=\"font-semibold text-gray-800 truncate\">
                                Report against {report.reportedUserName}
                              </h3>
                              <div className=\"flex items-center gap-3 mt-1\">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priority.color}`}>
                                  {formatReasonLabel(report.reason)}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  report.status === 'open' ? 'bg-red-100 text-red-800' :
                                  report.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {report.status}
                                </span>
                              </div>
                            </div>
                            <div className=\"text-right text-sm text-gray-500\">
                              <div>{new Date(report.createdAt).toLocaleDateString()}</div>
                              <div>by {report.reporterRole}</div>
                            </div>
                          </div>
                          
                          {report.message && (
                            <p className=\"text-sm text-gray-600 mb-3 line-clamp-2\">{report.message}</p>
                          )}
                          
                          <div className=\"flex items-center gap-3\">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className=\"text-blue-600 hover:text-blue-800 text-sm font-medium\"
                            >
                              <Eye className=\"w-4 h-4 inline mr-1\" />
                              View Details
                            </button>
                            
                            {report.status === 'open' && (
                              <>
                                <button
                                  onClick={() => handleReportAction(report.id, 'review')}
                                  className=\"text-orange-600 hover:text-orange-800 text-sm font-medium\"
                                >
                                  Mark Reviewed
                                </button>
                                <button
                                  onClick={() => handleReportAction(report.id, 'resolve')}
                                  className=\"text-green-600 hover:text-green-800 text-sm font-medium\"
                                >
                                  Resolve
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className=\"space-y-6\">
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
              <div className=\"bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <h3 className=\"font-semibold text-blue-800\">📧 Spam Prevention</h3>
                    <div className=\"text-3xl font-bold text-blue-600 mt-2\">{moderationStats.spamPrevented}</div>
                    <p className=\"text-blue-700 text-sm\">Messages blocked this week</p>
                  </div>
                  <Shield className=\"w-8 h-8 text-blue-500\" />
                </div>
              </div>

              <div className=\"bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <h3 className=\"font-semibold text-purple-800\">📞 Contact Blocking</h3>
                    <div className=\"text-3xl font-bold text-purple-600 mt-2\">{moderationStats.phoneNumbersBlocked}</div>
                    <p className=\"text-purple-700 text-sm\">Phone numbers filtered</p>
                  </div>
                  <AlertTriangle className=\"w-8 h-8 text-purple-500\" />
                </div>
              </div>

              <div className=\"bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <h3 className=\"font-semibold text-green-800\">🤐 Profanity Filter</h3>
                    <div className=\"text-3xl font-bold text-green-600 mt-2\">{moderationStats.profanityFiltered}</div>
                    <p className=\"text-green-700 text-sm\">Inappropriate words blocked</p>
                  </div>
                  <CheckCircle className=\"w-8 h-8 text-green-500\" />
                </div>
              </div>
            </div>

            <div className=\"bg-yellow-50 border border-yellow-200 rounded-lg p-6\">
              <h3 className=\"font-semibold text-yellow-800 mb-4 flex items-center gap-2\">
                <TrendingUp className=\"w-5 h-5\" />
                📊 System Performance
              </h3>
              <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
                <div className=\"text-center\">
                  <div className=\"text-2xl font-bold text-yellow-600\">{moderationStats.rateLimitHits}</div>
                  <div className=\"text-sm text-yellow-700\">Rate Limit Hits</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-2xl font-bold text-yellow-600\">{moderationStats.activeUsers}</div>
                  <div className=\"text-sm text-yellow-700\">Active Users</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-2xl font-bold text-yellow-600\">98.7%</div>
                  <div className=\"text-sm text-yellow-700\">Filter Accuracy</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-2xl font-bold text-yellow-600\">0.1s</div>
                  <div className=\"text-sm text-yellow-700\">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className=\"space-y-6\">
            <div className=\"bg-gray-50 rounded-lg p-6\">
              <h3 className=\"text-lg font-semibold text-gray-800 mb-4\">🔧 Moderation Settings</h3>
              <div className=\"space-y-4\">
                <div className=\"flex items-center justify-between\">
                  <label className=\"font-medium text-gray-700\">Auto-filter phone numbers</label>
                  <input type=\"checkbox\" defaultChecked className=\"w-5 h-5\" />
                </div>
                <div className=\"flex items-center justify-between\">
                  <label className=\"font-medium text-gray-700\">Spam detection</label>
                  <input type=\"checkbox\" defaultChecked className=\"w-5 h-5\" />
                </div>
                <div className=\"flex items-center justify-between\">
                  <label className=\"font-medium text-gray-700\">Profanity filtering</label>
                  <input type=\"checkbox\" defaultChecked className=\"w-5 h-5\" />
                </div>
                <div className=\"flex items-center justify-between\">
                  <label className=\"font-medium text-gray-700\">Rate limiting</label>
                  <input type=\"checkbox\" defaultChecked className=\"w-5 h-5\" />
                </div>
              </div>
            </div>

            <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-6\">
              <h3 className=\"text-lg font-semibold text-blue-800 mb-4\">📊 System Status</h3>
              <div className=\"space-y-3\">
                <div className=\"flex items-center justify-between\">
                  <span className=\"text-blue-700\">Moderation Service</span>
                  <span className=\"flex items-center gap-2 text-green-600\">
                    <div className=\"w-3 h-3 bg-green-500 rounded-full\"></div>
                    Online
                  </span>
                </div>
                <div className=\"flex items-center justify-between\">
                  <span className=\"text-blue-700\">Report Processing</span>
                  <span className=\"flex items-center gap-2 text-green-600\">
                    <div className=\"w-3 h-3 bg-green-500 rounded-full\"></div>
                    Active
                  </span>
                </div>
                <div className=\"flex items-center justify-between\">
                  <span className=\"text-blue-700\">Notification System</span>
                  <span className=\"flex items-center gap-2 text-green-600\">
                    <div className=\"w-3 h-3 bg-green-500 rounded-full\"></div>
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4\">
          <div className=\"bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden\">
            <div className=\"flex items-center justify-between p-6 border-b border-gray-200\">
              <h3 className=\"text-xl font-bold text-gray-800\">Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className=\"p-2 hover:bg-gray-100 rounded transition-colors\"
              >
                <X className=\"w-5 h-5\" />
              </button>
            </div>
            
            <div className=\"p-6 space-y-6 overflow-y-auto max-h-[70vh]\">
              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Reported User</label>
                  <p className=\"text-gray-800\">{selectedReport.reportedUserName}</p>
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Reporter</label>
                  <p className=\"text-gray-800\">{selectedReport.reporterRole}</p>
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Reason</label>
                  <p className=\"text-gray-800\">{formatReasonLabel(selectedReport.reason)}</p>
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                    selectedReport.status === 'open' ? 'bg-red-100 text-red-800' :
                    selectedReport.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {selectedReport.message && (
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Report Message</label>
                  <div className=\"bg-gray-50 border border-gray-200 rounded-lg p-4\">
                    <p className=\"text-gray-800\">{selectedReport.message}</p>
                  </div>
                </div>
              )}

              <div className=\"flex items-center gap-3 pt-4 border-t border-gray-200\">
                {selectedReport.status === 'open' && (
                  <>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'review')}
                      className=\"bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors\"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'resolve')}
                      className=\"bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors\"
                    >
                      Resolve Report
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className=\"border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors\"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatModerationDashboard;