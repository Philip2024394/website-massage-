/// <reference types="vite/client" />

// Fix for React 19 + Lucide React compatibility
// Lucide icons use ForwardRefExoticComponent which returns ReactNode | Promise<ReactNode>
// This causes "bigint not assignable to ReactNode" errors in React 19
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export type LucideIcon = FC<SVGProps<SVGSVGElement>>;
  
  export const CheckCircle: LucideIcon;
  export const X: LucideIcon;
  export const Star: LucideIcon;
  export const Upload: LucideIcon;
  export const Home: LucideIcon;
  export const Bell: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Download: LucideIcon;
  
  // Add other Lucide icons as needed
}
