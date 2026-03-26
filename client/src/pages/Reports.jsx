import { FileText, Download } from 'lucide-react';
import Card from '../components/Card';
import {
  exportPropertiesToCSV,
  exportTenantsToCSV,
  exportRevenueReportToCSV,
  exportMaintenanceToCSV,
  generatePDFReport,
  createTableHTML,
} from '../lib/exportUtils';

/**
 * Reports Page
 * Design System: The Architectural Ledger
 * - Export data to CSV and PDF formats
 * - Multiple report types for different use cases
 */
export default function Reports({ properties, tenants, maintenanceRequests }) {
  const handleExportPropertiesCSV = () => {
    exportPropertiesToCSV(properties);
  };

  const handleExportPropertiesPDF = () => {
    const headers = ['Property Name', 'Location', 'Status'];
    const rows = properties.map(p => [p.name, p.location, p.status]);
    const tableHTML = createTableHTML(headers, rows);
    generatePDFReport('Properties Report', tableHTML, 'properties-report.pdf');
  };

  const handleExportTenantsCSV = () => {
    exportTenantsToCSV(tenants, properties);
  };

  const handleExportTenantsPDF = () => {
    const getPropertyName = (propertyId) => {
      return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown';
    };

    const headers = ['Tenant Name', 'Property', 'Monthly Rent', 'Rent Status'];
    const rows = tenants.map(t => [
      t.name,
      getPropertyName(t.propertyId),
      `$${t.rentAmount.toLocaleString()}`,
      t.rentStatus,
    ]);
    const tableHTML = createTableHTML(headers, rows);
    generatePDFReport('Tenants Report', tableHTML, 'tenants-report.pdf');
  };

  const handleExportRevenueCSV = () => {
    exportRevenueReportToCSV(tenants, properties);
  };

  const handleExportRevenuePDF = () => {
    const totalRent = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const paidRent = tenants
      .filter(t => t.rentStatus === 'paid')
      .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const pendingRent = tenants
      .filter(t => t.rentStatus === 'pending')
      .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const overdueRent = tenants
      .filter(t => t.rentStatus === 'overdue')
      .reduce((sum, t) => sum + (t.rentAmount || 0), 0);

    const headers = ['Metric', 'Amount'];
    const rows = [
      ['Total Expected Rent', `$${totalRent.toLocaleString()}`],
      ['Paid', `$${paidRent.toLocaleString()}`],
      ['Pending', `$${pendingRent.toLocaleString()}`],
      ['Overdue', `$${overdueRent.toLocaleString()}`],
      ['Collection Rate', `${totalRent > 0 ? Math.round((paidRent / totalRent) * 100) : 0}%`],
    ];
    const tableHTML = createTableHTML(headers, rows);
    generatePDFReport('Revenue Report', tableHTML, 'revenue-report.pdf');
  };

  const handleExportMaintenanceCSV = () => {
    exportMaintenanceToCSV(maintenanceRequests, properties);
  };

  const handleExportMaintenancePDF = () => {
    const getPropertyName = (propertyId) => {
      return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown';
    };

    const headers = ['Description', 'Property', 'Status'];
    const rows = maintenanceRequests.map(r => [
      r.description,
      getPropertyName(r.propertyId),
      r.status,
    ]);
    const tableHTML = createTableHTML(headers, rows);
    generatePDFReport('Maintenance Report', tableHTML, 'maintenance-report.pdf');
  };

  const ReportCard = ({ title, description, onCSV, onPDF, icon: Icon, disabled }) => (
    <Card variant="elevated" className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            {title}
          </h3>
          <p className="text-sm mt-2" style={{ color: '#40484b' }}>
            {description}
          </p>
        </div>
        <Icon size={32} style={{ color: '#003441', opacity: 0.5 }} />
      </div>
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCSV}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-all duration-200"
          style={{
            background: disabled ? '#ccc' : 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <Download size={18} />
          CSV
        </button>
        <button
          onClick={onPDF}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-all duration-200"
          style={{
            background: disabled ? '#ccc' : 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <Download size={18} />
          PDF
        </button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Reports & Exports
        </h1>
        <p style={{ color: '#40484b' }}>Generate and download reports in CSV or PDF format</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCard
          title="Properties Report"
          description="Export all properties with their locations and occupancy status"
          onCSV={handleExportPropertiesCSV}
          onPDF={handleExportPropertiesPDF}
          icon={FileText}
          disabled={properties.length === 0}
        />

        <ReportCard
          title="Tenants Report"
          description="Export tenant information including rent amounts and payment status"
          onCSV={handleExportTenantsCSV}
          onPDF={handleExportTenantsPDF}
          icon={FileText}
          disabled={tenants.length === 0}
        />

        <ReportCard
          title="Revenue Report"
          description="Export financial summary including total rent, paid, pending, and overdue amounts"
          onCSV={handleExportRevenueCSV}
          onPDF={handleExportRevenuePDF}
          icon={FileText}
          disabled={tenants.length === 0}
        />

        <ReportCard
          title="Maintenance Report"
          description="Export maintenance requests with their status and assigned properties"
          onCSV={handleExportMaintenanceCSV}
          onPDF={handleExportMaintenancePDF}
          icon={FileText}
          disabled={maintenanceRequests.length === 0}
        />
      </div>

      {/* Info Card */}
      <Card variant="subtle" className="p-6">
        <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Export Information
        </h3>
        <ul className="space-y-2" style={{ color: '#40484b' }}>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span><strong>CSV Format:</strong> Compatible with Excel, Google Sheets, and other spreadsheet applications</span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span><strong>PDF Format:</strong> Professional formatted reports ready for printing or sharing</span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span><strong>Data Included:</strong> All current data in your Tenancy Slate account</span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441', fontWeight: 'bold' }}>•</span>
            <span><strong>Generated:</strong> Reports are generated on-demand with current data</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
