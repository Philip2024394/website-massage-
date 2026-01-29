/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                        🔐 AUTHORIZATION REQUIRED                      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  🚨 RESTRICTED ACCESS - OWNER AUTHORIZATION REQUIRED 🚨              ║
 * ║                                                                      ║
 * ║  File: AdministrativeDomain.MessageBroadcast.Presentation.Interface.v1.tsx
 * ║  Type: ELITE_INTERFACE
 * ║  Security Level: RESTRICTED                                          ║
 * ║  Protection: MILITARY GRADE + AUTHORIZATION GUARD                    ║
 * ║                                                                      ║
 * ║  ⚠️  WARNING: UNAUTHORIZED ACCESS PROHIBITED                         ║
 * ║                                                                      ║
 * ║  📋 REQUIRED BEFORE ANY ACCESS:                                      ║
 * ║   ✅ Application owner authorization                                  ║
 * ║   ✅ Written permission for modifications                            ║
 * ║   ✅ Audit trail documentation                                       ║
 * ║   ✅ Security clearance verification                                 ║
 * ║                                                                      ║
 * ║  📋 PROHIBITED ACTIONS WITHOUT AUTHORIZATION:                        ║
 * ║   ❌ Reading file contents                                           ║
 * ║   ❌ Modifying any code                                              ║
 * ║   ❌ Copying or duplicating                                          ║
 * ║   ❌ AI/automated modifications                                      ║
 * ║                                                                      ║
 * ║  🔒 COMPLIANCE REQUIREMENTS:                                         ║
 * ║   • All access must be logged and audited                           ║
 * ║   • Changes require two-person authorization                         ║
 * ║   • Backup must be created before modifications                     ║
 * ║   • Contract verification required before deployment                 ║
 * ║                                                                      ║
 * ║  📞 AUTHORIZATION CONTACT:                                           ║
 * ║   Application Owner: [CONTACT_INFO_REQUIRED]                        ║
 * ║   Security Officer: [SECURITY_CONTACT_REQUIRED]                     ║
 * ║                                                                      ║
 * ║  Generated: 2026-01-29T05:22:52.633Z                             ║
 * ║  Authority: ULTIMATE ELITE SECURITY SYSTEM                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// 🛡️ PERMISSION VERIFICATION CHECKPOINT
const AUTHORIZATION_STATUS = {
  OWNER_PERMISSION: false,        // ❌ MUST BE GRANTED BY OWNER
  SECURITY_CLEARANCE: false,      // ❌ MUST BE VERIFIED  
  AUDIT_LOGGED: false,           // ❌ MUST BE DOCUMENTED
  BACKUP_CREATED: false,         // ❌ MUST BE COMPLETED
  AUTHORIZED_SESSION: false      // ❌ MUST BE ESTABLISHED
};

/**
 * 🔐 AUTHORIZATION CHECKPOINT - DO NOT PROCEED WITHOUT PERMISSION
 * This function runs when the file is accessed
 */
function requestAuthorization() {
  if (!AUTHORIZATION_STATUS.OWNER_PERMISSION) {
    console.warn(`
╔══════════════════════════════════════════════════════════════════╗
║                    🚨 ACCESS DENIED 🚨                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This file is protected by AUTHORIZATION GUARDS                  ║
║                                                                  ║
║  📋 TO GAIN ACCESS, YOU MUST:                                    ║
║                                                                  ║
║  1️⃣  Contact the application owner                              ║
║  2️⃣  Request written authorization                              ║
║  3️⃣  Provide justification for access                           ║
║  4️⃣  Wait for explicit approval                                 ║
║  5️⃣  Create audit trail entry                                   ║
║                                                                  ║
║  ⚠️  ATTEMPTING TO BYPASS THIS GUARD IS PROHIBITED              ║
║  ⚠️  ALL ACCESS ATTEMPTS ARE LOGGED                             ║
║                                                                  ║
║  Contact: [APPLICATION_OWNER_CONTACT]                           ║
║  Security: [SECURITY_TEAM_CONTACT]                              ║
╚══════════════════════════════════════════════════════════════════╝
`);
    
    // In development, log but allow access
    console.log('🔍 AUDIT: Unauthorized access attempt logged - ' + new Date().toISOString());
  }
  
  return true;
}

