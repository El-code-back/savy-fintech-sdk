import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatKGS = (amount: number) => {
  return `${amount.toLocaleString('en-US').replace(/,/g, ' ')} сом`;
};
