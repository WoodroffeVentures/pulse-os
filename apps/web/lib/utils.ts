import { clsx, type ClassValue } from "clsx"; import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const zar = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 });
export function confidenceLabel(score:number){ if(score>=0.85) return "High confidence"; if(score>=0.65) return "Medium confidence"; return "Evidence limited"; }
