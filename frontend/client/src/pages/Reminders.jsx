import { useState } from 'react';
import { Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * Reminders Page
 * Design System: The Architectural Ledger
 * - Automated rent payment reminders and notifications
 * - Alert system for overdue payments and upcoming due dates
 */
export default function Reminders({ tenants, properties }) {
  const [reminders, setReminders] = useState([]);
  const [dismissedReminders, setDismissedReminders] = useState(new Set());

  // Generate reminders based on tenant data
  const generateReminders = () => {
    const newReminders = [];

    tenants.forEach(tenant => {
      const property = properties.find(p => p.id === parseInt(tenant.propertyId));
      const propertyName = property?.name || 'Unknown Property';

      // Overdue reminders (highest priority)
      if (tenant.rentStatus === 'overdue') {
        newReminders.push({
          id: `overdue-${tenant.id}`,
          type: 'overdue',
          priority: 'high',
          title: 'Overdue Rent Payment',
          description: `${tenant.name} at ${propertyName} has overdue rent of Ksh ${tenant.rentAmount.toLocaleString()}`,
          tenant: tenant.name,
          amount: tenant.rentAmount,
          property: propertyName,
          action: 'Follow up immediately',
        });
      }

      // Pending reminders (medium priority)
      if (tenant.rentStatus === 'pending') {
        newReminders.push({
          id: `pending-${tenant.id}`,
          type: 'pending',
          priority: 'medium',
          title: 'Pending Rent Payment',
          description: `${tenant.name} at ${propertyName} has pending rent of Ksh ${tenant.rentAmount.toLocaleString()}`,
          tenant: tenant.name,
          amount: tenant.rentAmount,
          property: propertyName,
          action: 'Send payment reminder',
        });
      }

      // Paid reminders (low priority - informational)
      if (tenant.rentStatus === 'paid') {
        newReminders.push({
          id: `paid-${tenant.id}`,
          type: 'paid',
          priority: 'low',
          title: 'Rent Payment Received',
          description: `${tenant.name} at ${propertyName} has paid rent of Ksh ${tenant.rentAmount.toLocaleString()}`,
          tenant: tenant.name,
          amount: tenant.rentAmount,
          property: propertyName,
          action: 'Confirmed',
        });
      }
    });

    return newReminders;
  };

  const allReminders = generateReminders().filter(r => !dismissedReminders.has(r.id));

  const handleDismiss = (reminderId) => {
    setDismissedReminders(prev => new Set([...prev, reminderId]));
  };

  const handleDismissAll = () => {
    const allIds = new Set(generateReminders().map(r => r.id));
    setDismissedReminders(allIds);
  };

  // Count reminders by type
  const overdueCount = allReminders.filter(r => r.type === 'overdue').length;
  const pendingCount = allReminders.filter(r => r.type === 'pending').length;
  const paidCount = allReminders.filter(r => r.type === 'paid').length;

  const getReminderIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle size={24} style={{ color: '#ba1a1a' }} />;
      case 'pending':
        return <Clock size={24} style={{ color: '#92400e' }} />;
      case 'paid':
        return <CheckCircle size={24} style={{ color: '#166534' }} />;
      default:
        return <Bell size={24} style={{ color: '#003441' }} />;
    }
  };

  const getReminderColor = (type) => {
    switch (type) {
      case 'overdue':
        return { bg: 'bg-[#ba1a1a]/10', border: 'border-[#ba1a1a]', text: 'text-[#ba1a1a]' };
      case 'pending':
        return { bg: 'bg-[#92400e]/10', border: 'border-[#92400e]', text: 'text-[#92400e]' };
      case 'paid':
        return { bg: 'bg-[#166534]/10', border: 'border-[#166534]', text: 'text-[#166534]' };
      default:
        return { bg: 'bg-[#e6f6ff]', border: 'border-[#003441]', text: 'text-[#003441]' };
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Rent Payment Reminders
          </h1>
          <p className="text-sm text-muted-foreground">Automated notifications for rent payments and tenant follow-ups.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-[#ba1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#ba1a1a]/10">
              <AlertCircle size={24} className="text-[#ba1a1a]" />
            </div>
            <p className="text-4xl font-black tracking-tight text-[#ba1a1a]">
              {overdueCount}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ba1a1a]/70">Overdue Payments</p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-[#92400e]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#92400e]/10">
              <Clock size={24} className="text-[#92400e]" />
            </div>
            <p className="text-4xl font-black tracking-tight text-[#92400e]">
              {pendingCount}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#92400e]/70">Pending Payments</p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-[#166534]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#166534]/10">
              <CheckCircle size={24} className="text-[#166534]" />
            </div>
            <p className="text-4xl font-black tracking-tight text-[#166534]">
              {paidCount}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#166534]/70">Payments Received</p>
          </div>
        </Card>
      </div>

      {/* Reminders List */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        {allReminders.length > 0 ? (
          <div>
            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/30">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Active Reminders <span className="text-sm font-medium text-muted-foreground ml-2">/ {allReminders.length} pending</span>
              </h2>
              <button
                onClick={handleDismissAll}
                className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors bg-white border border-border text-foreground hover:bg-slate-50"
              >
                Dismiss All
              </button>
            </div>

            <div className="divide-y divide-border">
              {allReminders.map((reminder, idx) => {
                const colors = getReminderColor(reminder.type);
                return (
                  <div key={reminder.id} className={`p-6 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}`}>
                    <div className="flex items-start gap-6">
                      <div className={`mt-1 p-2 rounded-lg ${colors.bg}`}>{getReminderIcon(reminder.type)}</div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold tracking-tight text-foreground">
                              {reminder.title}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground mt-1">
                              {reminder.description}
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-semibold">
                              <span className="text-foreground">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">Tenant</span>
                                {reminder.tenant}
                              </span>
                              <span className="text-foreground">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">Property</span>
                                {reminder.property}
                              </span>
                              <span className="text-foreground text-base">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">Amount</span>
                                Ksh {reminder.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-2">
                             <button
                              onClick={() => handleDismiss(reminder.id)}
                              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${colors.bg} ${colors.text} border border-transparent hover:border-border`}
                            >
                              Dismiss
                            </button>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 px-2 py-1 ${colors.bg} ${colors.text} rounded`}>
                              Action: {reminder.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-16 text-center bg-white">
            <Bell size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-lg font-bold tracking-tight text-foreground">No active reminders</p>
            <p className="text-sm font-medium text-muted-foreground mt-2">All rent payments are up to date.</p>
          </div>
        )}
      </Card>

      {/* Reminder Settings Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card variant="subtle" className="p-6 bg-secondary/30 border-l-4 border-l-[#003441]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
            How Reminders Work
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#ba1a1a]/10 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-[#ba1a1a]" />
              </div>
              <div>
                <p className="font-bold text-foreground">Overdue Reminders</p>
                <p className="text-muted-foreground font-medium mt-1">Triggered when a tenant's rent payment is past due. Requires immediate follow-up.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#92400e]/10 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-[#92400e]" />
              </div>
              <div>
                <p className="font-bold text-foreground">Pending Reminders</p>
                <p className="text-muted-foreground font-medium mt-1">Triggered when rent payment is pending. Send a reminder to the tenant.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#166534]/10 flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-[#166534]" />
              </div>
              <div>
                <p className="font-bold text-foreground">Payment Confirmations</p>
                <p className="text-muted-foreground font-medium mt-1">Informational reminders showing successful rent payments received.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Items */}
        {overdueCount > 0 && (
          <Card
            variant="elevated"
            className="p-6 bg-[#ba1a1a]/5 border border-[#ba1a1a]/20"
          >
            <h3 className="text-lg font-bold tracking-tight text-[#ba1a1a] mb-2 flex items-center gap-2">
              <AlertCircle size={20} />
              Urgent Action Required
            </h3>
            <p className="text-sm font-medium text-slate-700">
              You have {overdueCount} overdue rent payment{overdueCount !== 1 ? 's' : ''}. Contact these tenants immediately to resolve payment issues and avoid further complications.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
