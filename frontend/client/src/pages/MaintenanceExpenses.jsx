import { useState } from 'react';
import { Wrench, Plus, TrendingUp, Banknote, Calendar } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'sonner';

/**
 * Maintenance Expenses Page
 * Design System: The Architectural Ledger
 * - Track maintenance costs and expenses
 * - Generate expense reports for profitability analysis
 */
export default function MaintenanceExpenses({ maintenanceRequests, properties, onAddExpense }) {
  const [expenses, setExpenses] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    requestId: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    category: 'General',
  });

  const categories = ['General', 'Plumbing', 'Electrical', 'HVAC', 'Structural', 'Painting', 'Flooring', 'Other'];

  const handleAddExpense = () => {
    if (!formData.requestId || !formData.description || !formData.amount || !formData.vendor) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newExpense = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      status: 'completed',
    };

    setExpenses([...expenses, newExpense]);
    setFormData({
      requestId: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      category: 'General',
    });
    setShowForm(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0;
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;

  // Expenses by category
  const expensesByCategory = categories.map(cat => ({
    category: cat,
    total: expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
    count: expenses.filter(e => e.category === cat).length,
  })).filter(e => e.total > 0);

  // Monthly expenses
  const monthlyExpenses = {};
  expenses.forEach(expense => {
    const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
    monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + expense.amount;
  });

  const sortedMonths = Object.entries(monthlyExpenses)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Maintenance Expenses
          </h1>
          <p className="text-sm text-muted-foreground">Track and manage maintenance costs for accurate profitability analysis.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-foreground text-white font-bold rounded-lg shadow-sm hover:bg-foreground/90 transition-colors"
        >
          <Plus size={16} />
          Record Expense
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <Card variant="elevated" className="p-6 bg-secondary/30 border-l-4 border-l-foreground animate-in slide-in-from-top-4 fade-in duration-300">
          <h3 className="text-lg font-bold tracking-tight text-foreground mb-6">
            Record New Expense
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Maintenance Request
              </label>
              <select
                value={formData.requestId}
                onChange={(e) => setFormData({ ...formData, requestId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              >
                <option value="">Select a request...</option>
                {maintenanceRequests.map(req => (
                  <option key={req._id || req.id} value={req._id || req.id}>
                    {req.title || req.description || 'Untitled Request'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g., Roof repair"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Amount (Ksh)
              </label>
              <input
                type="number"
                placeholder="e.g., 450"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Vendor
              </label>
              <input
                type="text"
                placeholder="e.g., ABC Roofing"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-border">
            <button
              onClick={handleAddExpense}
              className="px-6 py-2.5 bg-foreground text-white font-bold rounded-lg shadow-sm hover:opacity-90 transition-colors"
            >
              Save Expense
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 bg-white border border-border text-foreground font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated" className="p-6 bg-white flex flex-col justify-between min-h-[140px] border-b-4 border-b-slate-800">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Banknote size={20} className="text-slate-600" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-3xl font-black tracking-tight text-slate-800">
              Ksh {totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-2">
              {expenses.length} transactions
            </p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-white flex flex-col justify-between min-h-[140px] border-b-4 border-b-teal-600">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-teal-700" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Average Expense</p>
            <p className="text-3xl font-black tracking-tight text-teal-800">
              Ksh {avgExpense.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-2">
              Per transaction
            </p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-white flex flex-col justify-between min-h-[140px] border-b-4 border-b-[#ba1a1a]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Wrench size={20} className="text-red-700" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Highest Expense</p>
            <p className="text-3xl font-black tracking-tight text-[#ba1a1a]">
              Ksh {highestExpense.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-2">
              Single transaction
            </p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-white flex flex-col justify-between min-h-[140px] border-b-4 border-b-emerald-600">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calendar size={20} className="text-emerald-700" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Categories</p>
            <p className="text-3xl font-black tracking-tight text-emerald-800">
              {expensesByCategory.length}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-2">
              Active categories
            </p>
          </div>
        </Card>
      </div>

      {/* Expenses by Category */}
      {expensesByCategory.length > 0 && (
        <Card variant="elevated" className="p-6 bg-white">
          <h3 className="text-lg font-bold tracking-tight text-foreground mb-6">
            Expenses by Category
          </h3>
          <div className="space-y-4">
            {expensesByCategory.map((item, idx) => (
              <div key={item.category}>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="font-semibold text-foreground">
                    Ksh {item.total.toLocaleString()} ({item.count} items)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${['bg-primary', 'bg-green-700', 'bg-yellow-700', 'bg-destructive'][idx % 4]}`}
                    style={{
                      width: `${(item.total / totalExpenses) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Expenses */}
      {sortedMonths.length > 0 && (
        <Card variant="elevated" className="p-6 bg-white">
          <h3 className="text-lg font-bold tracking-tight text-foreground mb-6">
            Monthly Expenses <span className="text-sm font-medium text-muted-foreground ml-2">(Last 6 Months)</span>
          </h3>
          <div className="space-y-4">
            {sortedMonths.map(([month, amount]) => (
              <div key={month}>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">
                    {new Date(month + '-01').toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="font-semibold text-foreground">
                    Ksh {amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-primary"
                    style={{
                      width: `${(amount / Math.max(...sortedMonths.map(m => m[1]))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expense List */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Expense Transactions
          </h3>
        </div>
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 border-b border-border">
                <tr>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Description</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Vendor</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-right">Amount</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((expense, idx) => (
                  <tr
                    key={expense.id}
                    className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/20'} hover:bg-secondary/40`}
                  >
                    <td className="py-4 px-6 font-bold text-foreground">
                      {expense.date.toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-medium text-foreground">
                      {expense.description}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-semibold">
                      {expense.vendor}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-foreground text-base">
                      Ksh {expense.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-colors text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center p-8">
            No expenses recorded yet
          </p>
        )}
      </Card>
    </div>
  );
}
