import { FileText, Download, BarChart2, Users, Wrench, Building2 } from 'lucide-react';
import Card from '../components/Card';
import { toast } from 'sonner';
import {
  exportPropertiesToCSV,
  exportTenantsToCSV,
  exportRevenueReportToCSV,
  exportMaintenanceToCSV,
  exportPropertiesToPDF,
  exportTenantsToPDF,
  exportRevenueToPDF,
  exportMaintenanceToPDF,
} from '../lib/exportUtils';

/**
 * Reports Page
 * Design System: The Architectural Ledger
 * - Professional CSV (BOM, metadata headers) and PDF (branded print window) exports
 */
export default function Reports({ properties, tenants, maintenanceRequests }) {
  const wrap = (fn, label) => {
    try {
      fn();
      toast.success(`${label} export ready`);
    } catch (e) {
      toast.error(`Failed to export ${label}`);
    }
  };

  const reports = [
    {
      title: 'Properties Report',
      description: 'All units with type, location, rent and occupancy status.',
      icon: Building2,
      count: properties.length,
      countLabel: 'units',
      disabled: properties.length === 0,
      onCSV: () => wrap(() => exportPropertiesToCSV(properties), 'Properties CSV'),
      onPDF: () => wrap(() => exportPropertiesToPDF(properties), 'Properties PDF'),
    },
    {
      title: 'Tenant Directory',
      description: 'Active residents with contact info, lease dates and payment status.',
      icon: Users,
      count: tenants.length,
      countLabel: 'tenants',
      disabled: tenants.length === 0,
      onCSV: () => wrap(() => exportTenantsToCSV(tenants, properties), 'Tenants CSV'),
      onPDF: () => wrap(() => exportTenantsToPDF(tenants, properties), 'Tenants PDF'),
    },
    {
      title: 'Revenue & Collections',
      description: 'Financial summary — expected, collected, pending and overdue rent.',
      icon: BarChart2,
      count: (() => {
        const total = tenants.reduce((s, t) => s + (t.rentAmount || 0), 0);
        const paid = tenants.filter((t) => t.rentStatus === 'paid').reduce((s, t) => s + (t.rentAmount || 0), 0);
        return total > 0 ? `${Math.round((paid / total) * 100)}%` : '0%';
      })(),
      countLabel: 'collected',
      disabled: tenants.length === 0,
      onCSV: () => wrap(() => exportRevenueReportToCSV(tenants, properties), 'Revenue CSV'),
      onPDF: () => wrap(() => exportRevenueToPDF(tenants, properties), 'Revenue PDF'),
    },
    {
      title: 'Maintenance Log',
      description: 'All service tickets with priority, category and resolution status.',
      icon: Wrench,
      count: maintenanceRequests.length,
      countLabel: 'tickets',
      disabled: maintenanceRequests.length === 0,
      onCSV: () => wrap(() => exportMaintenanceToCSV(maintenanceRequests, properties), 'Maintenance CSV'),
      onPDF: () => wrap(() => exportMaintenanceToPDF(maintenanceRequests, properties), 'Maintenance PDF'),
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Reports &amp; Exports
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate professionally formatted reports in CSV or PDF format.
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card
            key={report.title}
            variant="elevated"
            className="p-6 flex flex-col bg-white hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <report.icon size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground mb-1">
                    {report.title}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-2xl font-black text-foreground">{report.count}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {report.countLabel}
                </p>
              </div>
            </div>

            {/* Disabled notice */}
            {report.disabled && (
              <p className="text-xs text-muted-foreground italic mb-4 bg-secondary/40 px-3 py-2 rounded-md">
                No data available yet — add records to enable this report.
              </p>
            )}

            {/* Export buttons */}
            <div className="flex gap-3 pt-4 border-t border-border mt-auto">
              <button
                onClick={report.onCSV}
                disabled={report.disabled}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border-2 ${
                  report.disabled
                    ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
                    : 'border-border text-foreground hover:bg-secondary/60 hover:border-primary/30'
                }`}
              >
                <Download size={14} />
                Export CSV
              </button>
              <button
                onClick={report.onPDF}
                disabled={report.disabled}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm ${
                  report.disabled
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                <FileText size={14} />
                Export PDF
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Info card */}
      <Card variant="subtle" className="p-6 bg-secondary/30 border-l-4 border-l-primary">
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
          About These Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <Download size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground mb-1">CSV Format</p>
              <p>UTF-8 encoded with metadata headers. Opens correctly in Excel, Google Sheets, and all spreadsheet tools.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <FileText size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground mb-1">PDF Format</p>
              <p>Opens a branded print preview. Use <strong>File → Print → Save as PDF</strong> in your browser to save the file.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
