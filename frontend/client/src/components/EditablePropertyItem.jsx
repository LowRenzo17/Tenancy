import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import Card from './Card';
import StatusBadge from './StatusBadge';

/**
 * EditablePropertyItem Component
 * Design System: The Architectural Ledger
 * - Inline editing with toggle between view and edit modes
 * - Smooth transitions between states
 */
export default function EditablePropertyItem({ property, onUpdate, onDelete, idx }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: property.name,
    location: property.location,
    status: property.status,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (formData.name.trim() && formData.location.trim()) {
      onUpdate(property.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: property.name,
      location: property.location,
      status: property.status,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card variant={idx % 2 === 0 ? 'elevated' : 'subtle'} className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
              Property Name
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
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
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
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md px-4 py-2 transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                color: '#071e27',
                borderBottom: '2px solid #306576',
              }}
            >
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
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
            {property.name}
          </h3>
          <p className="text-sm mt-1" style={{ color: '#40484b' }}>
            {property.location}
          </p>
          <div className="mt-4">
            <StatusBadge status={property.status} />
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
            aria-label="Edit property"
          >
            <Edit2 size={20} />
          </button>
          <button
            onClick={() => onDelete(property.id)}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: '#ba1a1a',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(186, 26, 26, 0.1)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            aria-label="Delete property"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </Card>
  );
}
