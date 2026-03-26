import { useState } from 'react';
import { Plus, Trash2, Wrench } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * Maintenance Page
 * Design System: The Architectural Ledger
 * - Maintenance request tracking with status indicators
 * - Color-coded status badges (Pending, In Progress, Completed)
 * - Add request form modal
 */
export default function Maintenance({ maintenanceRequests, properties, onAddRequest, onDeleteRequest, onUpdateStatus }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: properties.length > 0 ? properties[0].id : '',
    description: '',
    status: 'Pending',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.description.trim() && formData.propertyId) {
      onAddRequest({
        id: Date.now(),
        ...formData,
      });
      setFormData({
        propertyId: properties.length > 0 ? properties[0].id : '',
        description: '',
        status: 'Pending',
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

  const statusOptions = ['Pending', 'In Progress', 'Completed'];

  return (
    <div className="space-y-8">
      {/* Page Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Maintenance Requests
          </h1>
          <p className="mt-2" style={{ color: '#40484b' }}>Track and manage property maintenance</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-md font-medium text-white transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)' }}
          disabled={properties.length === 0}
        >
          <Plus size={20} />
          Add Request
        </button>
      </div>

      {/* Add Maintenance Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <Card variant="elevated" className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              New Maintenance Request
            </h2>
            {properties.length === 0 ? (
              <p style={{ color: '#40484b' }}>Please add a property first</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#071e27' }}>
                    Property
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
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Leaky faucet in bathroom"
                    className="w-full rounded-md px-4 py-2 min-h-24 resize-none transition-all duration-200"
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
                    Initial Status
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
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
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
                    Create Request
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Maintenance Requests List */}
      {maintenanceRequests.length > 0 ? (
        <div className="space-y-4">
          {maintenanceRequests.map((request, idx) => (
            <Card
              key={request.id}
              variant={idx % 2 === 0 ? 'elevated' : 'subtle'}
              className="p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                    {request.description}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#40484b' }}>
                    Property: {getPropertyName(request.propertyId)}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div>
                      <p className="text-xs mb-2" style={{ color: '#40484b' }}>Status</p>
                      <select
                        value={request.status}
                        onChange={(e) => onUpdateStatus(request.id, e.target.value)}
                        className="text-sm py-1 rounded-md px-4 transition-all duration-200"
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#071e27',
                          borderBottom: '2px solid transparent',
                        }}
                        onFocus={(e) => (e.target.style.borderBottomColor = '#306576')}
                        onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </div>
                <button
                  onClick={() => onDeleteRequest(request.id)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: '#ba1a1a',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(186, 26, 26, 0.1)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  aria-label="Delete request"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="subtle" className="p-12 text-center">
          <div style={{ color: '#40484b' }}>
            <Wrench size={48} className="mx-auto mb-4" style={{ opacity: 0.5 }} />
            <p className="text-lg font-medium">No maintenance requests yet</p>
            <p className="text-sm mt-2">Create a request to track property maintenance</p>
          </div>
        </Card>
      )}
    </div>
  );
}
