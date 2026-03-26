import { useState } from 'react';
import { Menu, X, LayoutDashboard, Building2, Users, Wrench, Calendar, FileText } from 'lucide-react';

/**
 * Sidebar Navigation Component
 * Design System: The Architectural Ledger
 * - Surface hierarchy with tonal layering (no borders)
 * - Manrope typography for navigation hierarchy
 * - Responsive: Collapses on mobile
 */
export default function Sidebar({ currentPage, onPageChange }) {
  // Design System: The Architectural Ledger
  // Colors defined as inline styles to avoid Tailwind class conflicts
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'calendar', label: 'Rent Calendar', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white hover:shadow-md transition-shadow"
        style={{ backgroundColor: '#003441' }}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative md:translate-x-0 z-40
          w-64 h-screen
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
        style={{
          backgroundColor: '#f3faff',
          borderRight: '1px solid #d5ecf8',
        }}
      >
        {/* Logo/Brand Section */}
        <div className="p-6" style={{ borderBottom: '1px solid #d5ecf8' }}>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#003441' }}>
            Tenancy Slate
          </h1>
          <p className="text-xs mt-1" style={{ color: '#40484b' }}>Property Management</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm"
                style={{
                  backgroundColor: isActive ? '#e6f6ff' : 'transparent',
                  color: isActive ? '#0f4c5c' : '#071e27',
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 text-xs" style={{ borderTop: '1px solid #d5ecf8', color: '#40484b' }}>
          <p>© 2026 Tenancy Slate</p>
          <p className="mt-1">Premium Property Management</p>
        </div>
      </aside>
    </>
  );
}
