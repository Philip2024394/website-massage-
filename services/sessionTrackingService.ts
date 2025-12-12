import { appwriteDatabases } from '../lib/appwrite/client';
import { ID } from 'appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const databases = appwriteDatabases;

const ANALYTICS_COLLECTION_ID = 'user-sessions'; // You'll need to create this collection

interface SessionStart {
    userId: string;
    userName: string;
    userType: 'guest' | 'therapist' | 'place' | 'admin';
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
}

interface SessionUpdate {
    logoutTime: string;
    duration: number; // in minutes
}

class SessionTrackingService {
    private currentSessionId: string | null = null;
    private sessionStartTime: Date | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    async startSession(data: SessionStart): Promise<string> {
        try {
            // Detect device type
            const device = this.detectDevice();
            
            // Detect browser
            const browser = this.detectBrowser();

            // Get geolocation (if user allows)
            const location = await this.getGeolocation();

            const sessionData = {
                userId: data.userId,
                userName: data.userName,
                userType: data.userType,
                device: device,
                browser: browser,
                loginTime: new Date().toISOString(),
                ipAddress: await this.getIPAddress(),
                country: location?.country || 'Unknown',
                city: location?.city || 'Unknown',
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0,
                isActive: true,
                lastHeartbeat: new Date().toISOString()
            };

            const response = await databases.createDocument(
                DATABASE_ID,
                ANALYTICS_COLLECTION_ID,
                ID.unique(),
                sessionData
            );

            this.currentSessionId = response.$id;
            this.sessionStartTime = new Date();

            // Start heartbeat to track active time
            this.startHeartbeat();

            return response.$id;
        } catch (error) {
            console.error('Error starting session:', error);
            throw error;
        }
    }

    async endSession(): Promise<void> {
        if (!this.currentSessionId || !this.sessionStartTime) return;

        try {
            this.stopHeartbeat();

            const duration = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 60000);

            await databases.updateDocument(
                DATABASE_ID,
                ANALYTICS_COLLECTION_ID,
                this.currentSessionId,
                {
                    logoutTime: new Date().toISOString(),
                    duration: duration,
                    isActive: false
                }
            );

            this.currentSessionId = null;
            this.sessionStartTime = null;
        } catch (error) {
            console.error('Error ending session:', error);
        }
    }

    private startHeartbeat(): void {
        // Update session heartbeat every 30 seconds to track active time
        this.heartbeatInterval = setInterval(async () => {
            if (this.currentSessionId) {
                try {
                    await databases.updateDocument(
                        DATABASE_ID,
                        ANALYTICS_COLLECTION_ID,
                        this.currentSessionId,
                        {
                            lastHeartbeat: new Date().toISOString()
                        }
                    );
                } catch (error) {
                    console.error('Error updating heartbeat:', error);
                }
            }
        }, 30000);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    private detectBrowser(): string {
        const ua = navigator.userAgent;
        let browserName = 'Unknown';

        if (ua.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
        } else if (ua.indexOf('SamsungBrowser') > -1) {
            browserName = 'Samsung Internet';
        } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
            browserName = 'Opera';
        } else if (ua.indexOf('Trident') > -1) {
            browserName = 'Internet Explorer';
        } else if (ua.indexOf('Edge') > -1) {
            browserName = 'Edge';
        } else if (ua.indexOf('Chrome') > -1) {
            browserName = 'Chrome';
        } else if (ua.indexOf('Safari') > -1) {
            browserName = 'Safari';
        }

        return browserName;
    }

    private async getGeolocation(): Promise<{
        country: string;
        city: string;
        latitude: number;
        longitude: number;
    } | null> {
        try {
            // First try browser geolocation API
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 5000,
                    maximumAge: 300000
                });
            });

            // Use reverse geocoding to get country/city from coordinates
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();

            return {
                country: data.address?.country || 'Unknown',
                city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (error) {
            // If geolocation fails, try IP-based location
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                
                return {
                    country: data.country_name || 'Unknown',
                    city: data.city || 'Unknown',
                    latitude: data.latitude || 0,
                    longitude: data.longitude || 0
                };
            } catch (ipError) {
                console.error('Error getting location:', ipError);
                return null;
            }
        }
    }

    private async getIPAddress(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP:', error);
            return 'Unknown';
        }
    }

    // Call this when app visibility changes (user switches tabs)
    handleVisibilityChange(): void {
        if (document.hidden) {
            // User left the app
            this.stopHeartbeat();
        } else {
            // User returned to the app
            if (this.currentSessionId) {
                this.startHeartbeat();
            }
        }
    }
}

export const sessionTrackingService = new SessionTrackingService();

// Auto-end session on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        sessionTrackingService.endSession();
    });

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
        sessionTrackingService.handleVisibilityChange();
    });
}
