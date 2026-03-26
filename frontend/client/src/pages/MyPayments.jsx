import { CreditCard, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * My Payments Page - Tenant View
 * Design System: The Architectural Ledger
 * - Displays payment history and upcoming due dates
 */
export default function MyPayments({ currentUser }) {
  const payments = [
    { month: 'March 2026', amount: 1500, status: 'paid', date: '2026-03-01', method: 'Bank Transfer' },
    { month: 'February 2026', amount: 1500, status: 'paid', date: '2026-02-01', method: 'Bank Transfer' },
    { month: 'January 2026', amount: 1500, status: 'paid', date: '2026-01-01', method: 'Bank Transfer' },
    { month: 'December 2025', amount: 1500, status: 'paid', date: '2025-12-01', method: 'Bank Transfer' },
    { month: 'November 2025', amount: 1500, status: 'paid', date: '2025-11-01', method: 'Bank Transfer' },
    { month: 'October 2025', amount: 1500, status: 'paid', date: '2025-10-01', method: 'Bank Transfer' },
  ];

  const upcomingPayment = {
    month: 'April 2026',
    amount: 1500,
    dueDate: '2026-04-01',
    daysUntilDue: 6,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={20} style={{ color: '#2d7a3e' }} />;
      case 'pending':
        return <Clock size={20} style={{ color: '#f57c00' }} />;
      case 'overdue':
        return <AlertCircle size={20} style={{ color: '#ba1a1a' }} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#003441' }}>
          My Payments
        </h1>
        <p style={{ color: '#40484b' }}>View your payment history and upcoming due dates</p>
      </div>

      {/* Upcoming Payment */}
      <Card className="mb-8" style={{ backgroundColor: '#e6f6ff' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Next Payment Due</p>
            <p className="text-3xl font-bold mt-2" style={{ color: '#003441' }}>
              ${upcomingPayment.amount}
            </p>
            <p className="text-sm mt-2" style={{ color: '#40484b' }}>
              {upcomingPayment.month} • Due in {upcomingPayment.daysUntilDue} days
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: '#003441',
              color: '#f3faff',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f4c5c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#003441')}
          >
            Pay Now
          </button>
        </div>
      </Card>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Total Paid (6 months)</p>
            <p className="text-2xl font-bold mt-2" style={{ color: '#003441' }}>
              $9,000
            </p>
            <p className="text-xs mt-2" style={{ color: '#40484b' }}>
              All payments on time
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Payment Method</p>
            <p className="text-lg font-bold mt-2" style={{ color: '#003441' }}>
              Bank Transfer
            </p>
            <p className="text-xs mt-2" style={{ color: '#40484b' }}>
              Automatic monthly
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Payment Status</p>
            <div className="mt-3">
              <StatusBadge status="paid" />
            </div>
            <p className="text-xs mt-3" style={{ color: '#40484b' }}>
              Current and on schedule
            </p>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold" style={{ fontFamily: 'Manrope', color: '#003441' }}>
            Payment History
          </h2>
        </div>

        <div className="space-y-0">
          {payments.map((payment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg transition-all"
              style={{
                backgroundColor: index % 2 === 0 ? '#f3faff' : 'transparent',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: '#003441' }}>
                    {payment.month}
                  </p>
                  <p className="text-sm" style={{ color: '#40484b' }}>
                    {payment.method} • {new Date(payment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold" style={{ color: '#003441' }}>
                    ${payment.amount}
                  </p>
                  <div className="mt-1">
                    {getStatusIcon(payment.status)}
                  </div>
                </div>
                <button
                  className="p-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: '#e6f6ff',
                    color: '#0f4c5c',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c8ebf5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
                  title="Download receipt"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="mt-8">
        <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Manrope', color: '#003441' }}>
          Payment Methods
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#e6f6ff' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold" style={{ color: '#003441' }}>
                  Bank Account
                </p>
                <p className="text-sm" style={{ color: '#40484b' }}>
                  ••••••••5678
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: '#c8ebf5',
                  color: '#0f4c5c',
                }}
              >
                Default
              </span>
            </div>
          </div>

          <button
            className="w-full p-4 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: '#f3faff',
              color: '#0f4c5c',
              border: '1px solid #b3e5fc',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3faff')}
          >
            + Add Payment Method
          </button>
        </div>
      </Card>
    </div>
  );
}
