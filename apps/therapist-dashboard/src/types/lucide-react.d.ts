/**
 * React 19 Lucide Icon Compatibility Shim
 * 
 * This file resolves type incompatibilities between lucide-react and React 19.
 * The issue: lucide icons use ForwardRefExoticComponent which isn't directly
 * assignable to JSXElement Component type in strict React 19 typing.
 * 
 * This augmentation makes all lucide icons compatible by treating them as valid JSX components.
 */

/// <reference types="react" />

// Augment the global JSX namespace to accept ForwardRefExoticComponent
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      // Allow any forward ref component
      ref?: any;
    }
  }
}

// Re-export lucide-react with compatible types
declare module 'lucide-react' {
  import type { FC, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    strokeWidth?: string | number;
  }

  // Treat all icons as functional components for JSX compatibility
  export type LucideIcon = FC<LucideProps>;
  
  // Common icons used in the app
  export const Users: LucideIcon;
  export const Star: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Clock: LucideIcon;
  export const Eye: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Camera: LucideIcon;
  export const Edit3: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Gift: LucideIcon;
  export const Zap: LucideIcon;
  export const Target: LucideIcon;
  export const Image: LucideIcon;
  export const FileText: LucideIcon;
  export const Phone: LucideIcon;
  export const MapPin: LucideIcon;
  export const Calendar: LucideIcon;
  export const Heart: LucideIcon;
  export const Award: LucideIcon;
  export const Shield: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Timer: LucideIcon;
  export const Activity: LucideIcon;
  export const BarChart3: LucideIcon;
  export const PieChart: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const Crown: LucideIcon;
  export const User: LucideIcon;
  export const CreditCard: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const Wallet: LucideIcon;
  export const Bell: LucideIcon;
  export const LogOut: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
}

export {};




