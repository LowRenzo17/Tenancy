import { Building2, Users, DollarSign, AlertCircle } from 'lucide-react';
import Card from '../components/Card';

/**
 * Dashboard Page
 * Design System: The Architectural Ledger
 * - Summary cards with tonal layering
 * - Editorial typography hierarchy (Manrope for headlines)
 * - Whitespace-driven layout for premium feel
 */
export default function Dashboard({ properties, tenants, maintenanceRequests }) {
  // Calculate summary metrics
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
  const totalTenants = tenants.length;
  const monthlyRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'Pending').length;

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

  const SummaryCard = ({ icon: Icon, label, value, subtext }) => (
    <Card variant="elevated" className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: '#40484b' }}>
            {label}
          </p>
          <p className="text-3xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            {value}
          </p>
          {subtext && <p className="text-xs mt-2" style={{ color: '#40484b' }}>{subtext}</p>}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#e6f6ff' }}>
          <Icon size={24} style={{ color: '#003441' }} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Dashboard
        </h1>
        <p style={{ color: '#40484b' }}>Welcome to your property management hub</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={Building2}
          label="Total Properties"
          value={totalProperties}
          subtext={`${occupiedProperties} occupied`}
        />
        <SummaryCard
          icon={Users}
          label="Total Tenants"
          value={totalTenants}
          subtext="Active tenancies"
        />
        <SummaryCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          subtext="Expected income"
        />
        <SummaryCard
          icon={AlertCircle}
          label="Maintenance Requests"
          value={pendingMaintenance}
          subtext="Pending attention"
        />
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Recent Activity
        </h2>
        <Card variant="elevated" className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between pb-4 last:pb-0"
                  style={{
                    borderBottom: idx < recentActivity.length - 1 ? '1px solid #e6f6ff' : 'none',
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#071e27' }}>
                      {activity.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#40484b' }}>
                      {activity.timestamp}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full ml-4"
                    style={{ backgroundColor: '#e6f6ff', color: '#40484b' }}
                  >
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: '#40484b' }}>No recent activity yet</p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                Start by adding properties or tenants
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
