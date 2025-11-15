import { useLanguageContext } from '../context/LanguageContext';

export function useLanguage() {
  const { language, setLanguage } = useLanguageContext();
  return { language, setLanguage };
}
