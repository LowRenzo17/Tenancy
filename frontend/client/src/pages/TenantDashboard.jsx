import { FileText, Download, Banknote, AlertCircle, CheckCircle, Clock, Wrench, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';

/**
 * Tenant Dashboard Page — The Architectural Ledger
 * Quick Actions all wired to onPageChange or PDF print
 */
export default function TenantDashboard({ currentUser, onPageChange }) {
  const { myTenantProfile, myTenantProfileLoading } = useData();

  if (myTenantProfileLoading) {
    return (
      <div className="flex justify-center items-center h-64 p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <p className="text-muted-foreground">Loading your information...</p>
      </div>
    );
  }

  if (!myTenantProfile) {
    return (
      <div className="flex flex-col justify-center items-center h-64 p-8 max-w-lg mx-auto text-center">
        <AlertCircle size={48} className="mb-4 text-destructive" />
        <h2 className="text-xl font-bold mb-2 text-primary">No Lease Associated</h2>
        <p className="text-muted-foreground">
          Your account is active, but a property manager hasn't assigned you a lease yet. Please contact your property manager to finalise onboarding.
        </p>
      </div>
    );
  }

  const tenantData = myTenantProfile;
  const propertyName = tenantData.assignedProperty?.name || 'Unknown Property';
  const displayLocation = `${propertyName}${tenantData.unitNumber ? ` (Unit ${tenantData.unitNumber})` : ''}`;

  const calculateLeaseTerm = () => {
    if (!tenantData.leaseStartDate || !tenantData.leaseEndDate) return 'N/A';
    const start = new Date(tenantData.leaseStartDate);
    const end = new Date(tenantData.leaseEndDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months > 0 ? `${months} months` : 'N/A';
  };
  const leaseTerm = calculateLeaseTerm();
  const monthlyRent = tenantData.monthlyRent || 0;
  const nextDueDate = tenantData.rentDueDate
    ? new Date(tenantData.rentDueDate)
    : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  const daysUntilDue = Math.max(0, Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24)));

  const handleDownloadLeasePDF = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Lease Summary</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    body{font-family:'Inter',Arial,sans-serif;margin:0;color:#071e27;}
    .cover{background:linear-gradient(135deg,#003441,#0f4c5c);color:#fff;padding:40px 48px 32px;}
    .cover-brand{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:.7;margin-bottom:8px;}
    .cover-title{font-size:28px;font-weight:800;}
    .cover-sub{font-size:13px;opacity:.7;margin-top:4px;}
    .body{padding:32px 48px 48px;}
    .row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #e0edf2;}
    .label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#40484b;margin-bottom:4px;}
    .value{font-size:14px;font-weight:700;color:#003441;}
    .footer{margin-top:40px;padding-top:12px;border-top:1px solid #d5ecf8;font-size:10px;color:#7a9099;display:flex;justify-content:space-between;}
    @media print{@page{margin:0;size:A4;}.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-brand">EstateLedger · Tenant Portal</div>
    <div class="cover-title">Lease Summary</div>
    <div class="cover-sub">Resident: ${tenantData.fullName || tenantData.name || 'Tenant'}</div>
  </div>
  <div class="body">
    <div class="row"><div><div class="label">Property</div><div class="value">${propertyName}</div></div></div>
    <div class="row"><div><div class="label">Unit</div><div class="value">${tenantData.unitNumber || '—'}</div></div></div>
    <div class="row"><div><div class="label">Lease Start</div><div class="value">${tenantData.leaseStartDate ? new Date(tenantData.leaseStartDate).toLocaleDateString('en-KE') : 'N/A'}</div></div></div>
    <div class="row"><div><div class="label">Lease End</div><div class="value">${tenantData.leaseEndDate ? new Date(tenantData.leaseEndDate).toLocaleDateString('en-KE') : 'N/A'}</div></div></div>
    <div class="row"><div><div class="label">Term Length</div><div class="value">${leaseTerm}</div></div></div>
    <div class="row"><div><div class="label">Monthly Rent</div><div class="value">KSh ${monthlyRent.toLocaleString('en-KE')}</div></div></div>
    <div class="row"><div><div class="label">Payment Status</div><div class="value">${(tenantData.rentStatus || 'pending').toUpperCase()}</div></div></div>
    <div class="footer">
      <span>© ${new Date().getFullYear()} EstateLedger — Premium Property Management</span>
      <span>Generated: ${new Date().toLocaleDateString('en-KE')}</span>
    </div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body></html>`;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { toast.error('Pop-up blocked — please allow pop-ups to export PDF'); return; }
    win.document.write(html);
    win.document.close();
    toast.success('Lease summary PDF ready — use File → Save as PDF');
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Welcome, {tenantData.fullName || tenantData.name || 'Resident'}
          </h1>
          <p className="text-sm text-muted-foreground">{displayLocation} — Manage your lease and payments.</p>
        </div>
        <div className="text-sm font-semibold text-primary">
          {new Date().toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Monthly Rent</p>
            <div className="p-2 rounded-md bg-secondary text-primary"><Banknote size={18} /></div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(monthlyRent)}</p>
            <p className="text-xs mt-2 text-muted-foreground font-medium">Due on the 1st of each month</p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Next Payment Due</p>
            <div className="p-2 rounded-md bg-secondary text-primary"><Clock size={18} /></div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{daysUntilDue} days</p>
            <p className="text-xs mt-2 text-muted-foreground font-medium">
              {nextDueDate.toLocaleDateString('en-KE')}
            </p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Ledger Status</p>
            <div className={`p-2 rounded-md bg-secondary ${tenantData.rentStatus === 'paid' ? 'text-green-600' : 'text-destructive'}`}>
              {tenantData.rentStatus === 'paid' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            </div>
          </div>
          <div>
            <div className="mb-2"><StatusBadge status={tenantData.rentStatus || 'pending'} /></div>
            <p className="text-xs text-muted-foreground font-medium">
              {tenantData.rentStatus === 'paid' ? 'All payments settled' : 'Action required'}
            </p>
          </div>
        </Card>
      </div>

      {/* Lease Details */}
      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="p-6 border-b border-border bg-secondary/20">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Lease Agreement Details</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            ['Estate', propertyName || 'Not assigned'],
            ['Unit', tenantData.unitNumber || '—'],
            ['Term Start', tenantData.leaseStartDate ? new Date(tenantData.leaseStartDate).toLocaleDateString('en-KE') : 'N/A'],
            ['Term End', tenantData.leaseEndDate ? new Date(tenantData.leaseEndDate).toLocaleDateString('en-KE') : 'N/A'],
          ].map(([label, value]) => (
            <div key={label} className="p-6 flex justify-between items-center hover:bg-secondary/10 transition-colors">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <p className="font-semibold text-foreground">{value}</p>
              </div>
            </div>
          ))}
          <div className="p-6 flex justify-between items-center bg-primary/5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Lease Term</p>
              <p className="font-semibold text-primary">{leaseTerm}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onPageChange?.('myLease')}
          className="p-4 rounded-lg font-semibold transition-all bg-secondary text-foreground border border-border hover:border-primary hover:bg-secondary/50 flex items-center justify-center gap-2 text-sm"
        >
          <FileText size={16} /> View Full Lease
        </button>
        <button
          onClick={handleDownloadLeasePDF}
          className="p-4 rounded-lg font-semibold transition-all bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2 text-sm"
        >
          <Download size={16} /> Download PDF
        </button>
        <button
          onClick={() => onPageChange?.('myPayments')}
          className="p-4 rounded-lg font-semibold transition-all bg-secondary text-foreground border border-border hover:border-primary hover:bg-secondary/50 flex items-center justify-center gap-2 text-sm"
        >
          <Banknote size={16} /> My Payments
        </button>
        <button
          onClick={() => onPageChange?.('submitMaintenance')}
          className="p-4 rounded-lg font-semibold transition-all bg-secondary text-foreground border border-border hover:border-primary hover:bg-secondary/50 flex items-center justify-center gap-2 text-sm"
        >
          <Wrench size={16} /> Report Issue
        </button>
      </div>
    </div>
  );
}
