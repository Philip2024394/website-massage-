/**
 * useServices Hook
 * Handles facial types, languages, additional services, and therapist preferences
 * Max size: 8KB (Facebook/Amazon standard)
 */

import { useCallback } from 'react';

interface UseServicesProps {
  facialTypes: string[];
  setFacialTypes: React.Dispatch<React.SetStateAction<string[]>>;
  languages: string[];
  setLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  additionalServices: string[];
  setAdditionalServices: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useServices = ({
  facialTypes: _facialTypes,
  setFacialTypes,
  languages: _languages,
  setLanguages,
  additionalServices: _additionalServices,
  setAdditionalServices,
}: UseServicesProps) => {
  
  const handleFacialTypeChange = useCallback((type: string) => {
    setFacialTypes((prev: string[]) => {
      const currentTypes = prev || [];
      return currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
    });
  }, [setFacialTypes]);

  const handleLanguageChange = useCallback((langCode: string) => {
    setLanguages(prev => {
      const currentLanguages = prev || [];
      return currentLanguages.includes(langCode)
        ? currentLanguages.filter(l => l !== langCode)
        : [...currentLanguages, langCode];
    });
  }, [setLanguages]);

  const handleAdditionalServiceChange = useCallback((service: string) => {
    setAdditionalServices(prev => {
      const currentServices = prev || [];
      return currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service];
    });
  }, [setAdditionalServices]);

  return {
    handleFacialTypeChange,
    handleLanguageChange,
    handleAdditionalServiceChange,
  };
};
