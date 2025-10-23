import { storageUtils } from '../utils';

export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  type: 'login' | 'landing';
  loginArea?: string;
  thumbnail?: string;
  isActive: boolean;
  uploadedAt: Date;
}

class BackgroundService {
  private storageKey = 'admin_backgrounds';

  getBackgrounds(): BackgroundImage[] {
    return storageUtils.get(this.storageKey) || [];
  }

  getActiveBackground(area: string): string | null {
    const backgrounds = this.getBackgrounds();
    const activeBackground = backgrounds.find(bg => 
      bg.isActive && (
        (area === 'landing' && bg.type === 'landing') ||
        (area !== 'landing' && bg.loginArea === area)
      )
    );
    return activeBackground?.url || null;
  }

  getDefaultGradient(area: string): string {
    const gradients = {
      admin: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500',
      agent: 'bg-gradient-to-br from-green-600 via-blue-600 to-purple-500',
      client: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-500',
      therapist: 'bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-500',
      place: 'bg-gradient-to-br from-yellow-600 via-orange-600 to-red-500',
      hotel: 'bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500',
      villa: 'bg-gradient-to-br from-red-600 via-pink-600 to-purple-500',
      landing: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500'
    };
    return gradients[area as keyof typeof gradients] || gradients.landing;
  }

  getBackgroundStyle(area: string): React.CSSProperties {
    const backgroundUrl = this.getActiveBackground(area);
    
    if (backgroundUrl) {
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return {};
  }

  saveBackground(background: BackgroundImage): void {
    const backgrounds = this.getBackgrounds();
    
    // Deactivate previous background for the same area
    const updatedBackgrounds = backgrounds.map(bg => 
      bg.loginArea === background.loginArea || 
      (bg.type === 'landing' && background.type === 'landing')
        ? { ...bg, isActive: false }
        : bg
    );

    // Add new background
    const finalBackgrounds = [...updatedBackgrounds, background];
    storageUtils.set(this.storageKey, finalBackgrounds);
  }

  setActiveBackground(backgroundId: string): void {
    const backgrounds = this.getBackgrounds();
    const targetBackground = backgrounds.find(bg => bg.id === backgroundId);
    
    if (!targetBackground) return;

    const updatedBackgrounds = backgrounds.map(bg => {
      // Deactivate others in the same area
      if (
        (bg.loginArea === targetBackground.loginArea) ||
        (bg.type === 'landing' && targetBackground.type === 'landing')
      ) {
        return { ...bg, isActive: bg.id === backgroundId };
      }
      return bg;
    });

    storageUtils.set(this.storageKey, updatedBackgrounds);
  }

  deleteBackground(backgroundId: string): void {
    const backgrounds = this.getBackgrounds();
    const filteredBackgrounds = backgrounds.filter(bg => bg.id !== backgroundId);
    storageUtils.set(this.storageKey, filteredBackgrounds);
  }
}

export const backgroundService = new BackgroundService();