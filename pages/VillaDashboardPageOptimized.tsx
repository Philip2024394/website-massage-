import React from 'react';
import { Therapist, Place } from '../types';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { DashboardHeader, DashboardFooter, SideDrawer } from '../components/shared/DashboardComponents';
import HotelBookingModal from '../components/hotel/PropertyBookingModal';
import { QRModal } from '../components/shared/QRModal';
import { PreviewModal } from '../components/shared/PreviewModal';
import { TabContent } from '../components/shared/TabContent';

interface VillaDashboardPageProps {
    onLogout: () => void;
    onNavigate?: (page: string) => void;
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
            />

            <main className="flex-1 w-full max-w-5xl mx-auto px-2 py-3 sm:p-4 md:p-6 lg:p-8 pb-24 overflow-y-auto">
                <TabContent
                    activeTab={dashboard.activeTab}
                    setActiveTab={dashboard.setActiveTab}
                    type="villa"
                    entityId={villaId}
                    analytics={dashboard.analytics}
                    isLoadingAnalytics={dashboard.isLoadingAnalytics}
                    providers={dashboard.providers}
                    displayProviders={dashboard.displayProviders}
                    placeholderImage={dashboard.placeholderImage}
                    mainImage={dashboard.mainImage}
                    setMainImage={dashboard.setMainImage}
                    profileImage={dashboard.profileImage}
                    setProfileImage={dashboard.setProfileImage}
                    entityName={dashboard.entityName}
                    setEntityName={dashboard.setEntityName}
                    entityAddress={dashboard.entityAddress}
                    setEntityAddress={dashboard.setEntityAddress}
                    entityPhone={dashboard.entityPhone}
                    setEntityPhone={dashboard.setEntityPhone}
                    isLoadingProfile={dashboard.isLoadingProfile}
                    isProcessing={dashboard.isProcessing}
                    qrLink={dashboard.qrLink}
                    onSaveAndPreview={dashboard.handleSaveAndPreview}
                    onQrOpen={dashboard.openQrFor}
                    onOrderNow={dashboard.handleOrderNow}
                />
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

            <PreviewModal
                isOpen={dashboard.previewOpen}
                onClose={() => {
                    dashboard.setPreviewOpen(false);
                    dashboard.setShowLandingPage(true);
                }}
                showLandingPage={dashboard.showLandingPage}
                setShowLandingPage={dashboard.setShowLandingPage}
                mainImage={dashboard.mainImage}
                profileImage={dashboard.profileImage}
                entityName={dashboard.entityName}
                entityAddress={dashboard.entityAddress}
                entityPhone={dashboard.entityPhone}
                displayProviders={dashboard.displayProviders}
                onOrderNow={dashboard.handleOrderNow}
                type="villa"
            />

            <HotelBookingModal
                isOpen={dashboard.bookingOpen}
                onClose={dashboard.closeBookingModal}
                selectedProvider={dashboard.selectedProvider}
                selectedDuration={dashboard.selectedDuration}
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