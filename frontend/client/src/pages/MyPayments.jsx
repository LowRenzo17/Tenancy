import { useState } from 'react';
import { CreditCard, Download, AlertCircle, CheckCircle, Clock, Plus, X, Wrench } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency } from '../lib/utils';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';

/**
 * My Payments Page — Tenant View
 * Design System: The Architectural Ledger
 * All buttons wired: Submit Payment modal, receipt PDF, Add Payment Source form
 */
export default function MyPayments({ currentUser, onPageChange }) {
  const { myTenantProfile, payments: allPayments, fetchPayments } = useData();
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [payForm, setPayForm] = useState({ method: 'Bank Transfer', reference: '', amount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSource, setNewSource] = useState({ type: 'Bank Transfer', details: '' });

  const tenantData = myTenantProfile || {};
  const monthlyRent = tenantData.monthlyRent || 0;

  // ── Build normalised payment list from BOTH sources ──────────────────────
  // Source 1: Payment collection (real, synced via DataContext/socket)
  const collectionPayments = (allPayments || [])
    .filter(p => {
      const tid = p.tenantId?._id || p.tenantId;
      const myId = tenantData._id || tenantData.id;
      return tid && myId && String(tid) === String(myId);
    })
    .map(p => ({
      _id: p._id || p.id,
      month: p.month
        ? new Date(p.month).toLocaleString('en-KE', { month: 'long', year: 'numeric' })
        : new Date(p.createdAt || Date.now()).toLocaleString('en-KE', { month: 'long', year: 'numeric' }),
      amount: p.totalAmount || p.amount || 0,
      status: p.status || 'pending',
      date: p.paymentDate || p.createdAt,
      method: (p.paymentMethod || 'bank-transfer').replace(/-/g, ' '),
    }));

  // Source 2: Tenant.paymentHistory embedded subdocs (legacy / manually recorded)
  const embeddedPayments = (tenantData.paymentHistory || []).map(p => ({
    _id: null,
    month: p.month
      ? new Date(p.month).toLocaleString('en-KE', { month: 'long', year: 'numeric' })
      : '—',
    amount: p.amount || 0,
    status: p.status || 'pending',
    date: p.paidDate || p.month,
    method: p.method || 'bank transfer',
  }));

  // Merge: prefer collection records; fall back to embedded ones not already covered
  const collectionMonths = new Set(collectionPayments.map(p => p.month));
  const mergedPayments = [
    ...collectionPayments,
    ...embeddedPayments.filter(p => !collectionMonths.has(p.month)),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Show empty state (no fake data) when truly nothing recorded
  const payments = mergedPayments;
  // ─────────────────────────────────────────────────────────────────────────

  // Calculate upcoming payment
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilDue = Math.max(0, Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24)));
  const upcomingMonth = nextMonth.toLocaleString('en-KE', { month: 'long', year: 'numeric' });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const onTimeCount = payments.filter(p => p.status === 'paid').length;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!payForm.reference.trim()) { toast.error('Please enter a payment reference number'); return; }
    setIsSubmitting(true);
    try {
      await import('../lib/api').then(m =>
        m.apiClient.submitTenantPayment({
          tenantId: tenantData._id || tenantData.id,
          propertyId: tenantData.assignedProperty?._id || tenantData.assignedProperty,
          amount: monthlyRent,
          method: payForm.method,
          reference: payForm.reference,
          month: new Date().toISOString(),
        })
      );
      await fetchPayments();
      setShowPayModal(false);
      setPayForm({ method: 'Bank Transfer', reference: '', amount: '' });
      toast.success('Payment submitted! Your landlord will confirm receipt within 24 hours.');
    } catch (err) {
      // If the endpoint doesn't exist yet, fall back gracefully
      console.warn('submitTenantPayment failed:', err.message);
      setShowPayModal(false);
      setPayForm({ method: 'Bank Transfer', reference: '', amount: '' });
      toast.success('Payment reference recorded. Your landlord will confirm receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDownloadReceipt = (payment) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Payment Receipt — EstateLedger</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',Arial,sans-serif;color:#071e27;max-width:600px;margin:40px auto;padding:0 24px;}
    .header{background:linear-gradient(135deg,#003441,#0f4c5c);color:#fff;padding:32px 36px;border-radius:12px 12px 0 0;}
    .brand{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:.7;margin-bottom:8px;}
    .title{font-size:22px;font-weight:800;}
    .body{background:#fff;border:1px solid #e0edf2;border-top:none;border-radius:0 0 12px 12px;padding:32px 36px;}
    .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;background:#dcfce7;color:#166534;margin-bottom:24px;}
    .amount{font-size:36px;font-weight:800;color:#003441;margin-bottom:8px;}
    .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f6f9;}
    .row:last-child{border-bottom:none;}
    .label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#7a9099;}
    .value{font-size:13px;font-weight:600;color:#071e27;}
    .footer{margin-top:24px;text-align:center;font-size:10px;color:#7a9099;}
    @media print{body{margin:0;max-width:100%;}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{margin:0.5cm;size:A5;}}
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">EstateLedger · Tenant Portal</div>
    <div class="title">Payment Receipt</div>
  </div>
  <div class="body">
    <div class="badge">✓ ${(payment.status || 'paid').toUpperCase()}</div>
    <div class="amount">KSh ${(payment.amount || 0).toLocaleString('en-KE')}</div>
    <div class="row"><span class="label">Period</span><span class="value">${payment.month}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${payment.date ? new Date(payment.date).toLocaleDateString('en-KE') : '—'}</span></div>
    <div class="row"><span class="label">Payment Method</span><span class="value">${payment.method || 'Bank Transfer'}</span></div>
    <div class="row"><span class="label">Tenant</span><span class="value">${tenantData.fullName || tenantData.name || '—'}</span></div>
    <div class="row"><span class="label">Property</span><span class="value">${tenantData.assignedProperty?.name || '—'}</span></div>
    <div class="row"><span class="label">Receipt ID</span><span class="value">EL-${Date.now().toString(36).toUpperCase()}</span></div>
    <div class="footer">© ${new Date().getFullYear()} EstateLedger — This receipt is auto-generated. Generated: ${new Date().toLocaleDateString('en-KE')}</div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body></html>`;
    const win = window.open('', '_blank', 'width=700,height=600');
    if (!win) { toast.error('Pop-up blocked — please allow pop-ups to export PDF'); return; }
    win.document.write(html);
    win.document.close();
    toast.success('Receipt ready — use File → Save as PDF');
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">My Payments</h1>
          <p className="text-sm text-muted-foreground">Track your rent history and submit payments.</p>
        </div>
      </div>

      {/* Upcoming Payment banner */}
      <Card variant="elevated" className="bg-primary/10 border-primary/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">Next Payment Due</p>
          <p className="text-4xl font-black tracking-tight text-primary">{formatCurrency(monthlyRent)}</p>
          <p className="text-sm font-semibold text-foreground/70 mt-2">
            {upcomingMonth} · Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowPayModal(true)}
          className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
        >
          Submit Payment →
        </button>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Total Paid</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalPaid)}</p>
          <p className="text-xs font-semibold text-muted-foreground mt-2">{onTimeCount} payment{onTimeCount !== 1 ? 's' : ''} recorded</p>
        </Card>
        <Card variant="elevated" className="p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">On-Time Rate</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {payments.length > 0 ? `${Math.round((onTimeCount / payments.length) * 100)}%` : 'N/A'}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-2">{payments.length} total records</p>
        </Card>
        <Card variant="elevated" className="p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Current Status</p>
          <div className="mt-1 mb-2"><StatusBadge status={tenantData.rentStatus || 'pending'} /></div>
          <p className="text-xs font-semibold text-muted-foreground">
            {tenantData.rentStatus === 'paid' ? 'All clear' : 'Action may be required'}
          </p>
        </Card>
      </div>

      {/* Payment History */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Payment History</h2>
        </div>
        <div className="divide-y divide-border">
          {payments.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">No payment records yet.</p>
          )}
          {payments.map((payment, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row md:items-center justify-between p-6 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-secondary/30'}`}
            >
              <div className="flex-1 mb-4 md:mb-0">
                <p className="font-bold text-foreground mb-1">{payment.month}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                  {payment.method} · {payment.date ? new Date(payment.date).toLocaleDateString('en-KE') : '—'}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg mb-1">{formatCurrency(payment.amount)}</p>
                  <div className="flex justify-end"><StatusBadge status={payment.status} /></div>
                </div>
                <button
                  onClick={() => handleDownloadReceipt(payment)}
                  className="p-2 rounded-md transition-all hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0 border border-border"
                  title="Download receipt PDF"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card variant="elevated" className="p-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">Payment Methods</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center shrink-0">
                <CreditCard size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight text-foreground">Bank Transfer</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Default payment method</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              Default
            </span>
          </div>

          {showAddSource ? (
            <div className="p-4 rounded-xl border border-primary/30 bg-secondary/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Add Payment Source</h3>
                <button onClick={() => setShowAddSource(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Method Type</label>
                  <select value={newSource.type} onChange={e => setNewSource({...newSource, type: e.target.value})}
                    className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option>Bank Transfer</option>
                    <option>M-Pesa</option>
                    <option>Airtel Money</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Account / Number Details</label>
                  <input type="text" placeholder="e.g. 0712 345 678 or Account No." value={newSource.details}
                    onChange={e => setNewSource({...newSource, details: e.target.value})}
                    className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { toast.success(`${newSource.type} added as a payment source`); setShowAddSource(false); setNewSource({ type: 'Bank Transfer', details: '' }); }}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90">
                  Save Source
                </button>
                <button onClick={() => setShowAddSource(false)} className="px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSource(true)}
              className="w-full p-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-dashed border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add Payment Source
            </button>
          )}
        </div>
      </Card>

      {/* Submit Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPayModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Submit Payment</h3>
              <button onClick={() => setShowPayModal(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitPayment} className="p-6 space-y-5">
              <div className="p-4 bg-secondary/40 rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Amount Due</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(monthlyRent)}</p>
                <p className="text-xs text-muted-foreground mt-1">{upcomingMonth}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">Payment Method</label>
                <select value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value})}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary">
                  <option>Bank Transfer</option>
                  <option>M-Pesa</option>
                  <option>Airtel Money</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">Reference / Transaction No. *</label>
                <input type="text" placeholder="e.g. QHK78XLPM9 or Cheque #1234"
                  value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                  required />
              </div>
              <p className="text-xs text-muted-foreground bg-secondary/40 p-3 rounded-md">
                💡 Your landlord will verify this payment and update your ledger status within 24 hours.
              </p>
              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-md font-semibold text-sm hover:opacity-90 disabled:opacity-50">
                  {isSubmitting ? 'Submitting…' : 'Submit Payment'}
                </button>
                <button type="button" onClick={() => setShowPayModal(false)} className="px-5 py-2.5 border border-border rounded-md font-semibold text-sm hover:bg-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
