/**
 * StatusBadge Component
 * Design System: The Architectural Ledger
 * - Color-coded status indicators with tonal backgrounds
 * - Pill-shaped (rounded-full) for visual distinction from cards
 * - Semantic color mapping for rental/maintenance statuses
 */
export default function StatusBadge({ status, className = '' }) {
  const getStatusClasses = (status) => {
    switch (status) {
      // Occupancy Status
      case 'occupied':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'vacant':
        return 'bg-secondary text-muted-foreground border-border';
      
      // Rent / Maintenance Status
      case 'paid':
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'overdue':
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      
      default:
        return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const formatStatus = (s) => {
    if (!s) return '';
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getStatusClasses(status)} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}
