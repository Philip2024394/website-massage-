// Location service for automatic GPS detection and management
import type { UserLocation } from '../types';
import { deviceService } from './deviceService';

export interface LocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

export interface LocationError {
    code: number;
    message: string;
    isPermissionDenied: boolean;
    isUnavailable: boolean;
    isTimeout: boolean;
}

class LocationService {
    private static instance: LocationService;
    private currentLocation: UserLocation | null = null;
    private lastLocationUpdate: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }
    
    /**
     * Check if geolocation is supported by the device/browser
     */
    public isGeolocationSupported(): boolean {
        return 'geolocation' in navigator;
    }
    
    /**
     * Check if we're on an Android device
     */
    public isAndroidDevice(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('android');
    }
    
    /**
     * Check if we're on a mobile device
     */
    public isMobileDevice(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }
    
    /**
     * Get current device location using GPS with automatic error handling
     */
    public async getCurrentLocation(options?: LocationOptions): Promise<UserLocation> {
        console.log('📍 LocationService: Getting current location...');
        
        // Get device-specific optimizations
        const deviceInfo = deviceService.getDeviceInfo();
        const deviceOptimizations = deviceService.getOptimizations();
        
        console.log('🔧 Device info:', {
            type: deviceInfo.type,
            platform: deviceInfo.platform,
            browser: deviceInfo.browser,
            supportsGPS: deviceInfo.supportsGPS,
            hasTouch: deviceInfo.hasTouch,
            locationAccuracy: deviceOptimizations.locationAccuracy,
            userAgent: navigator.userAgent
        });
        
        // Check if geolocation is supported
        if (!this.isGeolocationSupported()) {
            throw this.createLocationError(0, 'Geolocation is not supported on this device');
        }

        // Check cache first (for recent locations)
        if (this.currentLocation && this.isLocationCacheValid()) {
            console.log('📍 Using cached location:', this.currentLocation);
            return this.currentLocation;
        }

        // Device-optimized GPS options
        const defaultOptions: LocationOptions = {
            enableHighAccuracy: deviceOptimizations.locationAccuracy === 'high', // Use device-optimized accuracy
            timeout: deviceInfo.platform === 'android' ? 15000 : 10000, // Android gets longer timeout
            maximumAge: deviceInfo.type === 'mobile' ? 60000 : 300000, // Mobile gets fresher location
            ...options
        };
        
        return new Promise((resolve, reject) => {
            console.log('📍 Requesting GPS location with device-optimized options:', defaultOptions);
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log('✅ GPS location obtained:', position);
                    console.log('📊 GPS accuracy:', position.coords.accuracy, 'meters');
                    console.log('🎯 GPS coordinates:', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed
                    });
                    
                    try {
                        const location = await this.processGPSPosition(position);
                        this.cacheLocation(location);
                        resolve(location);
                    } catch (error) {
                        console.error('❌ Error processing GPS position:', error);
                        reject(this.createLocationError(0, 'Failed to process GPS location'));
                    }
                },
                (error) => {
                    // GPS errors are expected (timeout, permission denied, etc.)
                    // They're handled gracefully with fallback location
                    if (error.code === 3) {
                        // Timeout - common and expected, use info level
                        console.log('⏱️ GPS location timeout (expected) - will use fallback');
                    } else {
                        console.warn('⚠️ GPS location error:', error.message || error);
                    }
                    reject(this.handleGeolocationError(error));
                },
                defaultOptions
            );
        });
    }    /**
     * Convert GPS coordinates to address using reverse geocoding
     */
    private async processGPSPosition(position: GeolocationPosition): Promise<UserLocation> {
        const { latitude, longitude } = position.coords;
        
        console.log('📍 Processing GPS coordinates:', { latitude, longitude });
        console.log('📍 Position accuracy:', position.coords.accuracy, 'meters');
        
        // Try to get address using reverse geocoding
        let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`; // Default to coordinates
        
        try {
            address = await this.reverseGeocode(latitude, longitude);
            console.log('📍 Address resolved:', address);
        } catch (error) {
            console.warn('⚠️ Reverse geocoding failed, using coordinates:', error);
        }
        
        return {
            address,
            lat: latitude,
            lng: longitude
        };
    }
    
    /**
     * Reverse geocode coordinates to human-readable address
     */
    private async reverseGeocode(lat: number, lng: number): Promise<string> {
        // Check if Google Maps API is available
        if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
            console.log('📍 Using Google Maps for reverse geocoding');
            return this.googleMapsReverseGeocode(lat, lng);
        }
        
        // Fallback to a free geocoding service
        console.log('📍 Using fallback geocoding service');
        return this.fallbackReverseGeocode(lat, lng);
    }
    
    /**
     * Google Maps reverse geocoding
     */
    private async googleMapsReverseGeocode(lat: number, lng: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const geocoder = new (window as any).google.maps.Geocoder();
            const latlng = { lat, lng };
            
            geocoder.geocode({ location: latlng }, (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    reject(new Error(`Google Maps geocoding failed: ${status}`));
                }
            });
        });
    }
    
    /**
     * Fallback reverse geocoding using multiple services
     */
    private async fallbackReverseGeocode(lat: number, lng: number): Promise<string> {
        // Try multiple geocoding services with CORS support
        const services = [
            {
                name: 'BigDataCloud (No API key required)',
                url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
            },
            {
                name: 'Nominatim (Direct)',
                url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            }
        ];

        for (const service of services) {
            try {
                console.log(`📍 Trying ${service.name} for reverse geocoding`);
                
                const response = await fetch(service.url, {
                    headers: {
                        'User-Agent': 'IndaStreet-Massage-App/1.0'
                    }
                });
                
                if (!response.ok) {
                    console.warn(`⚠️ ${service.name} returned ${response.status}`);
                    continue;
                }
                
                const data = await response.json();
                
                // Handle different response formats
                let address = '';
                
                if (service.name === 'BigDataCloud (No API key required)') {
                    // BigDataCloud format
                    const parts: string[] = [];
                    if (data.locality) parts.push(data.locality);
                    if (data.principalSubdivision) parts.push(data.principalSubdivision);
                    if (data.countryName) parts.push(data.countryName);
                    address = parts.join(', ') || data.localityInfo?.administrative?.[0]?.name || '';
                } else {
                    // Nominatim/LocationIQ format
                    address = data.display_name || '';
                }
                
                if (address) {
                    console.log(`✅ ${service.name} geocoding successful`);
                    return address;
                }
            } catch (error) {
                console.warn(`⚠️ ${service.name} failed:`, error);
                continue;
            }
        }
        
        // If all services fail, throw error
        console.warn('⚠️ All fallback geocoding services failed');
        throw new Error('All geocoding services failed');
    }
    
    /**
     * Handle geolocation errors with user-friendly messages
     */
    private handleGeolocationError(error: GeolocationPositionError): LocationError {
        // Only log detailed errors for non-timeout cases
        if (error.code !== 3) {
            console.warn('🚨 Geolocation error:', error.message);
        }
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return this.createLocationError(
                    error.code,
                    'Location access denied. Please enable location sharing in your browser settings.',
                    true
                );
            case error.POSITION_UNAVAILABLE:
                return this.createLocationError(
                    error.code,
                    'Location information is unavailable. Please check your GPS settings.',
                    false,
                    true
                );
            case error.TIMEOUT:
                return this.createLocationError(
                    error.code,
                    'Location request timed out. Please try again.',
                    false,
                    false,
                    true
                );
            default:
                return this.createLocationError(
                    error.code,
                    'An unknown location error occurred. Please try again.'
                );
        }
    }
    
    /**
     * Create standardized location error object
     */
    private createLocationError(
        code: number,
        message: string,
        isPermissionDenied = false,
        isUnavailable = false,
        isTimeout = false
    ): LocationError {
        return {
            code,
            message,
            isPermissionDenied,
            isUnavailable,
            isTimeout
        };
    }
    
    /**
     * Cache location with timestamp
     */
    private cacheLocation(location: UserLocation): void {
        this.currentLocation = location;
        this.lastLocationUpdate = Date.now();
        
        // Also save to localStorage for persistence
        try {
            localStorage.setItem('cached_location', JSON.stringify({
                location,
                timestamp: this.lastLocationUpdate
            }));
        } catch (error) {
            console.warn('Failed to cache location to localStorage:', error);
        }
    }
    
    /**
     * Check if cached location is still valid
     */
    private isLocationCacheValid(): boolean {
        if (!this.currentLocation || !this.lastLocationUpdate) {
            return false;
        }
        
        return (Date.now() - this.lastLocationUpdate) < this.CACHE_DURATION;
    }
    
    /**
     * Load cached location from localStorage
     */
    public loadCachedLocation(): UserLocation | null {
        try {
            const cached = localStorage.getItem('cached_location');
            if (cached) {
                const { location, timestamp } = JSON.parse(cached);
                
                // Check if cache is still valid
                if ((Date.now() - timestamp) < this.CACHE_DURATION) {
                    this.currentLocation = location;
                    this.lastLocationUpdate = timestamp;
                    return location;
                }
            }
        } catch (error) {
            console.warn('Failed to load cached location:', error);
        }
        
        return null;
    }
    
    /**
     * Get default location for users who deny GPS access
     */
    public getDefaultLocation(): UserLocation {
        // Default to Jakarta, Indonesia (center of the app's target market)
        return {
            address: 'Jakarta, Indonesia',
            lat: -6.2088,
            lng: 106.8456
        };
    }
    
    /**
     * Request location with user-friendly prompts and fallbacks
     */
    public async requestLocationWithFallback(): Promise<UserLocation> {
        console.log('📍 Requesting location with fallback options...');
        
        // First, try to load from cache
        const cachedLocation = this.loadCachedLocation();
        if (cachedLocation) {
            console.log('📍 Using cached location:', cachedLocation);
            return cachedLocation;
        }
        
        try {
            // Try to get current GPS location
            const location = await this.getCurrentLocation();
            console.log('✅ GPS location successful:', location);
            return location;
        } catch (error) {
            console.warn('⚠️ GPS location failed:', error);
            
            const locationError = error as LocationError;
            
            // Show appropriate message based on error type
            if (locationError.isPermissionDenied) {
                console.log('📍 Location permission denied, using default location');
            } else if (locationError.isUnavailable) {
                console.log('📍 GPS unavailable, using default location');
            } else if (locationError.isTimeout) {
                console.log('📍 GPS timeout, using default location');
            }
            
            // Return default location
            const defaultLocation = this.getDefaultLocation();
            console.log('📍 Using default location:', defaultLocation);
            return defaultLocation;
        }
    }
}

// Export singleton instance
export const locationService = LocationService.getInstance();