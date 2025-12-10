import React, { useState, useEffect } from 'react';
import { 
    Globe, Users, Clock, MapPin, TrendingUp, Activity,
    Calendar, Download, RefreshCw, Monitor, Smartphone
} from 'lucide-react';

interface SessionData {
    $id: string;
    userId: string;
    userName: string;
    userType: 'guest' | 'therapist' | 'place' | 'admin';
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    loginTime: Date;
    logoutTime?: Date;
    duration: number; // in minutes
    ipAddress: string;
}

interface CountryStats {
    country: string;
    code: string;
    sessions: number;
    avgDuration: number;
    uniqueUsers: number;
}

interface TrafficPattern {
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    hour: number; // 0-23
    sessions: number;
    avgDuration: number;
}

interface DayStats {
    day: string;
    sessions: number;
    peakHours: number[];
    avgDuration: number;
}

interface GoogleAdsRecommendation {
    dayOfWeek: string;
    bestHours: string[];
    trafficScore: number;
    reason: string;
}

const GlobalAnalytics: React.FC = () => {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [showTrafficAnalysis, setShowTrafficAnalysis] = useState(false);

    // Total stats
    const totalSessions = sessions.length;
    const uniqueUsers = new Set(sessions.map(s => s.userId)).size;
    const avgDuration = sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length 
        : 0;
    const mobileUsers = sessions.filter(s => s.device === 'mobile').length;
    const desktopUsers = sessions.filter(s => s.device === 'desktop').length;

    // Calculate traffic patterns by day and hour
    const getTrafficPatterns = (): Map<string, TrafficPattern[]> => {
        const patterns = new Map<string, TrafficPattern[]>();
        
        sessions.forEach(session => {
            const date = new Date(session.loginTime);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            const hour = date.getHours();
            const key = `${dayOfWeek}-${hour}`;
            
            const existing = patterns.get(key);
            if (existing) {
                existing[0].sessions++;
                existing[0].avgDuration = (existing[0].avgDuration * (existing[0].sessions - 1) + session.duration) / existing[0].sessions;
            } else {
                patterns.set(key, [{
                    dayOfWeek,
                    hour,
                    sessions: 1,
                    avgDuration: session.duration
                }]);
            }
        });
        
        return patterns;
    };

    // Calculate daily stats with peak hours
    const getDailyStats = (): DayStats[] => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const _patterns = getTrafficPatterns();
        const dailyStats: DayStats[] = [];

        for (let day = 0; day < 7; day++) {
            const daySessions = sessions.filter(s => new Date(s.loginTime).getDay() === day);
            
            // Find peak hours (top 3 busiest hours)
            const hourlyTraffic = new Map<number, number>();
            daySessions.forEach(s => {
                const hour = new Date(s.loginTime).getHours();
                hourlyTraffic.set(hour, (hourlyTraffic.get(hour) || 0) + 1);
            });
            
            const peakHours = Array.from(hourlyTraffic.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([hour]) => hour)
                .sort((a, b) => a - b);

            const avgDuration = daySessions.length > 0
                ? daySessions.reduce((acc, s) => acc + s.duration, 0) / daySessions.length
                : 0;

            dailyStats.push({
                day: dayNames[day],
                sessions: daySessions.length,
                peakHours,
                avgDuration
            });
        }

        return dailyStats;
    };

    // Generate Google Ads recommendations
    const getGoogleAdsRecommendations = (): GoogleAdsRecommendation[] => {
        const dailyStats = getDailyStats();
        const recommendations: GoogleAdsRecommendation[] = [];

        dailyStats.forEach(stat => {
            if (stat.sessions === 0) {
                recommendations.push({
                    dayOfWeek: stat.day,
                    bestHours: ['9:00 AM - 11:00 AM', '2:00 PM - 5:00 PM', '7:00 PM - 9:00 PM'],
                    trafficScore: 0,
                    reason: 'No traffic data yet. Recommended hours based on industry standards for massage/wellness services.'
                });
                return;
            }

            const bestHours = stat.peakHours.map(hour => {
                const start = hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
                const endHour = (hour + 1) % 24;
                const end = endHour === 0 ? '12:00 AM' : endHour < 12 ? `${endHour}:00 AM` : endHour === 12 ? '12:00 PM' : `${endHour - 12}:00 PM`;
                return `${start} - ${end}`;
            });

            // Calculate traffic score (0-100)
            const maxSessions = Math.max(...dailyStats.map(d => d.sessions));
            const trafficScore = maxSessions > 0 ? Math.round((stat.sessions / maxSessions) * 100) : 0;

            let reason = '';
            if (trafficScore >= 80) {
                reason = `Peak traffic day! ${stat.sessions} sessions with ${stat.avgDuration.toFixed(1)}min avg engagement. Run ads 1-2 hours before peak times.`;
            } else if (trafficScore >= 50) {
                reason = `High traffic day with ${stat.sessions} sessions. Good ROI potential during peak hours.`;
            } else if (trafficScore >= 30) {
                reason = `Moderate traffic (${stat.sessions} sessions). Consider lower bids or focus on high-converting keywords.`;
            } else {
                reason = `Low traffic day (${stat.sessions} sessions). Minimal ad spend recommended or skip this day.`;
            }

            recommendations.push({
                dayOfWeek: stat.day,
                bestHours: bestHours.length > 0 ? bestHours : ['No clear peak - distribute evenly'],
                trafficScore,
                reason
            });
        });

        return recommendations.sort((a, b) => b.trafficScore - a.trafficScore);
    };

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // TODO: Fetch from Appwrite analytics collection
            // This would track:
            // - User login/logout events
            // - Geolocation from IP address
            // - Session duration
            // - Device type and browser info
            
            // Placeholder data structure
            const mockSessions: SessionData[] = [
                {
                    $id: '1',
                    userId: 'user1',
                    userName: 'John Doe',
                    userType: 'therapist',
                    country: 'Indonesia',
                    city: 'Bali',
                    latitude: -8.4095,
                    longitude: 115.1889,
                    device: 'mobile',
                    browser: 'Chrome',
                    loginTime: new Date(Date.now() - 3600000),
                    duration: 45,
                    ipAddress: '103.xxx.xxx.xxx'
                },
                {
                    $id: '2',
                    userId: 'user2',
                    userName: 'Jane Smith',
                    userType: 'place',
                    country: 'Indonesia',
                    city: 'Jakarta',
                    latitude: -6.2088,
                    longitude: 106.8456,
                    device: 'desktop',
                    browser: 'Firefox',
                    loginTime: new Date(Date.now() - 7200000),
                    duration: 120,
                    ipAddress: '103.xxx.xxx.xxx'
                },
                {
                    $id: '3',
                    userId: 'user3',
                    userName: 'Mike Johnson',
                    userType: 'guest',
                    country: 'Singapore',
                    city: 'Singapore',
                    latitude: 1.3521,
                    longitude: 103.8198,
                    device: 'mobile',
                    browser: 'Safari',
                    loginTime: new Date(Date.now() - 1800000),
                    duration: 30,
                    ipAddress: '202.xxx.xxx.xxx'
                }
            ];

            setSessions(mockSessions);
            calculateCountryStats(mockSessions);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateCountryStats = (sessionData: SessionData[]) => {
        const countryMap = new Map<string, {
            sessions: number;
            totalDuration: number;
            users: Set<string>;
        }>();

        sessionData.forEach(session => {
            const existing = countryMap.get(session.country) || {
                sessions: 0,
                totalDuration: 0,
                users: new Set()
            };

            existing.sessions++;
            existing.totalDuration += session.duration;
            existing.users.add(session.userId);

            countryMap.set(session.country, existing);
        });

        const stats: CountryStats[] = Array.from(countryMap.entries()).map(([country, data]) => ({
            country,
            code: getCountryCode(country),
            sessions: data.sessions,
            avgDuration: data.totalDuration / data.sessions,
            uniqueUsers: data.users.size
        }));

        stats.sort((a, b) => b.sessions - a.sessions);
        setCountryStats(stats);
    };

    const getCountryCode = (country: string): string => {
        const codes: Record<string, string> = {
            'Indonesia': 'ID',
            'Singapore': 'SG',
            'Malaysia': 'MY',
            'Thailand': 'TH',
            'Philippines': 'PH',
            'Vietnam': 'VN'
        };
        return codes[country] || 'XX';
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const exportData = () => {
        const csv = [
            ['User', 'Country', 'City', 'Device', 'Login Time', 'Duration (min)'],
            ...sessions.map(s => [
                s.userName,
                s.country,
                s.city,
                s.device,
                s.loginTime.toISOString(),
                s.duration.toString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString()}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Globe className="w-8 h-8 text-blue-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Global Analytics</h1>
                            <p className="text-gray-500">User sessions and activity worldwide</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="all">All Time</option>
                        </select>
                        <button
                            onClick={loadAnalytics}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowTrafficAnalysis(!showTrafficAnalysis)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                        >
                            <TrendingUp className="w-4 h-4" />
                            {showTrafficAnalysis ? 'Hide' : 'Show'} Traffic & Ads Analysis
                        </button>
                    </div>
                </div>
            </div>

            {/* Traffic Analysis & Google Ads Recommendations */}
            {showTrafficAnalysis && (
                <div className="mb-6 space-y-6">
                    {/* Daily Traffic Patterns */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border-2 border-blue-200 p-6">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-6 h-6" />
                            Weekly Traffic Patterns
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {getDailyStats().map((dayStat) => (
                                <div key={dayStat.day} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                                    <h3 className="font-bold text-lg text-gray-800 mb-2">{dayStat.day}</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Sessions:</span>
                                            <span className="font-semibold text-blue-600">{dayStat.sessions}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Avg Time:</span>
                                            <span className="font-semibold text-green-600">{dayStat.avgDuration.toFixed(1)}m</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs font-semibold text-gray-700 mb-1">Peak Hours:</p>
                                            {dayStat.peakHours.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {dayStat.peakHours.map(hour => {
                                                        const displayHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
                                                        return (
                                                            <span key={hour} className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                                                                {displayHour}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">No data</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Google Ads Recommendations */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border-2 border-orange-200 p-6">
                        <h2 className="text-2xl font-bold text-orange-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6" />
                            Google Ads Schedule Recommendations
                        </h2>
                        <p className="text-sm text-orange-700 mb-4">
                            Based on recorded traffic patterns, here are the best times to run Google Ads for maximum ROI:
                        </p>
                        
                        <div className="space-y-4">
                            {getGoogleAdsRecommendations().map((rec, index) => (
                                <div 
                                    key={rec.dayOfWeek} 
                                    className={`bg-white rounded-lg p-5 shadow-md border-l-4 ${
                                        rec.trafficScore >= 80 ? 'border-green-500' :
                                        rec.trafficScore >= 50 ? 'border-blue-500' :
                                        rec.trafficScore >= 30 ? 'border-yellow-500' :
                                        'border-gray-400'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                                rec.trafficScore >= 80 ? 'bg-green-100 text-green-700' :
                                                rec.trafficScore >= 50 ? 'bg-blue-100 text-blue-700' :
                                                rec.trafficScore >= 30 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{rec.dayOfWeek}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                        rec.trafficScore >= 80 ? 'bg-green-100 text-green-700' :
                                                        rec.trafficScore >= 50 ? 'bg-blue-100 text-blue-700' :
                                                        rec.trafficScore >= 30 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {rec.trafficScore >= 80 ? 'HIGH PRIORITY' :
                                                         rec.trafficScore >= 50 ? 'GOOD ROI' :
                                                         rec.trafficScore >= 30 ? 'MODERATE' :
                                                         'LOW TRAFFIC'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Score: {rec.trafficScore}/100
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">📅 Best Ad Schedule Times:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.bestHours.map((timeSlot, idx) => (
                                                <span key={idx} className="inline-block px-3 py-1.5 bg-orange-100 text-orange-800 text-sm rounded-lg font-medium shadow-sm">
                                                    {timeSlot}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded p-3 border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">💡 Strategy:</span> {rec.reason}
                                        </p>
                                    </div>
                                    
                                    {rec.trafficScore >= 80 && (
                                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                            <p className="text-xs text-green-800">
                                                ⭐ <strong>Pro Tip:</strong> Schedule ads to start 1-2 hours before peak times to capture early traffic and warm up your campaign.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-white rounded-lg border-2 border-orange-300">
                            <h3 className="font-bold text-gray-800 mb-2">📊 How to Use This Data:</h3>
                            <ul className="space-y-1 text-sm text-gray-700">
                                <li>• <strong>High Priority Days:</strong> Allocate 40-50% of your budget here</li>
                                <li>• <strong>Good ROI Days:</strong> Allocate 30-35% of your budget</li>
                                <li>• <strong>Moderate Days:</strong> Allocate 15-20% with lower bids</li>
                                <li>• <strong>Low Traffic Days:</strong> Consider pausing ads or using minimal budget for retargeting only</li>
                                <li>• <strong>Best Practice:</strong> Run ads 1-2 hours before peak times to capture early intent and build momentum</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold text-gray-800">{totalSessions}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Activity className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Unique Users</p>
                    <p className="text-3xl font-bold text-gray-800">{uniqueUsers}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Avg. Session Time</p>
                    <p className="text-3xl font-bold text-gray-800">{formatDuration(avgDuration)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Monitor className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Desktop vs Mobile</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {desktopUsers} / {mobileUsers}
                    </p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Country Stats */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        Sessions by Country
                    </h2>
                    <div className="space-y-3">
                        {countryStats.map((stat) => (
                            <div
                                key={stat.country}
                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                    selectedCountry === stat.country
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setSelectedCountry(
                                    selectedCountry === stat.country ? null : stat.country
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{stat.code === 'ID' ? '🇮🇩' : stat.code === 'SG' ? '🇸🇬' : '🌍'}</span>
                                        <span className="font-semibold text-gray-800">{stat.country}</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-500">{stat.sessions}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                    <div>
                                        <Users className="w-3 h-3 inline mr-1" />
                                        {stat.uniqueUsers} users
                                    </div>
                                    <div>
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {formatDuration(stat.avgDuration)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Recent Sessions
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 text-left">
                                    <th className="pb-3 text-sm font-semibold text-gray-600">User</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-600">Location</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-600">Device</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-600">Login Time</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-600">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions
                                    .filter(s => !selectedCountry || s.country === selectedCountry)
                                    .map((session) => (
                                    <tr key={session.$id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{session.userName}</p>
                                                <p className="text-xs text-gray-500 capitalize">{session.userType}</p>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">{session.city}, {session.country}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                {session.device === 'mobile' ? (
                                                    <Smartphone className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <Monitor className="w-4 h-4 text-purple-500" />
                                                )}
                                                <span className="text-sm text-gray-700 capitalize">{session.device}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="text-sm text-gray-700">
                                                {session.loginTime.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                                                {formatDuration(session.duration)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* World Map Placeholder */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Geographic Distribution
                </h2>
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Interactive World Map</p>
                        <p className="text-sm mt-2">Integrate with mapping library (e.g., Leaflet, Google Maps)</p>
                        <p className="text-xs mt-1">Shows user login locations with markers sized by session count</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalAnalytics;
