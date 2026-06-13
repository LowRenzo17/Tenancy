import { useState } from 'react';
import { FileText, Download, Eye, X, MessageCircle } from 'lucide-react';
import Card from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';

/**
 * My Lease Page — Tenant View
 * Design System: The Architectural Ledger
 * Eye = inline preview modal, Download = branded PDF print, Contact = navigate to chat
 */
export default function MyLease({ currentUser, onPageChange }) {
  const { myTenantProfile } = useData();
  const [showPreview, setShowPreview] = useState(false);
  const tenantData = myTenantProfile || {};

  const propertyName = tenantData.assignedProperty?.name || 'N/A';
  const leaseTerms = {
    startDate: tenantData.leaseStartDate ? new Date(tenantData.leaseStartDate).toLocaleDateString('en-KE') : 'N/A',
    endDate: tenantData.leaseEndDate ? new Date(tenantData.leaseEndDate).toLocaleDateString('en-KE') : 'N/A',
    monthlyRent: tenantData.monthlyRent || 0,
    securityDeposit: tenantData.securityDeposit || 0,
    renewalOption: 'Automatic renewal with 30-day written notice',
    lateFeesPolicy: '5% of monthly rent after 5-day grace period',
    maintenanceResponsibility: 'Landlord covers major repairs; tenant handles minor day-to-day maintenance',
    petPolicy: 'No pets allowed without prior written consent',
    utilities: 'Tenant responsible for electricity, water, and internet',
  };

  // Calculate lease duration
  const leaseDuration = (() => {
    if (!tenantData.leaseStartDate || !tenantData.leaseEndDate) return 'N/A';
    const months = Math.round((new Date(tenantData.leaseEndDate) - new Date(tenantData.leaseStartDate)) / (1000 * 60 * 60 * 24 * 30));
    return `${months} month${months !== 1 ? 's' : ''}`;
  })();

  const handleDownloadPDF = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Lease Agreement — EstateLedger</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',Arial,sans-serif;color:#071e27;font-size:12px;}
    .cover{background:linear-gradient(135deg,#003441,#0f4c5c);color:#fff;padding:40px 48px 32px;display:flex;justify-content:space-between;align-items:flex-end;}
    .cover-left .brand{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:.7;margin-bottom:8px;}
    .cover-left .title{font-size:26px;font-weight:800;}
    .cover-left .sub{font-size:13px;opacity:.7;margin-top:4px;}
    .cover-right{text-align:right;font-size:10px;opacity:.65;line-height:1.8;}
    .body{padding:32px 48px 48px;}
    .section-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#40484b;margin:24px 0 12px;padding-bottom:6px;border-bottom:1px solid #e0edf2;}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
    .field .label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#7a9099;margin-bottom:3px;}
    .field .value{font-size:13px;font-weight:700;color:#003441;}
    .clause{padding:10px 0;border-bottom:1px solid #f0f6f9;}
    .clause .clause-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#7a9099;margin-bottom:3px;}
    .clause .clause-text{font-size:12px;color:#071e27;line-height:1.6;}
    .footer{margin-top:40px;padding-top:14px;border-top:1px solid #d5ecf8;display:flex;justify-content:space-between;font-size:9.5px;color:#7a9099;}
    @media print{body{background:#fff;}@page{margin:0;size:A4;}.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-left">
      <div class="brand">EstateLedger · Tenant Portal</div>
      <div class="title">Lease Agreement</div>
      <div class="sub">${propertyName} ${tenantData.unitNumber ? `— Unit ${tenantData.unitNumber}` : ''}</div>
    </div>
    <div class="cover-right">
      Generated: ${new Date().toLocaleDateString('en-KE')}<br/>Confidential
    </div>
  </div>
  <div class="body">
    <div class="section-title">Party Information</div>
    <div class="grid-2">
      <div class="field"><div class="label">Tenant Name</div><div class="value">${tenantData.fullName || tenantData.name || 'N/A'}</div></div>
      <div class="field"><div class="label">Property</div><div class="value">${propertyName}</div></div>
      <div class="field"><div class="label">Unit Number</div><div class="value">${tenantData.unitNumber || '—'}</div></div>
      <div class="field"><div class="label">Email</div><div class="value">${tenantData.email || '—'}</div></div>
    </div>
    <div class="section-title">Financial Terms</div>
    <div class="grid-2">
      <div class="field"><div class="label">Monthly Rent</div><div class="value">KSh ${leaseTerms.monthlyRent.toLocaleString('en-KE')}</div></div>
      <div class="field"><div class="label">Security Deposit</div><div class="value">KSh ${leaseTerms.securityDeposit.toLocaleString('en-KE')}</div></div>
      <div class="field"><div class="label">Lease Start</div><div class="value">${leaseTerms.startDate}</div></div>
      <div class="field"><div class="label">Lease End</div><div class="value">${leaseTerms.endDate}</div></div>
      <div class="field"><div class="label">Lease Duration</div><div class="value">${leaseDuration}</div></div>
      <div class="field"><div class="label">Status</div><div class="value">${(tenantData.rentStatus || 'pending').toUpperCase()}</div></div>
    </div>
    <div class="section-title">Standard Clauses</div>
    <div class="clause"><div class="clause-label">Renewal Option</div><div class="clause-text">${leaseTerms.renewalOption}</div></div>
    <div class="clause"><div class="clause-label">Late Fees</div><div class="clause-text">${leaseTerms.lateFeesPolicy}</div></div>
    <div class="clause"><div class="clause-label">Maintenance</div><div class="clause-text">${leaseTerms.maintenanceResponsibility}</div></div>
    <div class="clause"><div class="clause-label">Pet Policy</div><div class="clause-text">${leaseTerms.petPolicy}</div></div>
    <div class="clause"><div class="clause-label">Utilities</div><div class="clause-text">${leaseTerms.utilities}</div></div>
    <div class="footer">
      <span>© ${new Date().getFullYear()} EstateLedger — Premium Property Management Platform</span>
      <span>Doc ID: EL-LEASE-${Date.now().toString(36).toUpperCase()}</span>
    </div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body></html>`;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { toast.error('Pop-up blocked — please allow pop-ups to export PDF'); return; }
    win.document.write(html);
    win.document.close();
    toast.success('Lease PDF ready — use File → Save as PDF to save');
  };

  const CLAUSES = [
    ['Renewal Option', leaseTerms.renewalOption],
    ['Late Fees Policy', leaseTerms.lateFeesPolicy],
    ['Maintenance', leaseTerms.maintenanceResponsibility],
    ['Pet Policy', leaseTerms.petPolicy],
    ['Utilities', leaseTerms.utilities],
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">My Lease</h1>
          <p className="text-sm text-muted-foreground">Review your lease terms and download a copy.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Lease document card */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary"><FileText size={20} /></div>
            <div>
              <h2 className="font-bold text-foreground text-lg tracking-tight">Lease Agreement</h2>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                {leaseTerms.startDate} — {leaseTerms.endDate} · {leaseDuration}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 rounded-md transition-all hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Preview lease"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2 rounded-md transition-all hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Download lease PDF"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Property: {propertyName}{tenantData.unitNumber ? ` · Unit ${tenantData.unitNumber}` : ''}
        </p>
      </Card>

      {/* Financial Terms */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Lease Terms</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Start Date</p>
              <p className="font-bold text-foreground">{leaseTerms.startDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">End Date</p>
              <p className="font-bold text-foreground">{leaseTerms.endDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Monthly Rent</p>
              <p className="font-bold text-foreground text-lg">{formatCurrency(leaseTerms.monthlyRent)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Security Deposit</p>
              <p className="font-bold text-foreground text-lg">{formatCurrency(leaseTerms.securityDeposit)}</p>
            </div>
          </div>
          <div className="space-y-4">
            {CLAUSES.map(([label, value]) => (
              <div key={label} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 pb-4 border-b border-border last:border-0 last:pb-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:w-1/3 shrink-0">{label}</p>
                <p className="text-sm font-medium text-foreground md:w-2/3">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Contact Property Manager */}
      <Card variant="subtle" className="p-6 border-l-4 border-l-primary bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground mb-1">Questions about your lease?</h3>
          <p className="text-xs text-muted-foreground font-medium">Contact your property manager for clarifications or to request a lease modification.</p>
        </div>
        <button
          onClick={() => { onPageChange?.('chat'); toast.success('Opening chat with your property manager'); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
        >
          <MessageCircle size={16} /> Contact Property Manager
        </button>
      </Card>

      {/* Inline Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><FileText size={18} className="text-primary" /> Lease Preview</h3>
              <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Party info */}
              <div className="grid grid-cols-2 gap-4">
                {[['Tenant', tenantData.fullName || tenantData.name], ['Property', propertyName], ['Unit', tenantData.unitNumber || '—'], ['Lease Period', `${leaseTerms.startDate} → ${leaseTerms.endDate}`]].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">{l}</p>
                    <p className="font-semibold text-sm text-foreground">{v}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Monthly Rent</p><p className="font-bold text-primary">{formatCurrency(leaseTerms.monthlyRent)}</p></div>
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Deposit</p><p className="font-bold text-foreground">{formatCurrency(leaseTerms.securityDeposit)}</p></div>
              </div>
              {CLAUSES.map(([l, v]) => (
                <div key={l} className="border-t border-border pt-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">{l}</p>
                  <p className="text-sm text-foreground">{v}</p>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-secondary">Close</button>
              <button onClick={() => { setShowPreview(false); handleDownloadPDF(); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90">
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
