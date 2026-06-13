/**
 * Card Component
 * Design System: Architectural Estate
 * - Crisp, clean, minimal look.
 * - Rely on borders and background colors rather than heavy shadows.
 */
export default function Card({ children, className = '', variant = 'elevated' }) {
  const variants = {
    elevated: "card-elevated", // bg-card border-border + crisp subtle shadow
    subtle: "bg-secondary border border-transparent rounded-xl",
    accent: "bg-primary text-primary-foreground rounded-xl shadow-lg",
  };

  const bgClass = variants[variant] || variants.elevated;

  return (
    <div className={`transition-all duration-200 ${bgClass} ${className}`}>
      {children}
    </div>
  );
}
