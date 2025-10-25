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

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function getEventStatus(eventDate: string | null) {
  if (!eventDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = parseLocalDate(eventDate);
  event.setHours(0, 0, 0, 0);
  
  const diffTime = event.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: 'past', text: 'Event passed', color: 'text-muted-foreground' };
  } else if (diffDays === 0) {
    return { status: 'today', text: 'Today!', color: 'text-accent font-semibold' };
  } else if (diffDays <= 7) {
    return { status: 'soon', text: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, color: 'text-orange-500 font-medium' };
  } else if (diffDays <= 30) {
    return { status: 'upcoming', text: `${diffDays} days left`, color: 'text-blue-500' };
  } else {
    return { status: 'future', text: event.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: 'text-muted-foreground' };
  }
}