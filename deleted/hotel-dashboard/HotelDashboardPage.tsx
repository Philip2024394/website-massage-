/*
Archived: HotelDashboardPage.tsx
Moved from pages/HotelDashboardPage.tsx on 2025-11-17.
*/
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
    Building, Image as ImageIcon, LogOut, Menu, Phone, QrCode, Star, Tag, User, X, Bell,
    BarChart3, Percent, Hotel as HotelIcon, ClipboardList, MessageSquare, Users, 
    DollarSign, BellRing, Package, CreditCard, Coins
} from 'lucide-react';
import { Therapist, Place, HotelVillaServiceStatus, Hotel } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';
import { getAllTherapistImages } from '../utils/therapistImageUtils';
import { analyticsService } from '../services/analyticsService';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { commissionPaymentService } from '../services/commissionPaymentService';
import QRCodeGenerator from 'qrcode';
import { useTranslations } from '../lib/useTranslations';
import PushNotificationSettings from '../components/PushNotificationSettings';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HotelBookingModal from '../components/hotel/PropertyBookingModal';
import HotelAnalyticsSection from '../components/hotel/PropertyAnalyticsSection';
import HotelVillaBankDetailsPage from '../pages/HotelVillaBankDetailsPage';
import Footer from '../components/Footer';
import DashboardHeader from '../components/DashboardHeader';
import { safeDownload } from '../utils/domSafeHelpers';
import { workspace } from '../lib/workspace';
import { logAuditEvent } from '../lib/auditLogger';

type DurationKey = '60' | '90' | '120';
type ProviderType = 'therapist' | 'place';

interface ProviderCard {
    id: string | number;
    name: string;
    type: ProviderType;
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
    pricing: Record<DurationKey, number>;
    discount: number;
    whatsappNumber?: string;
    description: string;
    massageTypes: string[];
    status?: 'Available' | 'Busy' | 'Offline';
    languages?: string[];
}

interface HotelDashboardPageProps {
    onLogout: () => void;
    therapists?: Therapist[];
    places?: Place[];
    hotelId?: string;
    initialTab?: 'analytics' | 'discounts' | 'menu' | 'feedback' | 'commissions' | 'notifications';
    setPage?: (page: any) => void;
    onNavigate?: (page: string) => void;
}

const HotelDashboardPage: React.FC<HotelDashboardPageProps> = (props) => {
  return (
    <div style={{padding:16}}>
      <h3>Hotel Dashboard Removed</h3>
      <p>This page has been decommissioned and archived.</p>
    </div>
  );
};

export default HotelDashboardPage;
