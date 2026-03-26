import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import Card from '../components/Card';
import EditablePropertyItem from '../components/EditablePropertyItem';

/**
 * Properties Page
 * Design System: The Architectural Ledger
 * - List items separated by whitespace (spacing scale), no dividers
 * - Zebra striping via alternating surface colors
 * - Modal form for adding new properties
 */
export default function Properties({ properties, onAddProperty, onDeleteProperty, onUpdateProperty }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'vacant',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.location.trim()) {
      onAddProperty({
        id: Date.now(),
        ...formData,
      });
      setFormData({ name: '', location: '', status: 'vacant' });
      setShowForm(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Properties
          </h1>
          <p className="mt-2" style={{ color: '#40484b' }}>Manage your rental properties</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-md font-medium text-white transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)' }}
        >
          <Plus size={20} />
          Add Property
        </button>
      </div>

      {/* Add Property Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <Card variant="elevated" className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              Add New Property
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
                  Property Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Sunset Apartment 101"
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
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main St, Downtown"
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
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
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
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
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
                  Add Property
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Properties List */}
      {properties.length > 0 ? (
        <div className="space-y-4">
          {properties.map((property, idx) => (
            <EditablePropertyItem
              key={property.id}
              property={property}
              onUpdate={onUpdateProperty}
              onDelete={onDeleteProperty}
              idx={idx}
            />
          ))}
        </div>
      ) : (
        <Card variant="subtle" className="p-12 text-center">
          <div style={{ color: '#40484b' }}>
            <Building2 size={48} className="mx-auto mb-4" style={{ opacity: 0.5 }} />
            <p className="text-lg font-medium">No properties yet</p>
            <p className="text-sm mt-2">Create your first property to get started</p>
          </div>
        </Card>
      )}
    </div>
  );
}
