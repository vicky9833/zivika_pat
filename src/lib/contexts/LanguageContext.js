"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useUserStore } from "@/lib/stores/user-store";

const LanguageContext = createContext({ language: "en", setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const nativeLanguage = useUserStore((s) => s.user?.nativeLanguage);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (nativeLanguage && nativeLanguage !== language) {
      setLanguage(nativeLanguage);
    }
  }, [nativeLanguage]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
