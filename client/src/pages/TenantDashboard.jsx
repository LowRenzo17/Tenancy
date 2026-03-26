import { useState, useEffect } from 'react';
import { FileText, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * Tenant Dashboard Page
 * Design System: The Architectural Ledger
 * - Displays tenant's lease information and payment status
 * - Shows upcoming rent due dates and payment history
 */
export default function TenantDashboard({ currentUser }) {
  const [tenantData, setTenantData] = useState(null);

  useEffect(() => {
    // Load tenant data from localStorage
    const users = JSON.parse(localStorage.getItem('tenancySlateUsers') || '[]');
    const user = users.find(u => u.email === currentUser.email);
    if (user) {
      setTenantData(user);
    }
  }, [currentUser]);

  if (!tenantData) {
    return (
      <div className="p-8">
        <p style={{ color: '#40484b' }}>Loading your information...</p>
      </div>
    );
  }

  const monthlyRent = 1500;
  const nextDueDate = new Date(2026, 3, 1); // April 1st
  const daysUntilDue = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#003441' }}>
          Welcome, {tenantData.name || 'Tenant'}
        </h1>
        <p style={{ color: '#40484b' }}>Manage your lease and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Monthly Rent</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#003441' }}>
                ${monthlyRent}
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>Due on the 1st of each month</p>
            </div>
            <DollarSign size={32} style={{ color: '#0f4c5c' }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Next Payment Due</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#003441' }}>
                {daysUntilDue} days
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                {nextDueDate.toLocaleDateString()}
              </p>
            </div>
            <Clock size={32} style={{ color: '#0f4c5c' }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Payment Status</p>
              <div className="mt-3">
                <StatusBadge status={tenantData.rentStatus || 'paid'} />
              </div>
              <p className="text-xs mt-3" style={{ color: '#40484b' }}>
                {tenantData.rentStatus === 'paid' ? 'All payments current' : 'Action required'}
              </p>
            </div>
            {tenantData.rentStatus === 'paid' ? (
              <CheckCircle size={32} style={{ color: '#2d7a3e' }} />
            ) : (
              <AlertCircle size={32} style={{ color: '#ba1a1a' }} />
            )}
          </div>
        </Card>
      </div>

      {/* Lease Information */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#003441' }}>
            Lease Information
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid #d5ecf8' }}>
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Property</p>
              <p className="font-semibold mt-1" style={{ color: '#003441' }}>
                {tenantData.assignedProperty || 'Not assigned'}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid #d5ecf8' }}>
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Lease Start Date</p>
              <p className="font-semibold mt-1" style={{ color: '#003441' }}>
                January 1, 2024
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid #d5ecf8' }}>
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Lease End Date</p>
              <p className="font-semibold mt-1" style={{ color: '#003441' }}>
                December 31, 2025
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Lease Term</p>
              <p className="font-semibold mt-1" style={{ color: '#003441' }}>
                12 months
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          className="p-4 rounded-xl font-semibold transition-all"
          style={{
            backgroundColor: '#e6f6ff',
            color: '#0f4c5c',
            border: '1px solid #b3e5fc',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c8ebf5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
        >
          View Full Lease Document
        </button>
        <button
          className="p-4 rounded-xl font-semibold transition-all"
          style={{
            backgroundColor: '#e6f6ff',
            color: '#0f4c5c',
            border: '1px solid #b3e5fc',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c8ebf5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
        >
          Download Lease PDF
        </button>
      </div>
    </div>
  );
}
