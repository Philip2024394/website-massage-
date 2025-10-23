// Event handlers for the main App component
import type { User, Place, Therapist, Agent, AdminMessage } from '../types';
import { dataService } from '../services/dataService';
import { saveGoogleMapsApiKey, saveAppContactNumber } from '../utils/appConfig';

export const createAuthHandlers = (
  setUser: (user: User | null) => void,
  setIsAdminLoggedIn: (value: boolean) => void,
  setIsHotelLoggedIn: (value: boolean) => void,
  setIsVillaLoggedIn: (value: boolean) => void,
  setLoggedInAgent: (agent: Agent | null) => void
) => ({
  handleLogin: (user: User) => {
    setUser(user);
  },

  handleLogout: () => {
    setUser(null);
  },

  handleRegister: (user: User) => {
    setUser(user);
  },

  handleAdminLogin: () => {
    setIsAdminLoggedIn(true);
  },

  handleAdminLogout: () => {
    setIsAdminLoggedIn(false);
    setLoggedInAgent(null);
  },

  handleHotelLogin: () => {
    setIsHotelLoggedIn(true);
  },

  handleHotelLogout: () => {
    setIsHotelLoggedIn(false);
  },

  handleVillaLogin: () => {
    setIsVillaLoggedIn(true);
  },

  handleVillaLogout: () => {
    setIsVillaLoggedIn(false);
  },

  handleAgentLogin: (agent: Agent) => {
    setLoggedInAgent(agent);
  }
});

export const createDataHandlers = (
  setPlaces: (updateFn: (prev: Place[]) => Place[]) => void,
  setTherapists: (updateFn: (prev: Therapist[]) => Therapist[]) => void,
  setAllAdminPlaces: (updateFn: (prev: Place[]) => Place[]) => void,
  setAllAdminTherapists: (updateFn: (prev: Therapist[]) => Therapist[]) => void,
  setAllAdminAgents: (updateFn: (prev: Agent[]) => Agent[]) => void,
  setAdminMessages: (updateFn: (prev: AdminMessage[]) => AdminMessage[]) => void
) => ({
  handleSavePlace: async (place: Place) => {
    try {
      let savedPlace: Place;
      if (place.id) {
        savedPlace = await dataService.updatePlace(place.id.toString(), place);
      } else {
        savedPlace = await dataService.createPlace(place);
      }
      
      setPlaces(prev => {
        const index = prev.findIndex(p => p.id === savedPlace.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedPlace;
          return updated;
        }
        return [...prev, savedPlace];
      });
      setAllAdminPlaces(prev => {
        const index = prev.findIndex(p => p.id === savedPlace.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedPlace;
          return updated;
        }
        return [...prev, savedPlace];
      });
    } catch (error) {
      console.error('Error saving place:', error);
      throw error;
    }
  },

  handleSaveTherapist: async (therapist: Therapist) => {
    try {
      let savedTherapist: Therapist;
      if (therapist.id) {
        savedTherapist = await dataService.updateTherapist(therapist.id.toString(), therapist);
      } else {
        savedTherapist = await dataService.createTherapist(therapist);
      }
      
      setTherapists(prev => {
        const index = prev.findIndex(t => t.id === savedTherapist.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedTherapist;
          return updated;
        }
        return [...prev, savedTherapist];
      });
      setAllAdminTherapists(prev => {
        const index = prev.findIndex(t => t.id === savedTherapist.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedTherapist;
          return updated;
        }
        return [...prev, savedTherapist];
      });
    } catch (error) {
      console.error('Error saving therapist:', error);
      throw error;
    }
  },

  handleToggleTherapist: async (therapistId: string, isActive: boolean) => {
    try {
      // Update using existing method
      await dataService.updateTherapist(therapistId, { isActive } as Partial<Therapist>);
      setTherapists(prev => 
        prev.map(t => t.id?.toString() === therapistId ? { ...t, isActive } : t)
      );
      setAllAdminTherapists(prev => 
        prev.map(t => t.id?.toString() === therapistId ? { ...t, isActive } : t)
      );
    } catch (error) {
      console.error('Error toggling therapist:', error);
      throw error;
    }
  },

  handleDeletePlace: async (placeId: string) => {
    try {
      // Since there's no delete method, we'll just remove from state
      // In a real app, you'd implement the delete method in dataService
      setPlaces(prev => prev.filter(p => p.id?.toString() !== placeId));
      setAllAdminPlaces(prev => prev.filter(p => p.id?.toString() !== placeId));
    } catch (error) {
      console.error('Error deleting place:', error);
      throw error;
    }
  },

  handleDeleteTherapist: async (therapistId: string) => {
    try {
      // Since there's no delete method, we'll just remove from state
      // In a real app, you'd implement the delete method in dataService
      setTherapists(prev => prev.filter(t => t.id?.toString() !== therapistId));
      setAllAdminTherapists(prev => prev.filter(t => t.id?.toString() !== therapistId));
    } catch (error) {
      console.error('Error deleting therapist:', error);
      throw error;
    }
  },

  handleSendAdminMessage: (message: AdminMessage) => {
    setAdminMessages(prev => [...prev, message]);
  }
});

export const createConfigHandlers = (
  setGoogleMapsApiKey: (key: string | null) => void,
  setIsMapsApiKeyMissing: (value: boolean) => void,
  setAppContactNumber: (number: string) => void
) => ({
  handleSaveGoogleMapsApiKey: (apiKey: string) => {
    saveGoogleMapsApiKey(apiKey);
    setGoogleMapsApiKey(apiKey);
    setIsMapsApiKeyMissing(false);
  },

  handleSaveAppContactNumber: (contactNumber: string) => {
    saveAppContactNumber(contactNumber);
    setAppContactNumber(contactNumber);
  }
});