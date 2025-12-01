import { useI18n } from "@/hooks/useI18n";

export function LanguageSelector() {
  const { lang, changeLanguage } = useI18n();

  return (
    <select
      value={lang}
      onChange={(e) => changeLanguage(e.target.value)}
      className="p-2 rounded bg-white text-blue-900 font-semibold cursor-pointer border border-gray-300 shadow-sm hover:shadow transition"
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
}
