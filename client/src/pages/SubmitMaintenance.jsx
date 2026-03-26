import { useState } from 'react';
import { Wrench, Plus, X, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

/**
 * Submit Maintenance Page - Tenant View
 * Design System: The Architectural Ledger
 * - Allows tenants to submit maintenance requests
 */
export default function SubmitMaintenance({ currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'plumbing',
    description: '',
    urgency: 'normal',
    photos: [],
  });
  const [requests, setRequests] = useState([
    {
      id: 1,
      category: 'Plumbing',
      description: 'Leaky kitchen faucet',
      status: 'in-progress',
      date: '2026-03-20',
      urgency: 'normal',
    },
    {
      id: 2,
      category: 'HVAC',
      description: 'AC not cooling properly',
      status: 'pending',
      date: '2026-03-18',
      urgency: 'high',
    },
    {
      id: 3,
      category: 'Electrical',
      description: 'Bedroom outlet not working',
      status: 'completed',
      date: '2026-03-10',
      urgency: 'normal',
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: requests.length + 1,
      category: formData.category,
      description: formData.description,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      urgency: formData.urgency,
    };
    setRequests([newRequest, ...requests]);
    setFormData({ category: 'plumbing', description: '', urgency: 'normal', photos: [] });
    setShowForm(false);
  };

  const categoryOptions = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'appliance', label: 'Appliance' },
    { value: 'structural', label: 'Structural' },
    { value: 'other', label: 'Other' },
  ];

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return '#ba1a1a';
      case 'normal':
        return '#f57c00';
      case 'low':
        return '#2d7a3e';
      default:
        return '#0f4c5c';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#003441' }}>
            Request Maintenance
          </h1>
          <p style={{ color: '#40484b' }}>Submit and track maintenance requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: '#003441',
            color: '#f3faff',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f4c5c')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#003441')}
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'Manrope', color: '#003441' }}>
              Submit Maintenance Request
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg transition-all"
              style={{ backgroundColor: '#f3faff', color: '#0f4c5c' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#003441' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  color: '#003441',
                  border: '1px solid #b3e5fc',
                }}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#003441' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                className="w-full p-3 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  color: '#003441',
                  border: '1px solid #b3e5fc',
                }}
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#003441' }}>
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full p-3 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  color: '#003441',
                  border: '1px solid #b3e5fc',
                }}
              >
                <option value="low">Low - Can wait</option>
                <option value="normal">Normal - Within a week</option>
                <option value="high">High - Urgent</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: '#003441',
                  color: '#f3faff',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f4c5c')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#003441')}
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: '#f3faff',
                  color: '#0f4c5c',
                  border: '1px solid #b3e5fc',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3faff')}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Maintenance Requests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#003441' }}>
          Your Requests
        </h2>

        {requests.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Wrench size={48} style={{ color: '#b3e5fc', margin: '0 auto' }} />
              <p className="mt-4" style={{ color: '#40484b' }}>
                No maintenance requests yet
              </p>
            </div>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold" style={{ color: '#003441' }}>
                      {request.category}
                    </h3>
                    <StatusBadge status={request.status} />
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{
                        backgroundColor: getUrgencyColor(request.urgency) + '20',
                        color: getUrgencyColor(request.urgency),
                      }}
                    >
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                  </div>
                  <p style={{ color: '#40484b' }} className="mb-2">
                    {request.description}
                  </p>
                  <p className="text-xs" style={{ color: '#40484b' }}>
                    Submitted: {new Date(request.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="px-3 py-1 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: '#e6f6ff',
                    color: '#0f4c5c',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c8ebf5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
                >
                  View Details
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Help Section */}
      <Card className="mt-8" style={{ backgroundColor: '#e6f6ff' }}>
        <div className="flex gap-4">
          <AlertCircle size={24} style={{ color: '#0f4c5c', flexShrink: 0 }} />
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#003441' }}>
              Emergency Maintenance?
            </h3>
            <p className="text-sm mb-3" style={{ color: '#40484b' }}>
              For urgent issues like gas leaks, electrical hazards, or water damage, please call your property manager immediately.
            </p>
            <button
              className="text-sm font-semibold"
              style={{ color: '#0f4c5c' }}
            >
              View Emergency Contacts →
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
