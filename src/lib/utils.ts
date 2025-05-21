import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"
import { PRIORITY_OPTIONS } from "@/constants"
import { Database } from "@/database.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getPriorityLabel = (priority: Database["public"]["Enums"]["priority"]) => {
  return PRIORITY_OPTIONS.find(option => option.value === priority)?.label || priority
}