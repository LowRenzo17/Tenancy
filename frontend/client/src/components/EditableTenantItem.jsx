import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import Card from './Card';
import StatusBadge from './StatusBadge';

/**
 * EditableTenantItem Component
 * Design System: The Architectural Ledger
 * - Inline editing for tenant information
 * - Rent amount and status updates
 */
export default function EditableTenantItem({ tenant, properties, onUpdate, onDelete, idx }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name,
    propertyId: tenant.propertyId,
    rentAmount: tenant.rentAmount,
    rentStatus: tenant.rentStatus,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rentAmount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = () => {
    if (formData.name.trim() && formData.propertyId && formData.rentAmount) {
      onUpdate(tenant.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: tenant.name,
      propertyId: tenant.propertyId,
      rentAmount: tenant.rentAmount,
      rentStatus: tenant.rentStatus,
    });
    setIsEditing(false);
  };

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown Property';
  };

  if (isEditing) {
    return (
      <Card variant={idx % 2 === 0 ? 'elevated' : 'subtle'} className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
              Tenant Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md px-4 py-2 transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                color: '#071e27',
                borderBottom: '2px solid #306576',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
              Property
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full rounded-md px-4 py-2 transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                color: '#071e27',
                borderBottom: '2px solid #306576',
              }}
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
              onChange={handleChange}
              className="w-full rounded-md px-4 py-2 transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                color: '#071e27',
                borderBottom: '2px solid #306576',
              }}
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
              Rent Status
            </label>
            <select
              name="rentStatus"
              value={formData.rentStatus}
              onChange={handleChange}
              className="w-full rounded-md px-4 py-2 transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                color: '#071e27',
                borderBottom: '2px solid #306576',
              }}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)' }}
            >
              <Check size={18} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium transition-all duration-200"
              style={{ color: '#003441', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={idx % 2 === 0 ? 'elevated' : 'subtle'} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            {tenant.name}
          </h3>
          <p className="text-sm mt-1" style={{ color: '#40484b' }}>
            Property: {getPropertyName(tenant.propertyId)}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div>
              <p className="text-xs" style={{ color: '#40484b' }}>Monthly Rent</p>
              <p className="text-lg font-semibold" style={{ color: '#071e27' }}>
                ${tenant.rentAmount.toLocaleString()}
              </p>
            </div>
            <StatusBadge status={tenant.rentStatus} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: '#003441',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            aria-label="Edit tenant"
          >
            <Edit2 size={20} />
          </button>
          <button
            onClick={() => onDelete(tenant.id)}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: '#ba1a1a',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(186, 26, 26, 0.1)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            aria-label="Delete tenant"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </Card>
  );
}
