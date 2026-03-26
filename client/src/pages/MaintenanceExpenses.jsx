import { useState } from 'react';
import { Wrench, Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * Maintenance Expenses Page
 * Design System: The Architectural Ledger
 * - Track maintenance costs and expenses
 * - Generate expense reports for profitability analysis
 */
export default function MaintenanceExpenses({ maintenanceRequests, properties, onAddExpense }) {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      requestId: 1,
      description: 'Roof repair',
      amount: 450,
      date: new Date(2026, 2, 15),
      vendor: 'ABC Roofing',
      category: 'Structural',
      status: 'completed',
    },
    {
      id: 2,
      requestId: 2,
      description: 'HVAC maintenance',
      amount: 200,
      date: new Date(2026, 2, 10),
      vendor: 'Climate Control Inc',
      category: 'HVAC',
      status: 'completed',
    },
  ]);

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
      alert('Please fill in all fields');
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Maintenance Expenses
          </h1>
          <p style={{ color: '#40484b' }}>Track and manage maintenance costs for accurate profitability analysis</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: '#003441',
            color: '#fff',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Record New Expense
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Maintenance Request
              </label>
              <select
                value={formData.requestId}
                onChange={(e) => setFormData({ ...formData, requestId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              >
                <option value="">Select a request...</option>
                {maintenanceRequests.map(req => (
                  <option key={req.id} value={req.id}>
                    {req.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Description
              </label>
              <input
                type="text"
                placeholder="e.g., Roof repair"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Amount ($)
              </label>
              <input
                type="number"
                placeholder="e.g., 450"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Vendor
              </label>
              <input
                type="text"
                placeholder="e.g., ABC Roofing"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddExpense}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: '#003441',
                color: '#fff',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              Save Expense
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: '#e6f6ff',
                color: '#003441',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#d5ecf8')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs mb-2" style={{ color: '#40484b' }}>Total Expenses</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                ${totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                {expenses.length} transactions
              </p>
            </div>
            <DollarSign size={28} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs mb-2" style={{ color: '#40484b' }}>Average Expense</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                ${avgExpense.toLocaleString()}
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                Per transaction
              </p>
            </div>
            <TrendingUp size={28} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs mb-2" style={{ color: '#40484b' }}>Highest Expense</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#ba1a1a' }}>
                ${highestExpense.toLocaleString()}
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                Single transaction
              </p>
            </div>
            <Wrench size={28} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs mb-2" style={{ color: '#40484b' }}>Categories</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                {expensesByCategory.length}
              </p>
              <p className="text-xs mt-2" style={{ color: '#40484b' }}>
                Active categories
              </p>
            </div>
            <Calendar size={28} style={{ color: '#003441', opacity: 0.5 }} />
          </div>
        </Card>
      </div>

      {/* Expenses by Category */}
      {expensesByCategory.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Expenses by Category
          </h3>
          <div className="space-y-4">
            {expensesByCategory.map((item, idx) => (
              <div key={item.category}>
                <div className="flex justify-between mb-2">
                  <span style={{ color: '#40484b' }}>{item.category}</span>
                  <span className="font-semibold" style={{ color: '#071e27' }}>
                    ${item.total.toLocaleString()} ({item.count} items)
                  </span>
                </div>
                <div
                  className="h-3 rounded-full"
                  style={{
                    backgroundColor: '#e6f6ff',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: ['#003441', '#166534', '#92400e', '#ba1a1a'][idx % 4],
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
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Monthly Expenses (Last 6 Months)
          </h3>
          <div className="space-y-4">
            {sortedMonths.map(([month, amount]) => (
              <div key={month}>
                <div className="flex justify-between mb-2">
                  <span style={{ color: '#40484b' }}>
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="font-semibold" style={{ color: '#071e27' }}>
                    ${amount.toLocaleString()}
                  </span>
                </div>
                <div
                  className="h-3 rounded-full"
                  style={{
                    backgroundColor: '#e6f6ff',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: '#003441',
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
      <Card variant="elevated" className="p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Expense Transactions
        </h3>
        {expenses.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #d5ecf8' }}>
                <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Date</th>
                <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Description</th>
                <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Category</th>
                <th className="text-left py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Vendor</th>
                <th className="text-right py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Amount</th>
                <th className="text-center py-3 px-2" style={{ color: '#40484b', fontWeight: '600' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, idx) => (
                <tr
                  key={expense.id}
                  style={{
                    borderBottom: '1px solid #e6f6ff',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : '#f9fcfe',
                  }}
                >
                  <td className="py-3 px-2" style={{ color: '#071e27' }}>
                    {expense.date.toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2" style={{ color: '#071e27' }}>
                    {expense.description}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: '#e6f6ff',
                        color: '#003441',
                      }}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-2" style={{ color: '#40484b' }}>
                    {expense.vendor}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold" style={{ color: '#071e27' }}>
                    ${expense.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{
                        color: '#ba1a1a',
                        backgroundColor: 'rgba(186, 26, 26, 0.1)',
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.target.style.opacity = '1')}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#40484b', textAlign: 'center', padding: '2rem' }}>
            No expenses recorded yet
          </p>
        )}
      </Card>
    </div>
  );
}
