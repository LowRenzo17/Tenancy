import { useState } from 'react';
import { Wrench, Plus, X, AlertCircle, User, Home, Phone, Mail } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { useData } from '../contexts/DataContext';
import { getMaintenanceStatusMessage } from '../lib/utils';
import { toast } from 'sonner';

/**
 * Submit Maintenance Page - Tenant View
 * Design System: The Architectural Ledger
 * - Allows tenants to submit maintenance requests
 */
export default function SubmitMaintenance({ currentUser, onPageChange }) {
  const { maintenance, createMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest, myTenantProfile } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lastRequestId, setLastRequestId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', category: '', description: '', urgency: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'plumbing',
    description: '',
    urgency: 'medium',
    photos: [],
  });
  
  const requests = maintenance || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myTenantProfile?.assignedProperty?._id) {
       toast.error('You are not linked to a property. Please contact your property manager.');
       return;
    }

    try {
      setIsSubmitting(true);
      const result = await createMaintenanceRequest({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.urgency,
        propertyId: myTenantProfile.assignedProperty._id,
      });
      setLastRequestId(result?._id || result?.maintenance?._id || null);
      setFormData({ title: '', category: 'plumbing', description: '', urgency: 'medium', photos: [] });
      setShowForm(false);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit maintenance request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToDashboard = () => {
    setIsSuccess(false);
    onPageChange?.('tenantDashboard');
  };

  const handleUpdate = async (id) => {
    try {
      await updateMaintenanceRequest(id, {
        title: editFormData.title,
        category: editFormData.category,
        description: editFormData.description,
        priority: editFormData.urgency,
      });
      setEditingId(null);
      toast.success('Request updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update maintenance request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance request? This cannot be undone.')) return;
    try {
      await deleteMaintenanceRequest(id);
      toast.success('Maintenance request deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete maintenance request');
    }
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
      case 'medium':
        return '#f57c00';
      case 'low':
        return '#2d7a3e';
      default:
        return '#0f4c5c';
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-8">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-20 h-20 bg-[#eaf6fa] text-[#003441] rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Request Submitted Successfully!</h1>
          <p className="text-lg text-muted-foreground/80 max-w-2xl">
            Your maintenance request
            {lastRequestId && (
              <span className="font-bold text-[#003441]"> (Ref: {lastRequestId.slice(-8).toUpperCase()})</span>
            )}{' '}
            has been received and prioritized according to our service standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-[#0f4c5c]/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#003441]"></div>
            <div className="mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#eaf6fa] text-[#003441] uppercase tracking-wider">Step 01</span>
            </div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Review in Progress</h3>
            <p className="text-xs text-muted-foreground mb-6">Our property management team is reviewing your ticket details.</p>
            <div className="text-[10px] uppercase tracking-widest text-[#003441] font-bold">Estimated: 2-4 Hours</div>
          </div>

          <div className="bg-secondary/40 rounded-xl border border-border p-6 relative">
            <div className="mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase tracking-wider">Step 02</span>
            </div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-foreground/60">Technician Assignment</h3>
            <p className="text-xs text-muted-foreground mb-6">Matching your issue with the appropriate certified professional.</p>
          </div>

          <div className="bg-secondary/40 rounded-xl border border-border p-6 relative">
            <div className="mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase tracking-wider">Step 03</span>
            </div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-foreground/60">Scheduling</h3>
            <p className="text-xs text-muted-foreground mb-6">Coordinating visit times based on urgency and your availability.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={handleReturnToDashboard}
            className="px-8 py-3 bg-white border-2 border-border text-foreground font-bold rounded-lg hover:bg-slate-50 transition-colors w-full md:w-auto"
          >
            Return to Dashboard
          </button>
          <button 
            onClick={() => setIsSuccess(false)}
            className="px-8 py-3 bg-[#0f4c5c] text-white font-bold rounded-lg bg-gradient-to-r hover:opacity-90 transition-opacity w-full md:w-auto shadow-md"
          >
            View Request Status &rarr;
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl overflow-hidden relative min-h-[140px] flex items-center mb-8">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url(/assets/media__1776721225397.png)' }}></div>
          <div className="relative z-10 px-8 py-6 w-full">
            <h2 className="text-2xl font-bold tracking-widest text-[#00ebc7] mb-2 uppercase">We're on it.</h2>
            <p className="text-gray-300 max-w-lg">Our verified experts ensure your comfort is restored quickly and professionally.</p>
          </div>
          <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-700 flex items-center justify-center overflow-hidden">
             <img src="/assets/login_architecture_splash_1776721854245.png" alt="Pro" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 p-5 bg-[#ffece8]/50 border border-[#ba1a1a]/20 rounded-xl">
             <div className="text-[#ba1a1a] mt-1 shrink-0"><AlertCircle size={24} /></div>
             <div>
               <h4 className="font-bold text-sm uppercase tracking-widest mb-1 text-[#ba1a1a]">Emergency Repairs</h4>
               <p className="text-xs text-muted-foreground mb-3">Major leaks, electrical failures, or security breaches.</p>
               <h5 className="font-black text-xl tracking-wide text-foreground">24/7 HOTLINE</h5>
             </div>
          </div>
          <div className="flex gap-4 p-5 bg-[#eaf6fa]/50 border border-[#003441]/20 rounded-xl">
             <div className="text-[#003441] mt-1 shrink-0"><Wrench size={24} /></div>
             <div>
               <h4 className="font-bold text-sm uppercase tracking-widest mb-1 text-[#003441]">Concierge Chat</h4>
               <p className="text-xs text-muted-foreground mb-3">Live updates and scheduling assistance via messaging.</p>
               <button onClick={() => onPageChange?.('chat')} className="text-xs font-bold text-[#003441] uppercase tracking-widest hover:underline">Start Chat &rarr;</button>
             </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Service Requests
          </h1>
          <p className="text-sm text-muted-foreground">Submit and track maintenance requests.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity text-sm border border-transparent"
        >
          <Plus size={16} />
          New Request
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <Card variant="elevated" className="mb-8 p-6">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Submit Service Ticket
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Tenant details confirmation — visible before submitting */}
            {myTenantProfile && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Details being captured with this request</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-foreground/80">
                    <User size={13} className="text-primary shrink-0" />
                    <span className="font-medium">{myTenantProfile.fullName || currentUser?.fullName || 'Your name'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/80">
                    <Home size={13} className="text-primary shrink-0" />
                    <span className="font-medium">
                      {myTenantProfile.assignedProperty?.name || myTenantProfile.assignedProperty?.address || 'Your property'}
                      {myTenantProfile.unitNumber ? ` — Unit ${myTenantProfile.unitNumber}` : ''}
                    </span>
                  </div>
                  {(myTenantProfile.phone || currentUser?.phone) && (
                    <div className="flex items-center gap-2 text-xs text-foreground/80">
                      <Phone size={13} className="text-primary shrink-0" />
                      <span>{myTenantProfile.phone || currentUser?.phone}</span>
                    </div>
                  )}
                  {(myTenantProfile.email || currentUser?.email) && (
                    <div className="flex items-center gap-2 text-xs text-foreground/80">
                      <Mail size={13} className="text-primary shrink-0" />
                      <span>{myTenantProfile.email || currentUser?.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Issue Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                required
                placeholder="Brief summary (e.g. Broken HVAC)"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-3 pr-8 py-2 text-sm bg-card rounded-md border border-border outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Priority level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full pl-3 pr-8 py-2 text-sm bg-card rounded-md border border-border outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                >
                  <option value="low">Standard - Can wait</option>
                  <option value="medium">Elevated - Within 72 hrs</option>
                  <option value="high">Critical - Immediate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Detailed Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide as much context as possible..."
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                rows="4"
                required
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity text-sm border border-transparent disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-secondary text-foreground font-medium rounded-md shadow-sm hover:bg-secondary/70 transition-colors text-sm border border-transparent"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Maintenance Requests */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">
          Your Logbook
        </h2>

        {requests.length === 0 ? (
          <Card variant="subtle" className="p-16 text-center border-dashed">
            <div className="text-muted-foreground flex flex-col items-center">
              <div className="p-4 bg-secondary/50 rounded-full mb-4">
                <Wrench size={40} className="opacity-80" />
              </div>
              <p className="text-lg font-bold tracking-tight text-foreground mb-1">No requests right now</p>
              <p className="text-sm">Your service history will appear here.</p>
            </div>
          </Card>
        ) : (
          requests.map((request, idx) => (
            <Card key={request._id || request.id} variant={idx % 2 === 0 ? 'elevated' : 'subtle'} className="p-6">
              {editingId === (request._id || request.id) ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold tracking-tight text-foreground">Edit Ticket</h3>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full pl-3 pr-8 py-2 text-sm bg-card rounded-md border border-border outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      >
                        {categoryOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Urgency</label>
                      <select
                        value={editFormData.urgency}
                        onChange={(e) => setEditFormData({ ...editFormData, urgency: e.target.value })}
                        className="w-full pl-3 pr-8 py-2 text-sm bg-card rounded-md border border-border outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      >
                        <option value="low">Low - Can wait</option>
                        <option value="medium">Medium - Within a week</option>
                        <option value="high">High - Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleUpdate(request._id || request.id)}
                      className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity text-sm border border-transparent"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-secondary text-foreground font-medium rounded-md shadow-sm hover:bg-secondary/70 transition-colors text-sm border border-transparent"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        {request.title || request.category}
                      </h3>
                      <StatusBadge status={request.status} />
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: getUrgencyColor(request.priority || request.urgency) + '10',
                          color: getUrgencyColor(request.priority || request.urgency),
                          borderColor: getUrgencyColor(request.priority || request.urgency) + '30',
                        }}
                      >
                        {(request.priority || request.urgency || '').charAt(0).toUpperCase() + (request.priority || request.urgency || '').slice(1)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-border bg-secondary text-foreground/60 capitalize">
                        {request.category || 'General'}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">
                      {request.description}
                    </p>
                    {/* Property confirmation for tenant */}
                    {(request.propertyId) && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                        <Home size={12} className="text-primary" />
                        <span className="font-medium">
                          {typeof request.propertyId === 'object'
                            ? (request.propertyId.name || request.propertyId.address || 'Your Property')
                            : 'Property linked'}
                        </span>
                      </div>
                    )}
                    <div className={`rounded-lg p-2.5 mb-3 border text-[11px] font-medium`}
                      style={{
                        backgroundColor: request.status === 'pending' ? '#fef3c7' : request.status === 'in-progress' ? '#dbeafe' : '#dcfce7',
                        borderColor: request.status === 'pending' ? '#fbbf24' : request.status === 'in-progress' ? '#60a5fa' : '#86efac',
                      }}
                    >
                      <p className="font-bold uppercase tracking-wider mb-0.5" style={{
                        color: request.status === 'pending' ? '#92400e' : request.status === 'in-progress' ? '#1e40af' : '#166534',
                      }}>
                        {getMaintenanceStatusMessage(request.status).stage}
                      </p>
                      <p style={{
                        color: request.status === 'pending' ? '#b45309' : request.status === 'in-progress' ? '#1e3a8a' : '#15803d',
                      }}>
                        {getMaintenanceStatusMessage(request.status).message}
                      </p>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Submitted: {new Date(request.createdAt || request.date || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border md:border-0 md:pt-0 shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(request._id || request.id);
                        setEditFormData({
                          title: request.title || request.category || '',
                          category: request.category || 'other',
                          description: request.description || '',
                          urgency: request.priority || request.urgency || 'medium'
                        });
                      }}
                      className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(request._id || request.id)}
                      className="p-2 rounded-md hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Help Section */}
      {/* Help Section */}
      <Card variant="subtle" className="mt-8 p-6 bg-destructive/5 border-l-4 border-l-destructive/50">
        <div className="flex gap-4">
          <AlertCircle size={24} className="text-destructive shrink-0" />
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground mb-1">
              Emergency Services
            </h3>
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              For urgent structural, electrical or critical infrastructure faults, contact the duty officer direct line immediately.
            </p>
            <button
              className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:underline"
            >
              View emergency protocols &rarr;
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
