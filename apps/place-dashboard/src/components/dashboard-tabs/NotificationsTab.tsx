import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationsTabProps {
    placeId: string | number;
    PushNotificationSettings: React.ComponentType<any>;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ placeId, PushNotificationSettings }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Push Notifications</h2>
                    <p className="text-xs text-gray-500">Get alerts even when browsing other apps or phone is locked</p>
                </div>
            </div>
            <PushNotificationSettings 
                providerId={typeof placeId === 'string' ? parseInt(placeId) : placeId} 
                providerType="place" 
            />
        </div>
    );
};

export default NotificationsTab;
