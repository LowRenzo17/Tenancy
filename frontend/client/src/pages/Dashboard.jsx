import { useEffect } from 'react';
import { Building2, Users, Banknote, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../lib/utils';

/**
 * Dashboard Page
 * Design System: The Architectural Ledger
 * - Summary cards with tonal layering
 * - Editorial typography hierarchy (Manrope for headlines)
 * - Whitespace-driven layout for premium feel
 */
export default function Dashboard({ properties, tenants, maintenanceRequests, onPageChange }) {
  const { fetchMaintenance } = useData();

  // Synchronize maintenance requests every time the Dashboard mounts
  useEffect(() => {
    fetchMaintenance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate summary metrics
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
  const totalTenants = tenants.length;
  const monthlyRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const pendingMaintenance = maintenanceRequests.filter(r => {
    const status = (r?.status || '').toString().trim().toLowerCase();
    return status === 'pending';
  }).length;

  // Best performing property (highest rent)
  const topProperty = [...properties].sort((a, b) => (b.monthlyRent || 0) - (a.monthlyRent || 0))[0] || null;

  // Recent activity (last 5 items)
  const recentActivity = [
    ...properties.slice(-2).map(p => ({
      type: 'property',
      message: `Property "${p.name}" added`,
      timestamp: new Date().toLocaleDateString(),
    })),
    ...tenants.slice(-2).map(t => ({
      type: 'tenant',
      message: `Tenant "${t.name}" registered`,
      timestamp: new Date().toLocaleDateString(),
    })),
    ...maintenanceRequests.slice(-1).map(r => ({
      type: 'maintenance',
      message: `Maintenance request: ${r.description}`,
      timestamp: new Date().toLocaleDateString(),
    })),
  ].slice(0, 5);

  const SummaryCard = ({ icon: Icon, label, value, subtext, delayClass = '' }) => (
    <Card variant="elevated" className={`p-6 animate-fade-in-up ${delayClass} flex flex-col justify-between h-full`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          {label}
        </p>
        <div className="p-2 rounded-md bg-secondary text-primary">
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </p>
        {subtext && <p className="text-xs mt-2 text-muted-foreground font-medium">{subtext}</p>}
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Portfolio Overview
          </h1>
          <p className="text-sm text-muted-foreground">High-level metrics and recent estate activity.</p>
        </div>
        <div className="text-sm font-semibold text-primary">
          {new Date().toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={Building2}
          label="Total Units"
          value={totalProperties}
          subtext={`${occupiedProperties} occupied units`}
        />
        <SummaryCard
          icon={Users}
          label="Occupancy Rate"
          value={`${totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0}%`}
          subtext="Across all properties"
          delayClass="delay-100"
        />
        <SummaryCard
          icon={Banknote}
          label="Est. Portfolio Value"
          value={formatCurrency(totalProperties * 250000)}
          subtext="Market approximation"
          delayClass="delay-200"
        />
        <SummaryCard
          icon={Banknote}
          label="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          subtext="Expected scheduled income"
          delayClass="delay-300"
        />
      </div>

      {/* Secondary Metrics & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-400">
        
        {/* Performance Highlight */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Top Performing Asset
          </h2>
          {topProperty ? (
            <Card variant="elevated" className="overflow-hidden">
              <div className="h-28 w-full bg-muted flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Building2 size={40} className="text-primary/30" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground mb-0.5 truncate">{topProperty.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 truncate">{topProperty.location || 'Location not set'}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Monthly Rent</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(topProperty.monthlyRent || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status</p>
                    <p className="text-sm font-bold text-foreground capitalize">{topProperty.status || 'Vacant'}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card variant="subtle" className="p-8 text-center border-dashed">
              <Building2 size={32} className="mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground font-medium">No properties yet</p>
              <button
                onClick={() => onPageChange?.('properties')}
                className="text-xs text-primary hover:underline font-semibold mt-2"
              >
                Add your first unit →
              </button>
            </Card>
          )}
          
          {/* Action Alerts */}
          <Card variant="elevated" className="p-4 border-l-4 border-l-destructive cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => onPageChange?.('maintenance')}>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Action Required</p>
                <p className="text-xs text-muted-foreground">You have {pendingMaintenance} pending maintenance request{pendingMaintenance !== 1 ? 's' : ''} requiring approval.</p>
                <p className="text-[10px] text-primary font-semibold mt-2 hover:underline">View maintenance →</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Global Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Recent Estate Activity
            </h2>
            <button className="text-xs font-semibold text-primary hover:underline" onClick={() => onPageChange?.('paymentHistory')}>
              View Complete Ledger
            </button>
          </div>
          <Card variant="elevated" className="p-0 overflow-hidden">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-border">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-4 hover:bg-secondary/30 transition-colors flex items-start gap-4">
                    <div className="mt-1">
                      {activity.type === 'property' && <Building2 size={16} className="text-muted-foreground" />}
                      {activity.type === 'tenant' && <Users size={16} className="text-primary" />}
                      {activity.type === 'maintenance' && <AlertCircle size={16} className="text-destructive" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-[11px] mt-1 text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
                        {activity.timestamp}
                        <span className="w-1 h-1 rounded-full bg-border" />
                        {activity.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-muted-foreground text-xs">0</span>
                </div>
                <p className="text-sm font-medium text-foreground">No recent activity on the ledger</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Events will be recorded here as they occur.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
