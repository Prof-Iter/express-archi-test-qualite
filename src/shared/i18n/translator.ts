import { translations } from "./translations";

export function translate(key: string): string {
    return translations[key as keyof typeof translations] || key;
}
