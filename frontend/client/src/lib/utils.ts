import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount as Kenyan Shillings (KSh)
 * @param amount - The amount in KSh
 * @returns Formatted string like "KSh 50,000"
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined) return 'KSh 0';
  const formatted = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  // Replace KES with KSh
  return formatted.replace('KES', 'KSh');
}

/**
 * Get maintenance status message with stage indicator
 * @param status - The maintenance status (pending, in-progress, completed, cancelled)
 * @returns Object with message and stage description
 */
export function getMaintenanceStatusMessage(status: string | undefined) {
  const statusMap: Record<string, { message: string; stage: string; color: string }> = {
    'pending': {
      message: 'Request submitted and awaiting review',
      stage: 'Stage 1: Pending Review',
      color: 'from-yellow-400 to-yellow-600'
    },
    'in-progress': {
      message: 'Maintenance work has started',
      stage: 'Stage 2: In Progress',
      color: 'from-blue-400 to-blue-600'
    },
    'completed': {
      message: 'Work has been completed and verified',
      stage: 'Stage 3: Completed',
      color: 'from-green-400 to-green-600'
    },
    'cancelled': {
      message: 'Request has been cancelled',
      stage: 'Cancelled',
      color: 'from-red-400 to-red-600'
    }
  };

  return statusMap[status?.toLowerCase() || ''] || {
    message: 'Status unknown',
    stage: 'Unknown',
    color: 'from-gray-400 to-gray-600'
  };
}

/**
 * Get maintenance priority color
 */
export function getMaintenancePriorityColor(priority: string | undefined) {
  const priorityMap: Record<string, string> = {
    'low': 'text-blue-600 bg-blue-50',
    'medium': 'text-yellow-600 bg-yellow-50',
    'high': 'text-orange-600 bg-orange-50',
    'urgent': 'text-red-600 bg-red-50',
    'emergency': 'text-red-700 bg-red-100'
  };

  return priorityMap[priority?.toLowerCase() || 'medium'] || 'text-gray-600 bg-gray-50';
}
