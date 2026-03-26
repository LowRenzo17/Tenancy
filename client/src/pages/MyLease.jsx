import { FileText, Download, Eye } from 'lucide-react';
import Card from '../components/Card';

/**
 * My Lease Page - Tenant View
 * Design System: The Architectural Ledger
 * - Displays lease document and key terms
 */
export default function MyLease({ currentUser }) {
  const leaseTerms = {
    startDate: 'January 1, 2024',
    endDate: 'December 31, 2025',
    monthlyRent: 1500,
    securityDeposit: 3000,
    renewalOption: 'Automatic renewal with 30-day notice',
    lateFeesPolicy: '5% of monthly rent after 5 days late',
    maintenanceResponsibility: 'Landlord covers major repairs, tenant handles minor maintenance',
    petPolicy: 'No pets allowed',
    utilities: 'Tenant responsible for electricity, water, and internet',
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#003441' }}>
          My Lease
        </h1>
        <p style={{ color: '#40484b' }}>Review your lease terms and documents</p>
      </div>

      {/* Lease Document Card */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#e6f6ff' }}
            >
              <FileText size={24} style={{ color: '#0f4c5c' }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: '#003441' }}>
                Lease Agreement
              </h2>
              <p className="text-sm" style={{ color: '#40484b' }}>
                Effective January 1, 2024
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: '#e6f6ff',
                color: '#0f4c5c',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c8ebf5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
              title="View lease"
            >
              <Eye size={20} />
            </button>
            <button
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: '#e6f6ff',
                color: '#0f4c5c',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c8ebf5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
              title="Download lease"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
        <p className="text-sm" style={{ color: '#40484b' }}>
          Last updated: March 1, 2024
        </p>
      </Card>

      {/* Lease Terms */}
      <Card>
        <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Manrope', color: '#003441' }}>
          Lease Terms
        </h2>

        <div className="space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6" style={{ borderBottom: '1px solid #d5ecf8' }}>
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Start Date</p>
              <p className="font-semibold mt-2" style={{ color: '#003441' }}>
                {leaseTerms.startDate}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>End Date</p>
              <p className="font-semibold mt-2" style={{ color: '#003441' }}>
                {leaseTerms.endDate}
              </p>
            </div>
          </div>

          {/* Financial Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6" style={{ borderBottom: '1px solid #d5ecf8' }}>
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Monthly Rent</p>
              <p className="font-semibold mt-2" style={{ color: '#003441' }}>
                ${leaseTerms.monthlyRent}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Security Deposit</p>
              <p className="font-semibold mt-2" style={{ color: '#003441' }}>
                ${leaseTerms.securityDeposit}
              </p>
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <div className="pb-4" style={{ borderBottom: '1px solid #d5ecf8' }}>
              <p className="text-sm" style={{ color: '#40484b' }}>Renewal Option</p>
              <p className="mt-2" style={{ color: '#003441' }}>
                {leaseTerms.renewalOption}
              </p>
            </div>

            <div className="pb-4" style={{ borderBottom: '1px solid #d5ecf8' }}>
              <p className="text-sm" style={{ color: '#40484b' }}>Late Fees Policy</p>
              <p className="mt-2" style={{ color: '#003441' }}>
                {leaseTerms.lateFeesPolicy}
              </p>
            </div>

            <div className="pb-4" style={{ borderBottom: '1px solid #d5ecf8' }}>
              <p className="text-sm" style={{ color: '#40484b' }}>Maintenance Responsibility</p>
              <p className="mt-2" style={{ color: '#003441' }}>
                {leaseTerms.maintenanceResponsibility}
              </p>
            </div>

            <div className="pb-4" style={{ borderBottom: '1px solid #d5ecf8' }}>
              <p className="text-sm" style={{ color: '#40484b' }}>Pet Policy</p>
              <p className="mt-2" style={{ color: '#003441' }}>
                {leaseTerms.petPolicy}
              </p>
            </div>

            <div>
              <p className="text-sm" style={{ color: '#40484b' }}>Utilities</p>
              <p className="mt-2" style={{ color: '#003441' }}>
                {leaseTerms.utilities}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Landlord */}
      <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: '#e6f6ff' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#003441' }}>
          Questions about your lease?
        </h3>
        <p className="text-sm mb-4" style={{ color: '#40484b' }}>
          Contact your property manager for clarifications or lease modifications.
        </p>
        <button
          className="px-4 py-2 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: '#003441',
            color: '#f3faff',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f4c5c')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#003441')}
        >
          Contact Property Manager
        </button>
      </div>
    </div>
  );
}
