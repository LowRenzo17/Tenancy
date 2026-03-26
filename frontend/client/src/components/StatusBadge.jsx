/**
 * StatusBadge Component
 * Design System: The Architectural Ledger
 * - Color-coded status indicators with tonal backgrounds
 * - Pill-shaped (rounded-full) for visual distinction from cards
 * - Semantic color mapping for rental/maintenance statuses
 */
export default function StatusBadge({ status, className = '' }) {
  const statusStyles = {
    // Occupancy Status
    occupied: {
      backgroundColor: 'rgba(15, 76, 92, 0.1)',
      color: '#0f4c5c',
      fontWeight: '500',
    },
    vacant: {
      backgroundColor: 'rgba(199, 221, 233, 0.2)',
      color: '#40484b',
      fontWeight: '500',
    },
    
    // Rent Status
    paid: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      fontWeight: '500',
    },
    pending: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      fontWeight: '500',
    },
    overdue: {
      backgroundColor: '#ffdad6',
      color: '#ba1a1a',
      fontWeight: '500',
    },
    
    // Maintenance Status
    'In Progress': {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      fontWeight: '500',
    },
    'Pending': {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      fontWeight: '500',
    },
    'Completed': {
      backgroundColor: '#dcfce7',
      color: '#166534',
      fontWeight: '500',
    },
  };

  const style = statusStyles[status] || {
    backgroundColor: 'rgba(199, 221, 233, 0.2)',
    color: '#40484b',
    fontWeight: '500',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs ${className}`}
      style={style}
    >
      {status}
    </span>
  );
}
