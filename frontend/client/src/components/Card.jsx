/**
 * Card Component
 * Design System: The Architectural Ledger
 * - Tonal layering: surface-container-lowest on surface background
 * - No borders; depth through background color shifts
 * - Rounded corners for architectural sophistication
 */
export default function Card({ children, className = '', variant = 'elevated' }) {
  const variants = {
    elevated: {
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    subtle: {
      backgroundColor: '#e6f6ff',
    },
    accent: {
      backgroundColor: '#d5ecf8',
    },
  };

  return (
    <div
      className={`rounded-xl transition-all duration-200 ${className}`}
      style={variants[variant]}
    >
      {children}
    </div>
  );
}
