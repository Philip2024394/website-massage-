// Icon Import Validator - Prevents crashes from invalid lucide-react imports
import * as LucideIcons from 'lucide-react';

/**
 * Validates that all imported lucide-react icons exist
 * Prevents runtime crashes from invalid icon imports
 */
export const validateLucideImports = (iconNames: string[]): { valid: string[], invalid: string[] } => {
  const availableIcons = Object.keys(LucideIcons);
  const valid: string[] = [];
  const invalid: string[] = [];
  
  iconNames.forEach(iconName => {
    if (availableIcons.includes(iconName)) {
      valid.push(iconName);
    } else {
      invalid.push(iconName);
    }
  });
  
  return { valid, invalid };
};

/**
 * Safe icon getter - returns a fallback icon if requested icon doesn't exist
 */
export const getSafeIcon = (iconName: string, fallbackIcon = 'AlertCircle') => {
  const icon = (LucideIcons as any)[iconName];
  if (icon) {
    return icon;
  }
  
  console.warn(`Icon "${iconName}" not found in lucide-react. Using fallback: ${fallbackIcon}`);
  return (LucideIcons as any)[fallbackIcon] || LucideIcons.AlertCircle;
};

// Safe icon accessor to avoid TypeScript errors
const getIcon = (name: string, fallback: string = 'AlertCircle') => {
  return (LucideIcons as Record<string, any>)[name] || (LucideIcons as Record<string, any>)[fallback] || LucideIcons.AlertCircle;
};

/**
 * Commonly used icons mapping - prevents typos and version issues
 * Uses dynamic access to handle different lucide-react versions
 */
export const SafeIcons = {
  // Check icons
  Check: LucideIcons.Check,
  CheckCircle: LucideIcons.CheckCircle,
  CheckCircle2: getIcon('CheckCircle2', 'CheckCircle'),
  CheckSquare: getIcon('CheckSquare', 'Check'),
  
  // Basic icons
  AlertCircle: LucideIcons.AlertCircle,
  Shield: LucideIcons.Shield,
  Star: LucideIcons.Star,
  Building: LucideIcons.Building,
  Building2: getIcon('Building2', 'Building'),
  Users: LucideIcons.Users,
  Clock: LucideIcons.Clock,
  FileText: LucideIcons.FileText,
  Award: LucideIcons.Award,
  
  // Navigation icons  
  ArrowLeft: LucideIcons.ArrowLeft,
  ChevronLeft: getIcon('ChevronLeft', 'ArrowLeft'),
  ChevronRight: getIcon('ChevronRight', 'ArrowLeft'),
  ChevronUp: getIcon('ChevronUp', 'ArrowLeft'),
  ChevronDown: getIcon('ChevronDown', 'ArrowLeft'),
  
  // Common UI icons
  X: LucideIcons.X,
  Menu: LucideIcons.Menu,
  Search: LucideIcons.Search,
  Bell: LucideIcons.Bell,
  Settings: LucideIcons.Settings,
  User: LucideIcons.User,
  Home: LucideIcons.Home,
  
  // Communication icons
  Phone: LucideIcons.Phone,
  MessageCircle: LucideIcons.MessageCircle,
  Mail: LucideIcons.Mail,
  
  // Location & Map icons
  MapPin: LucideIcons.MapPin,
  
  // Business icons
  DollarSign: LucideIcons.DollarSign,
  CreditCard: LucideIcons.CreditCard,
  Calendar: LucideIcons.Calendar,
  
  // Media icons
  Upload: LucideIcons.Upload,
  Download: LucideIcons.Download,
  Image: getIcon('Image', 'FileText'),
  
  // Status icons
  Crown: getIcon('Crown', 'Star'),
  Lock: LucideIcons.Lock,
  
  // Auth icons
  Eye: LucideIcons.Eye,
  EyeOff: LucideIcons.EyeOff,
  LogIn: getIcon('LogIn', 'User'),
  UserPlus: getIcon('UserPlus', 'User'),
  
  // Action icons
  Edit: getIcon('Edit', 'FileText'),
  Edit3: getIcon('Edit3', 'FileText'),
  Save: getIcon('Save', 'FileText'),
  Trash2: getIcon('Trash2', 'X'),
  Plus: LucideIcons.Plus,
  
  // Charts & Analytics
  BarChart: getIcon('BarChart', 'TrendingUp'),
  BarChart3: getIcon('BarChart3', 'TrendingUp'),
  TrendingUp: LucideIcons.TrendingUp,
  
  // Device & Tech
  Smartphone: getIcon('Smartphone', 'Phone'),
  
  // Social (using generic icons as fallbacks)
  Instagram: getIcon('Instagram', 'User'),
  Facebook: getIcon('Facebook', 'User'),
  
  // Misc
  Globe: LucideIcons.Globe,
  Gift: getIcon('Gift', 'Star'),
  Target: getIcon('Target', 'Star')
};

// Export validation function for pre-build checks
export const validateAllIconImports = () => {
  const errors: string[] = [];
  
  // Check SafeIcons mapping
  Object.entries(SafeIcons).forEach(([name, icon]) => {
    if (!icon) {
      errors.push(`SafeIcons.${name} is undefined`);
    }
  });
  
  if (errors.length > 0) {
    console.error('Icon validation errors:', errors);
    throw new Error(`Invalid icon imports detected: ${errors.join(', ')}`);
  }
  
  return true;
};