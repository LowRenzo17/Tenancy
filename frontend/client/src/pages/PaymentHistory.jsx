import { useState } from 'react';
import { CreditCard, Download, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency } from '../lib/utils';
import { useData } from '../contexts/DataContext';
import apiClient from '../lib/api';
import { toast } from 'sonner';

/**
 * Payment History Page — Owner View
 * Design System: The Architectural Ledger
 * - Real payment data from DataContext (Payment collection)
 * - Owner can Confirm (→ paid) or Reject (→ overdue) pending submissions
 */
export default function PaymentHistory({ tenants, properties }) {
  const { payments: allPayments, updatePayment, fetchPayments } = useData();
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);

  // ── Filtered tenant list ───────────────────────────────────────────────────
  const filteredTenants = tenants.filter(t =>
    (t.name || t.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTenantData = selectedTenantId
    ? tenants.find(t => (t.id || t._id) === selectedTenantId)
    : null;

  const selectedProperty = selectedTenantData
    ? properties.find(p =>
        (p._id || p.id)?.toString() === selectedTenantData.propertyId?.toString() ||
        (p._id || p.id)?.toString() === selectedTenantData.assignedProperty?.toString()
      )
    : null;

  // ── Real payments from DataContext filtered for selected tenant ────────────
  const tenantPayments = selectedTenantId
    ? (allPayments || [])
        .filter(p => {
          const tid = (p.tenantId?._id || p.tenantId)?.toString();
          return tid === selectedTenantId?.toString();
        })
        .map(p => ({
          _id: p._id,
          date: p.paymentDate ? new Date(p.paymentDate) : new Date(p.createdAt || p.month),
          dueDate: p.dueDate ? new Date(p.dueDate) : new Date(p.month),
          amount: p.totalAmount || p.amount || 0,
          status: p.status || 'pending',
          method: (p.paymentMethod || '').replace(/-/g, ' '),
          reference: p.transactionId || null,
          notes: p.notes || null,
        }))
        .sort((a, b) => b.date - a.date)
    : [];

  // Apply status filter
  const filteredHistory = filterStatus === 'all'
    ? tenantPayments
    : tenantPayments.filter(p => p.status === filterStatus);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalPaid     = tenantPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending  = tenantPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const paymentRate   = tenantPayments.length > 0
    ? Math.round((tenantPayments.filter(p => p.status === 'paid').length / tenantPayments.length) * 100)
    : 0;
  const pendingCount  = tenantPayments.filter(p => p.status === 'pending').length;

  // ── Confirm payment ───────────────────────────────────────────────────────
  const handleConfirm = async (payment) => {
    setConfirmingId(payment._id + '_confirm');
    try {
      await apiClient.updatePayment(payment._id, {
        status: 'paid',
        paymentDate: new Date().toISOString(),
      });
      await fetchPayments();
      toast.success('Payment confirmed — tenant ledger updated to Paid ✓');
    } catch (err) {
      console.error(err);
      toast.error('Failed to confirm payment');
    } finally {
      setConfirmingId(null);
    }
  };

  // ── Reject payment ────────────────────────────────────────────────────────
  const handleReject = async (payment) => {
    setConfirmingId(payment._id + '_reject');
    try {
      await apiClient.updatePayment(payment._id, {
        status: 'overdue',
        notes: (payment.notes || '') + ' [Rejected by owner]',
      });
      await fetchPayments();
      toast.warning('Payment rejected — marked as Overdue');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject payment');
    } finally {
      setConfirmingId(null);
    }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    if (!selectedTenantData || tenantPayments.length === 0) {
      toast.error('No payment records to export');
      return;
    }
    const BOM = '\uFEFF';
    const escapeCSV = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const fmt = (n) => `KSh ${Number(n || 0).toLocaleString('en-KE')}`;
    const todayStr = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });

    const metaRows = [
      ['EstateLedger — Payment History Report'],
      [`Generated: ${todayStr}`],
      [`Tenant: ${selectedTenantData.name || selectedTenantData.fullName}`],
      [`Property: ${selectedProperty?.name || 'N/A'}`],
      [`Monthly Rent: ${fmt(selectedTenantData.rentAmount)}`],
      [`Total Records: ${tenantPayments.length}`],
      [`On-time Rate: ${paymentRate}%  |  Confirmed Collected: ${fmt(totalPaid)}`],
      [],
      ['Date', 'Due Date', 'Amount (KSh)', 'Status', 'Method', 'Reference / Notes'],
    ];

    const dataRows = tenantPayments.map(p => [
      p.date.toLocaleDateString('en-KE'),
      p.dueDate.toLocaleDateString('en-KE'),
      p.amount,
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
      p.method || '—',
      p.reference || p.notes || '—',
    ]);

    const content = BOM + [...metaRows, ...dataRows]
      .map(row => row.map(escapeCSV).join(','))
      .join('\r\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EL-Payments-${(selectedTenantData.name || 'Tenant').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Payment History</h1>
          <p className="text-sm text-muted-foreground">
            Review tenant payment submissions and confirm or reject them.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-semibold text-amber-700">
            <Clock size={15} />
            {pendingCount} payment{pendingCount !== 1 ? 's' : ''} awaiting confirmation
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Sidebar */}
        <div>
          <Card variant="elevated" className="p-6 bg-white overflow-hidden flex flex-col h-[520px]">
            <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Select Tenant</h3>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {filteredTenants.length > 0 ? (
                filteredTenants.map(tenant => {
                  const tid = tenant.id || tenant._id;
                  const isSelected = selectedTenantId === tid;
                  const tenantPendingCount = (allPayments || []).filter(p => {
                    const pid = (p.tenantId?._id || p.tenantId)?.toString();
                    return pid === tid?.toString() && p.status === 'pending';
                  }).length;
                  return (
                    <button
                      key={tid}
                      onClick={() => setSelectedTenantId(tid)}
                      className={`w-full text-left p-3 rounded-lg transition-all border-l-4 ${
                        isSelected
                          ? 'bg-primary/5 border-l-primary text-primary'
                          : 'bg-transparent border-l-transparent text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`font-bold text-sm tracking-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {tenant.name || tenant.fullName}
                        </p>
                        {tenantPendingCount > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            <Clock size={9} /> {tenantPendingCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold mt-0.5 ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>
                        {formatCurrency(tenant.rentAmount)}/month
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No tenants found</p>
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
                <Card variant="elevated" className="p-5 bg-white border-b-4 border-b-emerald-600">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Confirmed Paid</p>
                  <p className="text-2xl font-black tracking-tight text-emerald-800">{formatCurrency(totalPaid)}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1.5">
                    {tenantPayments.filter(p => p.status === 'paid').length} confirmed
                  </p>
                </Card>
                <Card variant="elevated" className="p-5 bg-white border-b-4 border-b-amber-500">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Pending Approval</p>
                  <p className="text-2xl font-black tracking-tight text-amber-700">{formatCurrency(totalPending)}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1.5">
                    {pendingCount} awaiting your confirmation
                  </p>
                </Card>
                <Card variant="elevated" className="p-5 bg-primary/5 border-b-4 border-b-primary">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary/80 mb-2">Confirmation Rate</p>
                  <p className="text-2xl font-black tracking-tight text-primary">{paymentRate}%</p>
                  <p className="text-xs font-semibold text-primary/70 mt-1.5">Of {tenantPayments.length} total records</p>
                </Card>
              </div>

              {/* Tenant Info Bar */}
              <Card variant="elevated" className="p-5 bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    {selectedTenantData.name || selectedTenantData.fullName}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">
                    {selectedProperty?.name || 'Unknown Property'}
                    {selectedTenantData.unitNumber ? ` — Unit ${selectedTenantData.unitNumber}` : ''}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1.5">
                    Monthly Rent <span className="text-foreground ml-2">{formatCurrency(selectedTenantData.rentAmount)}</span>
                  </p>
                </div>
                <button
                  onClick={downloadCSV}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-white border border-border rounded-lg text-sm font-bold hover:bg-secondary/50 transition-colors shadow-sm whitespace-nowrap"
                >
                  <Download size={15} /> Export CSV
                </button>
              </Card>

              {/* Status filter */}
              <div className="flex gap-1.5 p-1 bg-secondary/50 rounded-lg w-fit">
                {['all', 'pending', 'paid', 'overdue'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-5 py-1.5 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest ${
                      filterStatus === s
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-white/50'
                    }`}
                  >
                    {s}
                    {s === 'pending' && pendingCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[9px]">{pendingCount}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Payment Table */}
              <Card variant="elevated" className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/40 border-b border-border">
                      <tr>
                        <th className="py-4 px-5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date</th>
                        <th className="py-4 px-5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-right">Amount</th>
                        <th className="py-4 px-5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Status</th>
                        <th className="py-4 px-5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hidden md:table-cell">Method / Ref</th>
                        <th className="py-4 px-5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredHistory.length > 0 ? (
                        filteredHistory.map((payment, idx) => (
                          <tr
                            key={payment._id || idx}
                            className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/10'} hover:bg-secondary/30 ${payment.status === 'pending' ? 'ring-1 ring-inset ring-amber-200' : ''}`}
                          >
                            <td className="py-4 px-5">
                              <p className="font-bold text-foreground">{payment.date.toLocaleDateString('en-KE')}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                                Due: {payment.dueDate.toLocaleDateString('en-KE')}
                              </p>
                            </td>
                            <td className="py-4 px-5 font-bold text-foreground text-right text-base">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-4 px-5">
                              <StatusBadge status={payment.status} />
                            </td>
                            <td className="py-4 px-5 hidden md:table-cell">
                              <p className="font-semibold text-xs text-foreground capitalize">{payment.method || '—'}</p>
                              {payment.reference && (
                                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{payment.reference}</p>
                              )}
                              {payment.notes && !payment.reference && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 italic truncate max-w-[160px]">{payment.notes}</p>
                              )}
                            </td>
                            <td className="py-4 px-5 text-center">
                              {payment.status === 'pending' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleConfirm(payment)}
                                    disabled={!!confirmingId}
                                    title="Confirm — mark as Paid"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                                  >
                                    {confirmingId === payment._id + '_confirm' ? (
                                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <CheckCircle size={12} />
                                    )}
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => handleReject(payment)}
                                    disabled={!!confirmingId}
                                    title="Reject — mark as Overdue"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-destructive text-destructive rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-destructive/5 disabled:opacity-50 transition-colors whitespace-nowrap"
                                  >
                                    {confirmingId === payment._id + '_reject' ? (
                                      <span className="w-3 h-3 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <XCircle size={12} />
                                    )}
                                    Reject
                                  </button>
                                </div>
                              ) : payment.status === 'paid' ? (
                                <span className="flex items-center justify-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                                  <CheckCircle size={13} /> Confirmed
                                </span>
                              ) : payment.status === 'overdue' ? (
                                <span className="flex items-center justify-center gap-1 text-destructive text-[10px] font-bold uppercase tracking-widest">
                                  <AlertCircle size={13} /> Overdue
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-16 text-center text-sm font-semibold text-muted-foreground bg-white">
                            {tenantPayments.length === 0
                              ? 'No payment records found for this tenant'
                              : 'No records match the selected filter'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pending payments notice */}
              {pendingCount > 0 && filterStatus !== 'pending' && (
                <div
                  onClick={() => setFilterStatus('pending')}
                  className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <Clock size={16} className="text-amber-600 shrink-0" />
                  <p className="text-sm font-semibold text-amber-800">
                    {pendingCount} payment{pendingCount !== 1 ? 's' : ''} pending your confirmation —{' '}
                    <span className="underline underline-offset-2">click to filter</span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <Card variant="subtle" className="p-16 flex flex-col items-center justify-center text-center h-full min-h-[400px] border-dashed border-border bg-transparent">
              <div className="w-16 h-16 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-6">
                <CreditCard size={32} />
              </div>
              <p className="text-xl font-bold tracking-tight text-foreground mb-2">Select a tenant</p>
              <p className="text-sm font-medium text-muted-foreground max-w-sm">
                Choose a tenant from the directory to view their payment submissions and confirm or reject them.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
