import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import Card from '../components/Card';
import EditableTenantItem from '../components/EditableTenantItem';

/**
 * Tenants Page
 * Design System: The Architectural Ledger
 * - Tenant cards with property assignment
 * - Rent status indicators (paid, pending, overdue)
 * - Add tenant form modal
 */
export default function Tenants({ tenants, properties, onAddTenant, onDeleteTenant, onUpdateTenant }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    propertyId: properties.length > 0 ? properties[0].id : '',
    rentAmount: '',
    rentStatus: 'pending',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.propertyId && formData.rentAmount) {
      onAddTenant({
        id: Date.now(),
        ...formData,
        rentAmount: parseFloat(formData.rentAmount),
      });
      setFormData({
        name: '',
        propertyId: properties.length > 0 ? properties[0].id : '',
        rentAmount: '',
        rentStatus: 'pending',
      });
      setShowForm(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown Property';
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Tenants
          </h1>
          <p className="mt-2" style={{ color: '#40484b' }}>Manage tenant information and rent payments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-md font-medium text-white transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)' }}
          disabled={properties.length === 0}
        >
          <Plus size={20} />
          Add Tenant
        </button>
      </div>

      {/* Add Tenant Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <Card variant="elevated" className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              Add New Tenant
            </h2>
            {properties.length === 0 ? (
              <p style={{ color: '#40484b' }}>Please add a property first</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
                    Tenant Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Smith"
                    className="w-full rounded-md px-4 py-2 transition-all duration-200"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#071e27',
                      borderBottom: '2px solid transparent',
                    }}
                    onFocus={(e) => (e.target.style.borderBottomColor = '#306576')}
                    onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
                    Assigned Property
                  </label>
                  <select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleInputChange}
                    className="w-full rounded-md px-4 py-2 transition-all duration-200"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#071e27',
                      borderBottom: '2px solid transparent',
                    }}
                    onFocus={(e) => (e.target.style.borderBottomColor = '#306576')}
                    onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                    required
                  >
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id}>
                        {prop.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 1500"
                    className="w-full rounded-md px-4 py-2 transition-all duration-200"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#071e27',
                      borderBottom: '2px solid transparent',
                    }}
                    onFocus={(e) => (e.target.style.borderBottomColor = '#306576')}
                    onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
                    Rent Status
                  </label>
                  <select
                    name="rentStatus"
                    value={formData.rentStatus}
                    onChange={handleInputChange}
                    className="w-full rounded-md px-4 py-2 transition-all duration-200"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#071e27',
                      borderBottom: '2px solid transparent',
                    }}
                    onFocus={(e) => (e.target.style.borderBottomColor = '#306576')}
                    onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 font-medium transition-all duration-200"
                    style={{ color: '#003441', backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 rounded-md font-medium text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)' }}
                  >
                    Add Tenant
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Tenants List */}
      {tenants.length > 0 ? (
        <div className="space-y-4">
          {tenants.map((tenant, idx) => (
            <EditableTenantItem
              key={tenant.id}
              tenant={tenant}
              properties={properties}
              onUpdate={onUpdateTenant}
              onDelete={onDeleteTenant}
              idx={idx}
            />
          ))}
        </div>
      ) : (
        <Card variant="subtle" className="p-12 text-center">
          <div style={{ color: '#40484b' }}>
            <Users size={48} className="mx-auto mb-4" style={{ opacity: 0.5 }} />
            <p className="text-lg font-medium">No tenants yet</p>
            <p className="text-sm mt-2">Add your first tenant to track rent and occupancy</p>
          </div>
        </Card>
      )}
    </div>
  );
}
