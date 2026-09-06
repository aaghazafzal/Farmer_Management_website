"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  LanguageCode,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  translations,
} from "./translations";

interface LanguageContextType {
  language: LanguageCode;
  currentLanguage: LanguageInfo;
  setLanguage: (lang: string) => void;
  t: (keyOrText: string, fallback?: string) => string;
  supportedLanguages: LanguageInfo[];
  isRTL: boolean;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to normalize any input (code, English name, or native name) to LanguageCode
export function normalizeLanguageCode(input: string): LanguageCode {
  if (!input) return "en";
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // Match by code
  const byCode = SUPPORTED_LANGUAGES.find(
    (l) => l.code === lower || l.code === trimmed
  );
  if (byCode) return byCode.code;

  // Match by English name
  const byName = SUPPORTED_LANGUAGES.find(
    (l) => l.name.toLowerCase() === lower
  );
  if (byName) return byName.code;

  // Match by Native name
  const byNative = SUPPORTED_LANGUAGES.find((l) => l.native === trimmed);
  if (byNative) return byNative.code;

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Load saved preference on initial client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kisansetu_lang");
      if (saved) {
        const code = normalizeLanguageCode(saved);
        setLanguageState(code);
      }
    } catch {
      // localStorage may be restricted in some environments
    }
  }, []);

  // Update HTML tag attributes whenever language changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    }
  }, [language]);

  const setLanguage = (langInput: string) => {
    const code = normalizeLanguageCode(langInput);
    setLanguageState(code);
    try {
      localStorage.setItem("kisansetu_lang", code);
    } catch {
      // ignore
    }
  };

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const isRTL = currentLanguage.dir === "rtl";

  // Universal translation function
  const t = (keyOrText: string, fallback?: string): string => {
    if (!keyOrText) return fallback || "";

    const activeDict = translations[language] || {};
    const enDict = translations.en || {};

    // 1. Direct key match in active language
    if (activeDict[keyOrText]) {
      return activeDict[keyOrText];
    }

    const cleanKey = keyOrText.trim();
    if (activeDict[cleanKey]) {
      return activeDict[cleanKey];
    }

    // 2. Reverse lookup by keyOrText or fallback in English dict
    const targets = [cleanKey, fallback ? fallback.trim() : null].filter(Boolean) as string[];
    for (const target of targets) {
      const lower = target.toLowerCase();
      for (const [k, englishVal] of Object.entries(enDict)) {
        if (englishVal.toLowerCase().trim() === lower && activeDict[k]) {
          return activeDict[k];
        }
      }
    }

    // 3. Fallback to English dictionary for the key
    if (enDict[keyOrText]) {
      return enDict[keyOrText];
    }

    // 4. Fallback to supplied fallback or original text
    return fallback !== undefined ? fallback : keyOrText;
  };

  const LOCALE_MAP: Record<LanguageCode, string> = {
    en: "en-IN",
    hi: "hi-IN",
    mr: "mr-IN",
    bn: "bn-IN",
    pa: "pa-IN",
    ur: "ur-PK",
  };

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return String(date);
      const locale = LOCALE_MAP[language] || "en-IN";
      return new Intl.DateTimeFormat(locale, options || { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(d);
    } catch {
      return String(date);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguage,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isRTL,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if called outside provider
    const fallbackInfo = SUPPORTED_LANGUAGES[0];
    return {
      language: "en",
      currentLanguage: fallbackInfo,
      setLanguage: () => {},
      t: (keyOrText: string, fallback?: string) => fallback ?? keyOrText,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isRTL: false,
      formatDate: (date: Date | string) => String(date),
    };
  }
  return context;
}
