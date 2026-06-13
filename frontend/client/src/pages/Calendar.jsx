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
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Rent Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Track monthly rent payments and tenant obligations.</p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-border">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase tracking-widest text-sm">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-slate-800">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Total Due</p>
          <p className="text-2xl font-black tracking-tight text-slate-800">
            Ksh {totalRentDue.toLocaleString()}
          </p>
        </Card>
        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-emerald-600">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Paid</p>
          <p className="text-2xl font-black tracking-tight text-emerald-800">
            Ksh {paidRent.toLocaleString()}
          </p>
        </Card>
        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-amber-500">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Pending</p>
          <p className="text-2xl font-black tracking-tight text-amber-500">
            Ksh {pendingRent.toLocaleString()}
          </p>
        </Card>
        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-[#ba1a1a]">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Overdue</p>
          <p className="text-2xl font-black tracking-tight text-[#ba1a1a]">
            Ksh {overdueRent.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Tenant Rent Status List */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Tenant Rent Status <span className="text-muted-foreground font-medium text-sm ml-2">/ {monthNames[currentMonth]} {currentYear}</span>
          </h3>
        </div>
        
        {tenants.length > 0 ? (
          <div className="divide-y divide-border">
            {tenants.map((tenant, idx) => (
              <div key={tenant.id} className={`p-6 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/20'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">
                    {tenant.name}
                  </h4>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                    {getPropertyName(tenant.propertyId)}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Monthly Rent</p>
                    <p className="text-lg font-bold text-foreground">
                      Ksh {tenant.rentAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="min-w-[100px] flex justify-end">
                    <StatusBadge status={tenant.rentStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white">
            <Calendar size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-lg font-bold tracking-tight text-foreground">No tenants yet</p>
            <p className="text-sm font-medium text-muted-foreground mt-2">Add tenants to track rent payments.</p>
          </div>
        )}
      </Card>

      {/* Payment Summary */}
      <Card variant="elevated" className="p-0 overflow-hidden bg-[#eaf6fa]">
        <div className="p-6 border-b border-[#003441]/10">
          <h3 className="text-lg font-bold tracking-tight text-[#003441]">
            Payment Summary
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#003441]/70 mb-1">Collection Rate</p>
            <p className="text-4xl font-black tracking-tight text-[#003441]">
              {totalRentDue > 0 ? Math.round((paidRent / totalRentDue) * 100) : 0}%
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#003441]/70 mb-1">Outstanding</p>
            <p className="text-4xl font-black tracking-tight text-[#ba1a1a]">
              Ksh {(pendingRent + overdueRent).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#003441]/70 mb-1">Tenants on Track</p>
            <p className="text-4xl font-black tracking-tight text-emerald-800">
              {tenants.filter(t => t.rentStatus === 'paid').length}<span className="text-2xl text-[#003441]/50 font-bold">/{tenants.length}</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
