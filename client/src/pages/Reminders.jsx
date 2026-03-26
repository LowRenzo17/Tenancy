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
          description: `${tenant.name} at ${propertyName} has overdue rent of $${tenant.rentAmount.toLocaleString()}`,
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
          description: `${tenant.name} at ${propertyName} has pending rent of $${tenant.rentAmount.toLocaleString()}`,
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
          description: `${tenant.name} at ${propertyName} has paid rent of $${tenant.rentAmount.toLocaleString()}`,
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
        return { bg: 'rgba(186, 26, 26, 0.1)', border: '#ba1a1a', text: '#ba1a1a' };
      case 'pending':
        return { bg: 'rgba(146, 64, 14, 0.1)', border: '#92400e', text: '#92400e' };
      case 'paid':
        return { bg: 'rgba(22, 101, 52, 0.1)', border: '#166534', text: '#166534' };
      default:
        return { bg: '#e6f6ff', border: '#003441', text: '#003441' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Rent Payment Reminders
        </h1>
        <p style={{ color: '#40484b' }}>Automated notifications for rent payments and tenant follow-ups</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(186, 26, 26, 0.1)',
              }}
            >
              <AlertCircle size={20} style={{ color: '#ba1a1a' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#40484b' }}>Overdue Payments</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#ba1a1a' }}>
                {overdueCount}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(146, 64, 14, 0.1)',
              }}
            >
              <Clock size={20} style={{ color: '#92400e' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#40484b' }}>Pending Payments</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#92400e' }}>
                {pendingCount}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(22, 101, 52, 0.1)',
              }}
            >
              <CheckCircle size={20} style={{ color: '#166534' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#40484b' }}>Payments Received</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#166534' }}>
                {paidCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reminders List */}
      {allReminders.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              Active Reminders ({allReminders.length})
            </h2>
            <button
              onClick={handleDismissAll}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{
                color: '#003441',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              Dismiss All
            </button>
          </div>

          <div className="space-y-3">
            {allReminders.map((reminder, idx) => {
              const colors = getReminderColor(reminder.type);
              return (
                <Card key={reminder.id} variant={idx % 2 === 0 ? 'elevated' : 'subtle'} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="pt-1">{getReminderIcon(reminder.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold" style={{ color: '#071e27' }}>
                            {reminder.title}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: '#40484b' }}>
                            {reminder.description}
                          </p>
                          <div className="flex gap-4 mt-3 text-xs">
                            <span style={{ color: '#40484b' }}>
                              <strong>Tenant:</strong> {reminder.tenant}
                            </span>
                            <span style={{ color: '#40484b' }}>
                              <strong>Property:</strong> {reminder.property}
                            </span>
                            <span style={{ color: '#40484b' }}>
                              <strong>Amount:</strong> ${reminder.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDismiss(reminder.id)}
                          className="px-3 py-1 rounded text-xs font-medium transition-colors"
                          style={{
                            color: colors.text,
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                          }}
                          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                          onMouseLeave={(e) => (e.target.style.opacity = '1')}
                        >
                          Dismiss
                        </button>
                      </div>
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid #d5ecf8' }}>
                        <p className="text-xs font-medium" style={{ color: colors.text }}>
                          Action: {reminder.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card variant="subtle" className="p-12 text-center">
          <div style={{ color: '#40484b' }}>
            <Bell size={48} className="mx-auto mb-4" style={{ opacity: 0.5 }} />
            <p className="text-lg font-medium">No active reminders</p>
            <p className="text-sm mt-2">All rent payments are up to date!</p>
          </div>
        </Card>
      )}

      {/* Reminder Settings Info */}
      <Card variant="subtle" className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          How Reminders Work
        </h3>
        <div className="space-y-3" style={{ color: '#40484b' }}>
          <div className="flex gap-3">
            <div
              className="p-2 rounded"
              style={{
                backgroundColor: 'rgba(186, 26, 26, 0.1)',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} style={{ color: '#ba1a1a' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#071e27' }}>Overdue Reminders</p>
              <p className="text-sm">Triggered when a tenant's rent payment is past due. Requires immediate follow-up.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div
              className="p-2 rounded"
              style={{
                backgroundColor: 'rgba(146, 64, 14, 0.1)',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} style={{ color: '#92400e' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#071e27' }}>Pending Reminders</p>
              <p className="text-sm">Triggered when rent payment is pending. Send a reminder to the tenant.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div
              className="p-2 rounded"
              style={{
                backgroundColor: 'rgba(22, 101, 52, 0.1)',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={20} style={{ color: '#166534' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#071e27' }}>Payment Confirmations</p>
              <p className="text-sm">Informational reminders showing successful rent payments received.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Items */}
      {overdueCount > 0 && (
        <Card
          variant="elevated"
          className="p-6"
          style={{
            backgroundColor: 'rgba(186, 26, 26, 0.05)',
            borderLeft: '4px solid #ba1a1a',
          }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#ba1a1a' }}>
            ⚠️ Urgent Action Required
          </h3>
          <p style={{ color: '#40484b' }}>
            You have {overdueCount} overdue rent payment{overdueCount !== 1 ? 's' : ''}. Contact these tenants immediately to resolve payment issues and avoid further complications.
          </p>
        </Card>
      )}
    </div>
  );
}
