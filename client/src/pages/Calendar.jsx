import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * Calendar Page
 * Design System: The Architectural Ledger
 * - Monthly rent payment tracking
 * - Visual calendar with payment status indicators
 * - Tenant rent overview by month
 */
export default function CalendarPage({ tenants, properties }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown Property';
  };

  // Calculate total rent due this month
  const totalRentDue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const paidRent = tenants
    .filter(t => t.rentStatus === 'paid')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const pendingRent = tenants
    .filter(t => t.rentStatus === 'pending')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const overdueRent = tenants
    .filter(t => t.rentStatus === 'overdue')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Rent Calendar
        </h1>
        <p style={{ color: '#40484b' }}>Track monthly rent payments and tenant obligations</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: '#003441',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: '#003441',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4">
          <p className="text-xs font-medium mb-1" style={{ color: '#40484b' }}>Total Due</p>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            ${totalRentDue.toLocaleString()}
          </p>
        </Card>
        <Card variant="elevated" className="p-4">
          <p className="text-xs font-medium mb-1" style={{ color: '#40484b' }}>Paid</p>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#166534' }}>
            ${paidRent.toLocaleString()}
          </p>
        </Card>
        <Card variant="elevated" className="p-4">
          <p className="text-xs font-medium mb-1" style={{ color: '#40484b' }}>Pending</p>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#92400e' }}>
            ${pendingRent.toLocaleString()}
          </p>
        </Card>
        <Card variant="elevated" className="p-4">
          <p className="text-xs font-medium mb-1" style={{ color: '#40484b' }}>Overdue</p>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#ba1a1a' }}>
            ${overdueRent.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Tenant Rent Status List */}
      <div>
        <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Tenant Rent Status - {monthNames[currentMonth]} {currentYear}
        </h3>
        {tenants.length > 0 ? (
          <div className="space-y-3">
            {tenants.map((tenant, idx) => (
              <Card key={tenant.id} variant={idx % 2 === 0 ? 'elevated' : 'subtle'} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold" style={{ color: '#071e27' }}>
                      {tenant.name}
                    </h4>
                    <p className="text-sm mt-1" style={{ color: '#40484b' }}>
                      {getPropertyName(tenant.propertyId)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#40484b' }}>Monthly Rent</p>
                      <p className="text-lg font-semibold" style={{ color: '#071e27' }}>
                        ${tenant.rentAmount.toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={tenant.rentStatus} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="subtle" className="p-12 text-center">
            <div style={{ color: '#40484b' }}>
              <Calendar size={48} className="mx-auto mb-4" style={{ opacity: 0.5 }} />
              <p className="text-lg font-medium">No tenants yet</p>
              <p className="text-sm mt-2">Add tenants to track rent payments</p>
            </div>
          </Card>
        )}
      </div>

      {/* Payment Summary */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Payment Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Collection Rate</p>
            <p className="text-3xl font-bold mt-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              {totalRentDue > 0 ? Math.round((paidRent / totalRentDue) * 100) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Outstanding</p>
            <p className="text-3xl font-bold mt-2" style={{ fontFamily: 'Manrope', color: '#ba1a1a' }}>
              ${(pendingRent + overdueRent).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Tenants on Track</p>
            <p className="text-3xl font-bold mt-2" style={{ fontFamily: 'Manrope', color: '#166534' }}>
              {tenants.filter(t => t.rentStatus === 'paid').length}/{tenants.length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
