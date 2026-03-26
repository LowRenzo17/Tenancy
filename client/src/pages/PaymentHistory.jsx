import { useState } from 'react';
import { CreditCard, Download, Filter, Search } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * Payment History Page
 * Design System: The Architectural Ledger
 * - Detailed payment transaction ledger per tenant
 * - Payment tracking and history management
 */
export default function PaymentHistory({ tenants, properties }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Generate mock payment history for each tenant
  const generatePaymentHistory = (tenant) => {
    const history = [];
    const currentDate = new Date();

    // Generate 6 months of payment history
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const status = i === 0 ? tenant.rentStatus : (Math.random() > 0.2 ? 'paid' : 'pending');
      const amount = tenant.rentAmount || 1500;

      history.push({
        id: `payment-${tenant.id}-${i}`,
        tenantId: tenant.id,
        date: monthDate,
        dueDate: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
        amount: amount,
        status: status,
        method: status === 'paid' ? ['Bank Transfer', 'Check', 'Credit Card'][Math.floor(Math.random() * 3)] : null,
        reference: status === 'paid' ? `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      });
    }

    return history.sort((a, b) => b.date - a.date);
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTenantData = selectedTenant
    ? tenants.find(t => t.id === selectedTenant)
    : null;

  const selectedProperty = selectedTenantData
    ? properties.find(p => p.id === parseInt(selectedTenantData.propertyId))
    : null;

  const paymentHistory = selectedTenantData
    ? generatePaymentHistory(selectedTenantData)
    : [];

  const filteredHistory = filterStatus === 'all'
    ? paymentHistory
    : paymentHistory.filter(p => p.status === filterStatus);

  // Calculate summary statistics
  const totalPaid = paymentHistory
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = paymentHistory
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const paymentRate = paymentHistory.length > 0
    ? Math.round((paymentHistory.filter(p => p.status === 'paid').length / paymentHistory.length) * 100)
    : 0;

  const downloadCSV = () => {
    if (!selectedTenantData) return;

    let csv = 'Payment History Report\n';
    csv += `Tenant: ${selectedTenantData.name}\n`;
    csv += `Property: ${selectedProperty?.name || 'N/A'}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += 'Date,Due Date,Amount,Status,Payment Method,Reference\n';

    paymentHistory.forEach(payment => {
      csv += `${payment.date.toLocaleDateString()},${payment.dueDate.toLocaleDateString()},$${payment.amount},${payment.status},${payment.method || 'N/A'},${payment.reference || 'N/A'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${selectedTenantData.name.replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Payment History
        </h1>
        <p style={{ color: '#40484b' }}>Track detailed payment transactions and history for each tenant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Selection Sidebar */}
        <div>
          <Card variant="elevated" className="p-4">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              Select Tenant
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#40484b' }} />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              />
            </div>

            {/* Tenant List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTenants.length > 0 ? (
                filteredTenants.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => setSelectedTenant(tenant.id)}
                    className="w-full text-left p-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: selectedTenant === tenant.id ? '#e6f6ff' : 'transparent',
                      borderLeft: selectedTenant === tenant.id ? '3px solid #003441' : '3px solid transparent',
                      color: selectedTenant === tenant.id ? '#003441' : '#40484b',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTenant !== tenant.id) {
                        e.target.style.backgroundColor = '#f3faff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTenant !== tenant.id) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <p className="font-semibold text-sm">{tenant.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#40484b' }}>
                      ${tenant.rentAmount?.toLocaleString() || '0'}/month
                    </p>
                  </button>
                ))
              ) : (
                <p style={{ color: '#40484b' }}>No tenants found</p>
              )}
            </div>
          </Card>
        </div>

        {/* Payment History Content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTenantData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-4">
                  <p className="text-xs mb-2" style={{ color: '#40484b' }}>Total Paid</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#166534' }}>
                    ${totalPaid.toLocaleString()}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                    {paymentHistory.filter(p => p.status === 'paid').length} payments
                  </p>
                </Card>

                <Card variant="elevated" className="p-4">
                  <p className="text-xs mb-2" style={{ color: '#40484b' }}>Outstanding</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#ba1a1a' }}>
                    ${totalPending.toLocaleString()}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                    {paymentHistory.filter(p => p.status === 'pending').length} pending
                  </p>
                </Card>

                <Card variant="elevated" className="p-4">
                  <p className="text-xs mb-2" style={{ color: '#40484b' }}>Payment Rate</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#003441' }}>
                    {paymentRate}%
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                    On-time payments
                  </p>
                </Card>
              </div>

              {/* Tenant Info */}
              <Card variant="subtle" className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#071e27' }}>
                      {selectedTenantData.name}
                    </h3>
                    <p style={{ color: '#40484b' }}>
                      {selectedProperty?.name || 'Unknown Property'}
                    </p>
                    <p className="text-sm mt-2" style={{ color: '#40484b' }}>
                      Monthly Rent: <strong>${selectedTenantData.rentAmount?.toLocaleString() || '0'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: '#003441',
                      color: '#fff',
                    }}
                    onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </Card>

              {/* Filter */}
              <div className="flex gap-2">
                {['all', 'paid', 'pending'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    style={{
                      backgroundColor: filterStatus === status ? '#003441' : '#e6f6ff',
                      color: filterStatus === status ? '#fff' : '#003441',
                    }}
                    onMouseEnter={(e) => {
                      if (filterStatus !== status) {
                        e.target.style.backgroundColor = '#d5ecf8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (filterStatus !== status) {
                        e.target.style.backgroundColor = '#e6f6ff';
                      }
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Payment History Table */}
              <Card variant="elevated" className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #d5ecf8' }}>
                      <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Date</th>
                      <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Due Date</th>
                      <th className="text-right py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Amount</th>
                      <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Status</th>
                      <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Method</th>
                      <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((payment, idx) => (
                        <tr
                          key={payment.id}
                          style={{
                            borderBottom: '1px solid #e6f6ff',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : '#f9fcfe',
                          }}
                        >
                          <td className="py-3 px-2" style={{ color: '#071e27' }}>
                            {payment.date.toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2" style={{ color: '#40484b' }}>
                            {payment.dueDate.toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-right font-semibold" style={{ color: '#071e27' }}>
                            ${payment.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-2">
                            <StatusBadge status={payment.status} />
                          </td>
                          <td className="py-3 px-2" style={{ color: '#40484b' }}>
                            {payment.method || '—'}
                          </td>
                          <td className="py-3 px-2 font-mono text-xs" style={{ color: '#40484b' }}>
                            {payment.reference || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center" style={{ color: '#40484b' }}>
                          No payment history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </>
          ) : (
            <Card variant="subtle" className="p-12 text-center">
              <CreditCard size={48} className="mx-auto mb-4" style={{ color: '#003441', opacity: 0.5 }} />
              <p className="text-lg font-medium" style={{ color: '#071e27' }}>Select a tenant to view payment history</p>
              <p style={{ color: '#40484b' }}>Choose a tenant from the list to see their payment transactions</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
