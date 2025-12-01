import { useState, useEffect } from "react";
import i18next from "@/i18n/i18n";

export function useI18n() {
  const [lang, setLang] = useState(i18next.language || "es");

  const t = (key, options) => i18next.t(key, options);

  const changeLanguage = async (lng) => {
    await i18next.changeLanguage(lng);
    localStorage.setItem("preferredLanguage", lng);
    setLang(lng);
    document.documentElement.lang = lng;
  };

  useEffect(() => {
    const updateLang = () => setLang(i18next.language);

    i18next.on("languageChanged", updateLang);
    return () => i18next.off("languageChanged", updateLang);
  }, []);

  return { t, lang, changeLanguage };
}