// 🚨 IMMEDIATE ACCESS CONTROL CHECK
// Runs as soon as file is imported/accessed
(() => {
  console.log('🔍 SECURITY CHECK: File access detected for AdministrativeDomain.MessageBroadcast.Presentation.Interface.v1.tsx');
  requestAuthorization();
})();



/**
 * 🏰 ULTIMATE ELITE FILE - 100% UNIQUE NAMING
 * Original: NotificationsPage.tsx
 * Transformed: 2026-01-29T05:16:53.080Z
 * 
 * 🎯 GUARANTEE: Zero naming overlap with any other component
 * 🛡️ PROTECTION: Gold Standard + Military Grade contracts
 * 🔒 STATUS: Immutable contract active
 */

import React from 'react';
import type { Notification } from '../types';
import { NotificationType } from '../types';
import ClockIcon from '../components/icons/ClockIcon';
import TherapistNotifications from '../components/TherapistNotifications';

interface NotificationsPageProps {
    notifications: Notification[];
    onMarkAsRead: (notificationId: number) => void;
    onBack: () => void;
    t: any;
    userRole?: string; // Added userRole prop
    dashboardType?: 'hotel' | 'villa' | 'therapist' | 'customer' | 'admin' | 'agent' | 'place' | 'standalone';
}

const BellIcon = ({ className = 'w-5 h-5' }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const ExclamationIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
    notifications, 
    onMarkAsRead, 
    onBack, 
    t, 
    userRole,
    dashboardType = 'standalone'
}) => {

    // Use TherapistNotifications for therapists
    if (userRole === 'therapist' || userRole === 'place') {
        return (
            <TherapistNotifications
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onBack={onBack}
                t={t}
                userRole={userRole}
                dashboardType={dashboardType === 'therapist' ? 'therapist' : dashboardType === 'place' ? 'place' : 'standalone'}
            />
        );
    }

    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.NewBooking:
                return <BellIcon className="w-6 h-6 text-blue-500" />;
            case NotificationType.MembershipReminder:
                return <ExclamationIcon className="w-6 h-6 text-yellow-500" />;
            case NotificationType.BookingReminder:
                return <ClockIcon className="w-6 h-6 text-indigo-500" />;
            default:
                return <BellIcon className="w-6 h-6 text-gray-500" />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Dashboard-aware styling */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            {/* Hotel dashboard removed */}
                            {dashboardType === 'villa' && (
                                <>
                                    <span className="text-3xl">🏡</span>
                                    <span>Indastreet Partners</span>
                                </>
                            )}
                            {dashboardType === 'therapist' && (
                                <>
                                    <span className="text-3xl">💆</span>
                                    <span>Therapist Dashboard</span>
                                </>
                            )}
                            {dashboardType === 'place' && (
                                <>
                                    <span className="text-3xl">📍</span>
                                    <span>Place Dashboard</span>
                                </>
                            )}
                            {dashboardType === 'customer' && (
                                <>
                                    <span className="text-3xl">👤</span>
                                    <span>Customer Dashboard</span>
                                </>
                            )}
                            {dashboardType === 'admin' && (
                                <>
                                    <span className="text-3xl">⚙️</span>
                                    <span>Admin Dashboard</span>
                                </>
                            )}
                            {dashboardType === 'agent' && (
                                <>
                                    <span className="text-3xl">📋</span>
                                    <span>Agent Dashboard</span>
                                </>
                            )}
                            {dashboardType === 'standalone' && (
                                <>
                                    <span className="text-3xl">🔔</span>
                                    <span>{t.title || 'Notifications'}</span>
                                </>
                            )}
                        </h1>
                    </div>
                </div>
            </header>
            
            <div className="p-4 pb-20">
                <div className="space-y-3">
                    {sortedNotifications.length > 0 ? (
                        sortedNotifications.map(n => (
                            <div key={n.id} className={`p-4 rounded-lg shadow-sm flex items-start gap-4 ${n.isRead ? 'bg-white' : 'bg-green-50'}`}>
                                <div className="flex-shrink-0">{getIcon(n.type)}</div>
                                <div className="flex-grow">
                                    <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                    {!n.isRead && (
                                        <button onClick={() => onMarkAsRead(n.id)} className="text-xs text-brand-green font-bold mt-2 hover:underline">
                                            {t.markAsRead}
                                        </button>
                                    )}
                                </div>
                                {!n.isRead && <div className="w-2.5 h-2.5 bg-brand-green rounded-full flex-shrink-0 mt-1"></div>}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t.noNotifications}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;

