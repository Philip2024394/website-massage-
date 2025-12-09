import { useState, useEffect } from 'react';
import AdminRouter from './AdminRouter.tsx';
import { useAdminAuth } from './hooks/useAdminAuth.ts';
import { therapistService, placeService, facialPlaceService } from '../../../lib/appwriteService';

/**
 * Standalone Admin App
 * 100% separated from main customer app
 * Uses same Appwrite backend for data
 */
const AdminApp = () => {
    console.log('🔐 AdminApp: Initializing standalone admin application...');

    // Admin-specific state
    const [isLoading, setIsLoading] = useState(true);
    const [therapists, setTherapists] = useState<any[]>([]);
    const [places, setPlaces] = useState<any[]>([]);
    const [facialPlaces, setFacialPlaces] = useState<any[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

    // Admin authentication
    const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAdminAuth();

    // Fetch admin data from Appwrite
    useEffect(() => {
        const fetchAdminData = async () => {
            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }

            try {
                console.log('📊 AdminApp: Fetching data from Appwrite...');
                setIsLoading(true);

                const [therapistsData, placesData, facialPlacesData] = await Promise.all([
                    therapistService.getAll(),
                    placeService.getAll(),
                    facialPlaceService.getAll()
                ]);

                console.log('✅ AdminApp: Data fetched successfully', {
                    therapists: therapistsData.length,
                    places: placesData.length,
                    facialPlaces: facialPlacesData.length
                });

                setTherapists(therapistsData);
                setPlaces(placesData);
                setFacialPlaces(facialPlacesData);

                // Filter pending approvals (status === 'pending')
                const pending = [
                    ...therapistsData.filter((t: any) => t.status === 'pending'),
                    ...placesData.filter((p: any) => p.status === 'pending'),
                    ...facialPlacesData.filter((f: any) => f.status === 'pending')
                ];
                setPendingApprovals(pending);

                console.log(`⏳ AdminApp: ${pending.length} pending approvals`);
            } catch (error) {
                console.error('❌ AdminApp: Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, [isAuthenticated]);

    // Refresh data handler
    const refreshData = async () => {
        console.log('🔄 AdminApp: Refreshing data...');
        try {
            const [therapistsData, placesData, facialPlacesData] = await Promise.all([
                therapistService.getAll(),
                placeService.getAll(),
                facialPlaceService.getAll()
            ]);

            setTherapists(therapistsData);
            setPlaces(placesData);
            setFacialPlaces(facialPlacesData);

            const pending = [
                ...therapistsData.filter((t: any) => t.status === 'pending'),
                ...placesData.filter((p: any) => p.status === 'pending'),
                ...facialPlacesData.filter((f: any) => f.status === 'pending')
            ];
            setPendingApprovals(pending);

            console.log('✅ AdminApp: Data refreshed successfully');
        } catch (error) {
            console.error('❌ AdminApp: Refresh failed:', error);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">Loading admin app...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminRouter
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                user={user}
                therapists={therapists}
                places={places}
                facialPlaces={facialPlaces}
                pendingApprovals={pendingApprovals}
                onLogin={login}
                onLogout={logout}
                onRefreshData={refreshData}
            />
        </div>
    );
};

export default AdminApp;
