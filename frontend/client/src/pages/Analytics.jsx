import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Home, Banknote, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import { formatCurrency } from '../lib/utils';
import apiClient from '../lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

/**
 * Analytics Page — all data sourced from the real database.
 * No hardcoded estimates, no fabricated historical months.
 */
export default function Analytics({ properties, tenants }) {
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [maintenanceAnalytics, setMaintenanceAnalytics] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  // ── Fetch real payment history from the API ───────────────────────────
  useEffect(() => {
    setLoadingRevenue(true);
    apiClient
      .get('/analytics/revenue')
      .then((res) => {
        if (res.success && Array.isArray(res.revenueData)) {
          // Format month labels for the chart
          const formatted = res.revenueData.map((row) => ({
            ...row,
            label: new Date(row.month).toLocaleString('default', {
              month: 'short',
              year: '2-digit',
            }),
          }));
          setRevenueHistory(formatted);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRevenue(false));
  }, []);

  useEffect(() => {
    apiClient
      .get('/analytics/maintenance')
      .then((res) => {
        if (res.success) setMaintenanceAnalytics(res);
      })
      .catch(() => {});
  }, []);

  // ── Compute real metrics from props ──────────────────────────────────
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(
    (p) => p.occupancyStatus === 'occupied' || p.status === 'occupied'
  ).length;
  const occupancyRate =
    totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

  // Revenue from tenants (current snapshot)
  const totalMonthlyRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const paidRevenue = tenants
    .filter((t) => t.rentStatus === 'paid')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const pendingRevenue = tenants
    .filter((t) => t.rentStatus === 'pending')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const overdueRevenue = tenants
    .filter((t) => t.rentStatus === 'overdue')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);

  // Collection reliability from actual payments
  const collectionRate =
    totalMonthlyRevenue > 0 ? paidRevenue / totalMonthlyRevenue : 0;

  // Real maintenance costs from API
  const realMaintenanceCosts = maintenanceAnalytics?.totalCost ?? 0;

  // Property breakdown for bar chart
  const occupancyChartData = [
    { name: 'Occupied', value: occupiedProperties, fill: 'var(--primary)' },
    {
      name: 'Vacant',
      value: totalProperties - occupiedProperties,
      fill: 'var(--muted)',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Financial &amp; Asset Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Portfolio performance and revenue data — live from your records.
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Occupancy */}
        <Card variant="elevated" className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Occupancy
            </p>
            <div className="p-2 rounded-md bg-secondary text-primary">
              <Home size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {occupancyRate}%
            </p>
            <p className="text-xs mt-2 text-muted-foreground font-medium">
              {occupiedProperties} of {totalProperties} units active
            </p>
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card variant="elevated" className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Monthly Ledger
            </p>
            <div className="p-2 rounded-md bg-secondary text-primary">
              <Banknote size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatCurrency(totalMonthlyRevenue)}
            </p>
            <p className="text-xs mt-2 text-green-600 font-medium">
              {formatCurrency(paidRevenue)} collected
            </p>
          </div>
        </Card>

        {/* Maintenance Costs — real from DB */}
        <Card variant="elevated" className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Maintenance Spend
            </p>
            <div className="p-2 rounded-md bg-secondary text-primary">
              <BarChart3 size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatCurrency(realMaintenanceCosts)}
            </p>
            <p className="text-xs mt-2 text-muted-foreground font-medium">
              Actual costs recorded
            </p>
          </div>
        </Card>

        {/* Net Yield */}
        <Card
          variant="elevated"
          className="p-6 flex flex-col justify-between h-full border-primary/20 bg-primary/5"
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold tracking-wide uppercase text-primary">
              Net Yield
            </p>
            <div className="p-2 rounded-md bg-primary text-primary-foreground">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary tracking-tight">
              {formatCurrency(paidRevenue - realMaintenanceCosts)}
            </p>
            <p className="text-xs mt-2 text-primary/70 font-medium">
              Collected minus recorded costs
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue History — real API data */}
        <Card variant="elevated" className="col-span-1 lg:col-span-2 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Revenue History
            </h3>
            <p className="text-sm text-muted-foreground">
              Actual collected vs pending vs overdue by payment month
            </p>
          </div>
          <div className="h-72 w-full">
            {loadingRevenue ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading revenue data…
              </div>
            ) : revenueHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle size={20} className="opacity-50" />
                <p className="text-sm">No payment records yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueHistory}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    name="Collected"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPaid)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                  <Area
                    type="monotone"
                    dataKey="overdue"
                    name="Overdue"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOverdue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Asset Utilization */}
        <Card variant="elevated" className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Asset Utilization
            </h3>
            <p className="text-sm text-muted-foreground">Current portfolio status</p>
          </div>
          {totalProperties === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <AlertCircle size={20} className="opacity-50" />
              <p className="text-sm">No properties yet</p>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={occupancyChartData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="currentColor" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Rent Collection Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="subtle" className="p-5 border-l-4 border-l-green-500">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Collected
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(paidRevenue)}
          </p>
          <p className="text-[10px] uppercase font-bold text-green-600 mt-1 tracking-widest">
            {Math.round(collectionRate * 100)}% collection rate
          </p>
        </Card>
        <Card variant="subtle" className="p-5 border-l-4 border-l-amber-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(pendingRevenue)}
          </p>
          <p className="text-[10px] uppercase font-bold text-amber-600 mt-1 tracking-widest">
            Awaiting payment
          </p>
        </Card>
        <Card variant="subtle" className="p-5 border-l-4 border-l-destructive">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Overdue
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(overdueRevenue)}
          </p>
          <p className="text-[10px] uppercase font-bold text-destructive mt-1 tracking-widest">
            Requires follow-up
          </p>
        </Card>
      </div>

      {/* Ledger Insights */}
      <Card variant="elevated" className="p-6 bg-secondary/10">
        <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">
          Ledger Insights
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-3 bg-card p-4 rounded-md border border-border">
            <span className="text-primary mt-0.5">
              <TrendingUp size={16} />
            </span>
            <p className="text-sm text-foreground">
              Portfolio occupancy is{' '}
              <strong className="font-bold">{occupancyRate}%</strong>.{' '}
              {occupancyRate < 100
                ? 'Maximize yield by addressing vacant units.'
                : 'All units are fully occupied.'}
            </p>
          </div>
          <div className="flex gap-3 bg-card p-4 rounded-md border border-border border-l-destructive">
            <span className="text-destructive mt-0.5">
              <Banknote size={16} />
            </span>
            <p className="text-sm text-foreground">
              Delinquent balance is{' '}
              <strong className="font-bold">
                {formatCurrency(pendingRevenue + overdueRevenue)}
              </strong>
              .{pendingRevenue + overdueRevenue > 0 ? ' Follow-up is advised.' : ' You are up to date.'}
            </p>
          </div>
          <div className="flex gap-3 bg-card p-4 rounded-md border border-border border-l-primary">
            <span className="text-primary mt-0.5">
              <BarChart3 size={16} />
            </span>
            <p className="text-sm text-foreground">
              Net yield (collected minus recorded maintenance) is{' '}
              <strong className="font-bold">
                {formatCurrency(paidRevenue - realMaintenanceCosts)}
              </strong>
              .
            </p>
          </div>
          <div className="flex gap-3 bg-card p-4 rounded-md border border-border">
            <span className="text-primary mt-0.5">
              <Home size={16} />
            </span>
            <p className="text-sm text-foreground">
              Collection reliability:{' '}
              <strong className="font-bold">{Math.round(collectionRate * 100)}%</strong>.{' '}
              A 10% improvement would add{' '}
              <strong className="font-bold">
                {formatCurrency(Math.round(totalMonthlyRevenue * 0.1))}
              </strong>{' '}
              per month.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
