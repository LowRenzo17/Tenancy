import { BarChart3, TrendingUp, Home, DollarSign } from 'lucide-react';
import Card from '../components/Card';

/**
 * Analytics Page
 * Design System: The Architectural Ledger
 * - Property occupancy trends and revenue forecasts
 * - Visual analytics with key metrics
 */
export default function Analytics({ properties, tenants }) {
  // Calculate occupancy metrics
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
  const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

  // Calculate revenue metrics
  const totalMonthlyRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const paidRevenue = tenants
    .filter(t => t.rentStatus === 'paid')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const pendingRevenue = tenants
    .filter(t => t.rentStatus === 'pending')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const overdueRevenue = tenants
    .filter(t => t.rentStatus === 'overdue')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);

  // Calculate maintenance cost estimates
  const avgMaintenanceCostPerProperty = 150; // Estimated monthly maintenance per property
  const estimatedMonthlyMaintenance = totalProperties * avgMaintenanceCostPerProperty;
  const netMonthlyProfit = totalMonthlyRevenue - estimatedMonthlyMaintenance;

  // Revenue forecast for next 3 months (assuming consistent collection)
  const collectionRate = totalMonthlyRevenue > 0 ? (paidRevenue / totalMonthlyRevenue) : 0;
  const forecastedRevenue = totalMonthlyRevenue * collectionRate;

  // Property breakdown
  const propertyByStatus = {
    occupied: occupiedProperties,
    vacant: totalProperties - occupiedProperties,
  };

  // Tenant breakdown
  const tenantsByStatus = {
    paid: tenants.filter(t => t.rentStatus === 'paid').length,
    pending: tenants.filter(t => t.rentStatus === 'pending').length,
    overdue: tenants.filter(t => t.rentStatus === 'overdue').length,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Property Analytics
        </h1>
        <p style={{ color: '#40484b' }}>Track occupancy trends, revenue forecasts, and maintenance costs</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#40484b' }}>Occupancy Rate</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                {occupancyRate}%
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                {occupiedProperties} of {totalProperties} properties
              </p>
            </div>
            <Home size={32} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#40484b' }}>Monthly Revenue</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                ${totalMonthlyRevenue.toLocaleString()}
              </p>
              <p className="text-xs mt-2" style={{ color: '#166534' }}>
                ${paidRevenue.toLocaleString()} collected
              </p>
            </div>
            <DollarSign size={32} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#40484b' }}>Est. Monthly Costs</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                ${estimatedMonthlyMaintenance.toLocaleString()}
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                Maintenance & operations
              </p>
            </div>
            <BarChart3 size={32} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#40484b' }}>Net Monthly Profit</p>
              <p
                className="text-3xl font-bold"
                style={{
                  fontFamily: 'Manrope',
                  color: netMonthlyProfit > 0 ? '#166534' : '#ba1a1a',
                }}
              >
                ${netMonthlyProfit.toLocaleString()}
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                After estimated costs
              </p>
            </div>
            <TrendingUp size={32} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>
      </div>

      {/* Occupancy & Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Status Breakdown */}
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Property Status Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span style={{ color: '#40484b' }}>Occupied</span>
                <span className="font-semibold" style={{ color: '#071e27' }}>
                  {propertyByStatus.occupied}
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  backgroundColor: '#e6f6ff',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#166534',
                    width: `${occupancyRate}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span style={{ color: '#40484b' }}>Vacant</span>
                <span className="font-semibold" style={{ color: '#071e27' }}>
                  {propertyByStatus.vacant}
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  backgroundColor: '#e6f6ff',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#ba1a1a',
                    width: `${100 - occupancyRate}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Rent Payment Status */}
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Rent Payment Status
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span style={{ color: '#40484b' }}>Paid</span>
                <span className="font-semibold" style={{ color: '#071e27' }}>
                  {tenantsByStatus.paid}
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  backgroundColor: '#e6f6ff',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#166534',
                    width: `${tenants.length > 0 ? (tenantsByStatus.paid / tenants.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span style={{ color: '#40484b' }}>Pending</span>
                <span className="font-semibold" style={{ color: '#071e27' }}>
                  {tenantsByStatus.pending}
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  backgroundColor: '#e6f6ff',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#92400e',
                    width: `${tenants.length > 0 ? (tenantsByStatus.pending / tenants.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span style={{ color: '#40484b' }}>Overdue</span>
                <span className="font-semibold" style={{ color: '#071e27' }}>
                  {tenantsByStatus.overdue}
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  backgroundColor: '#e6f6ff',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#ba1a1a',
                    width: `${tenants.length > 0 ? (tenantsByStatus.overdue / tenants.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Forecast */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Revenue Forecast
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm mb-2" style={{ color: '#40484b' }}>Current Month</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              ${forecastedRevenue.toLocaleString()}
            </p>
            <p className="text-xs mt-2" style={{ color: '#40484b' }}>
              Based on {Math.round(collectionRate * 100)}% collection rate
            </p>
          </div>
          <div>
            <p className="text-sm mb-2" style={{ color: '#40484b' }}>Next Month</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              ${forecastedRevenue.toLocaleString()}
            </p>
            <p className="text-xs mt-2" style={{ color: '#40484b' }}>
              Projected (same rate)
            </p>
          </div>
          <div>
            <p className="text-sm mb-2" style={{ color: '#40484b' }}>3-Month Total</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              ${(forecastedRevenue * 3).toLocaleString()}
            </p>
            <p className="text-xs mt-2" style={{ color: '#40484b' }}>
              Quarterly forecast
            </p>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card variant="subtle" className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Key Insights
        </h3>
        <ul className="space-y-3" style={{ color: '#40484b' }}>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span>
              Your portfolio has an occupancy rate of <strong>{occupancyRate}%</strong>. Aim to maintain above 90% for optimal revenue.
            </span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span>
              Outstanding rent of <strong>${(pendingRevenue + overdueRevenue).toLocaleString()}</strong> needs attention. Follow up with tenants to ensure timely payment.
            </span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span>
              Your net monthly profit is <strong>${netMonthlyProfit.toLocaleString()}</strong> after estimated maintenance costs.
            </span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span>
              Collection rate is at <strong>{Math.round(collectionRate * 100)}%</strong>. Improving this by 10% could add ${(totalMonthlyRevenue * 0.1).toLocaleString()} monthly.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
