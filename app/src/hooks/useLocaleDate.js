import { es, enUS } from "date-fns/locale";
import { useI18n } from "@/hooks/useI18n";

export function useLocaleDate() {
    const { lang } = useI18n();

    return lang === "es" ? es : enUS;
}
