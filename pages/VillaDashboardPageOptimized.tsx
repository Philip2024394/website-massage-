import React from 'react';
import type { Page } from '../types/pageTypes';
import { Therapist, Place } from '../types';
// Define DurationKey locally since it's not exported from a common module
type DurationKey = '60' | '90' | '120';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { DashboardHeader, DashboardFooter, SideDrawer } from '../components/shared/DashboardComponents';
import HotelBookingModal from '../components/hotel/PropertyBookingModal';
import { QRModal } from '../components/shared/QRModal';
// import { PreviewModal } from '../components/shared/PreviewModal'; // Component not found - removed
// import { TabContent } from '../components/shared/TabContent'; // Component not found - removed

interface VillaDashboardPageProps {
    onLogout: () => void;
    onNavigate?: (page: Page) => void;
    therapists?: Therapist[];
    places?: Place[];
    villaId?: string;
    initialTab?: string;
}

const VillaDashboardPage: React.FC<VillaDashboardPageProps> = ({ 
    onLogout, 
    onNavigate: _onNavigate, 
    therapists = [], 
    places = [], 
    villaId = '1', 
    initialTab = 'analytics' 
}) => {
    const dashboard = useDashboardLogic('villa', villaId, therapists, places, initialTab);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] sm:max-w-none mx-auto">
            <DashboardHeader type="villa" onMenuClick={() => dashboard.setIsSideDrawerOpen(true)} />
            
            <SideDrawer
                isOpen={dashboard.isSideDrawerOpen}
                onClose={() => dashboard.setIsSideDrawerOpen(false)}
                activeTab={dashboard.activeTab}
                setActiveTab={dashboard.setActiveTab}
                onLogout={onLogout}
                providersCount={dashboard.providers.length}
                type="villa"
                onNavigate={_onNavigate}
            />

            <main className="flex-1 w-full max-w-5xl mx-auto px-2 py-3 sm:p-4 md:p-6 lg:p-8 pb-24 overflow-y-auto">
                {/* TabContent component not found - using simple div structure */}
                <div className="tab-content">
                    <p className="text-center p-4 text-gray-600">Villa Dashboard Content</p>
                    <p className="text-sm text-gray-500 text-center">
                        TabContent component is missing. Please restore or implement tab functionality.
                    </p>
                    {/* TODO: Implement proper tab content or restore TabContent component */}
                </div>
            </main>

            <DashboardFooter type="villa" />

            <QRModal
                isOpen={dashboard.qrOpen}
                onClose={() => dashboard.setQrOpen(false)}
                qrCodeDataUrl={dashboard.qrCodeDataUrl}
                qrLink={dashboard.qrLink}
                entityName={dashboard.entityName}
                type="villa"
            />

            {/* PreviewModal component not found - commented out */}
            {dashboard.previewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Preview Not Available</h3>
                        <p className="text-gray-600 mb-4">PreviewModal component is missing.</p>
                        <button 
                            onClick={() => {
                                dashboard.setPreviewOpen(false);
                                dashboard.setShowLandingPage(true);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {/* TODO: Restore PreviewModal component */}

            <HotelBookingModal
                isOpen={dashboard.bookingOpen}
                onClose={dashboard.closeBookingModal}
                selectedProvider={dashboard.selectedProvider}
                selectedDuration={dashboard.selectedDuration as DurationKey}
                onDurationChange={dashboard.setSelectedDuration}
                guestName={dashboard.guestName}
                onGuestNameChange={dashboard.setGuestName}
                roomNumber={dashboard.roomNumber}
                onRoomNumberChange={dashboard.setRoomNumber}
                onProceedBooking={dashboard.handleProceedBooking}
                isProcessing={dashboard.isProcessing}
                bookingConfirmed={dashboard.bookingConfirmed}
                bookingId={dashboard.bookingId}
                bookingTime={dashboard.bookingTime}
                onCloseBookingModal={dashboard.closeBookingModal}
            />
        </div>
    );
};

export default VillaDashboardPage;