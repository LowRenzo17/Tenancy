import { useState, useEffect } from 'react';
import {
  Menu, X, LayoutDashboard, Building2, Users, Wrench,
  Calendar, FileText, BarChart3, Bell, CreditCard,
  MessageSquare, Banknote, LogOut, Shield, MessageCircle, Clock,
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import apiClient from '../lib/api';

/**
 * Badge — small red pill shown on a nav item when count > 0
 */
function Badge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="
      ml-auto min-w-[20px] h-5 px-1.5
      flex items-center justify-center
      bg-red-500 text-white
      text-[10px] font-bold rounded-full
      leading-none shrink-0
      animate-pulse
    ">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Sidebar({ currentPage, onPageChange, currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  // ── Unread messages from ChatContext ─────────────────────────────────
  const { unreadCount } = useChat();

  // ── Pending counts fetched per role ──────────────────────────────────
  const [pendingMaintenance, setPendingMaintenance] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.accountType === 'owner') {
      // Owners: count pending/in-progress maintenance requests
      apiClient
        .get('/maintenance')
        .then((res) => {
          const arr = Array.isArray(res.maintenance) ? res.maintenance : [];
          const pending = arr.filter(
            (m) => m.status === 'pending' || m.status === 'in-progress'
          ).length;
          setPendingMaintenance(pending);
        })
        .catch(() => {});

      // Owners: count overdue payments
      apiClient
        .get('/payments')
        .then((res) => {
          const arr = Array.isArray(res.payments) ? res.payments : [];
          const overdue = arr.filter((p) => p.status === 'overdue').length;
          setPendingPayments(overdue);
        })
        .catch(() => {});
    }

    if (currentUser.accountType === 'tenant') {
      // Tenants: count their own pending/overdue payments
      apiClient
        .get('/payments')
        .then((res) => {
          const arr = Array.isArray(res.payments) ? res.payments : [];
          const due = arr.filter(
            (p) => p.status === 'overdue' || p.status === 'pending'
          ).length;
          setPendingPayments(due);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  // ── Nav items with optional badge counts ─────────────────────────────
  const ownerNavItems = [
    { id: 'dashboard',           label: 'Dashboard',         icon: LayoutDashboard },
    { id: 'properties',          label: 'Properties',        icon: Building2 },
    { id: 'tenants',             label: 'Tenants',           icon: Users },
    { id: 'maintenance',         label: 'Maintenance',       icon: Wrench,       badge: pendingMaintenance },
    { id: 'calendar',            label: 'Rent Calendar',     icon: Calendar },
    { id: 'analytics',           label: 'Analytics',         icon: BarChart3 },
    { id: 'reminders',           label: 'Reminders',         icon: Bell },
    { id: 'paymentHistory',      label: 'Payment History',   icon: CreditCard,   badge: pendingPayments },
    { id: 'maintenanceExpenses', label: 'Maintenance Costs', icon: Banknote },
    { id: 'reports',             label: 'Reports',           icon: FileText },
    { id: 'chat',                label: 'Messages',          icon: MessageSquare, badge: unreadCount },
    { id: 'loginHistory',        label: 'Login History',     icon: Clock },
    { id: 'trustedDevices',      label: 'Trusted Devices',   icon: Shield },
  ];

  const tenantNavItems = [
    { id: 'tenantDashboard',    label: 'My Dashboard',          icon: LayoutDashboard },
    { id: 'myLease',            label: 'My Lease',              icon: FileText },
    { id: 'myPayments',         label: 'My Payments',           icon: CreditCard,    badge: pendingPayments },
    { id: 'submitMaintenance',  label: 'Request Maintenance',   icon: Wrench },
    { id: 'chat',               label: 'Messages',              icon: MessageCircle, badge: unreadCount },
    { id: 'loginHistory',       label: 'Login History',         icon: Clock },
    { id: 'trustedDevices',     label: 'Trusted Devices',       icon: Shield },
  ];

  const navItems = currentUser?.accountType === 'tenant' ? tenantNavItems : ownerNavItems;

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground leading-none">
              EstateLedger
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">
              Premium Management
            </p>
          </div>
        </div>
        {/* Close on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1 rounded-md hover:bg-secondary text-muted-foreground"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                transition-colors duration-200 font-medium text-sm text-left
                ${isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm ring-1 ring-border shadow-black/5'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }
              `}
            >
              {/* Icon */}
              <Icon size={17} className={isActive ? 'text-primary' : 'text-muted-foreground'} />

              {/* Label */}
              <span className="truncate flex-1">{item.label}</span>

              {/* Notification badge */}
              <Badge count={item.badge} />
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      {currentUser && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="mb-3">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {currentUser.fullName || currentUser.name || currentUser.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentUser.accountType === 'owner' ? 'Estate Director' : 'Resident'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Open navigation"
      >
        <Menu size={22} />
        {/* Show a red dot on the hamburger when there are unseen notifications */}
        {(unreadCount > 0 || pendingMaintenance > 0 || pendingPayments > 0) && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky md:top-0
          left-0 top-0 z-50
          w-64 h-screen shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col bg-sidebar border-r border-sidebar-border
          overflow-hidden
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
