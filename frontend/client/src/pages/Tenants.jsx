import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
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
    fullName: '',
    email: '',
    assignedProperty: properties.length > 0 ? properties[0].id : '',
    unitNumber: '',
    monthlyRent: '',
    leaseStartDate: new Date().toISOString().split('T')[0],
    leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    rentStatus: 'pending',
    useInviteLink: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!formData.assignedProperty) {
      toast.error('Please select a property');
      return;
    }
    if (!formData.monthlyRent) {
      toast.error('Monthly rent amount is required');
      return;
    }
    try {
      await onAddTenant({
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent),
      });
      toast.success(
        formData.useInviteLink 
          ? `Invitation email queued for "${formData.fullName}"`
          : `Resident "${formData.fullName}" registered successfully`
      );
      setFormData({
        fullName: '',
        email: '',
        assignedProperty: properties.length > 0 ? properties[0].id : '',
        unitNumber: '',
        monthlyRent: '',
        leaseStartDate: new Date().toISOString().split('T')[0],
        leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        rentStatus: 'pending',
        useInviteLink: true,
      });
      setShowForm(false);
    } catch {
      toast.error('Failed to register resident. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id?.toString() === propertyId?.toString())?.name || 'Unknown Property';
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Action Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Tenant Directory
          </h1>
          <p className="text-sm text-muted-foreground">Manage active residents and monitor payment ledgers.</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            disabled={properties.length === 0}
            title={properties.length === 0 ? 'Add at least one property first' : 'Register a new resident'}
          >
            <Plus size={16} />
            <span>New Resident</span>
          </button>
          {properties.length === 0 && (
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
              ⚠ Add a property first to register residents
            </p>
          )}
        </div>
      </div>

      {/* Add Tenant Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card variant="elevated" className="w-full max-w-lg p-8 animate-fade-in-up border-border">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
              Register Resident
            </h2>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">Please configure a property before adding residents.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g., John Smith"
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g., john@example.com"
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Estate
                    </label>
                    <select
                      name="assignedProperty"
                      value={formData.assignedProperty}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      required
                    >
                      {properties.map(prop => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Unit Identifier
                    </label>
                    <input
                      type="text"
                      name="unitNumber"
                      value={formData.unitNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 4B"
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Lease Term Start
                    </label>
                    <input
                      type="date"
                      name="leaseStartDate"
                      value={formData.leaseStartDate}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Lease Term End
                    </label>
                    <input
                      type="date"
                      name="leaseEndDate"
                      value={formData.leaseEndDate}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Monthly Yield (KSh)
                    </label>
                    <input
                      type="number"
                      name="monthlyRent"
                      value={formData.monthlyRent}
                      onChange={handleInputChange}
                      placeholder="e.g., 1500"
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Ledger Status
                    </label>
                    <select
                      name="rentStatus"
                      value={formData.rentStatus}
                      onChange={handleInputChange}
                      disabled={formData.useInviteLink}
                      className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="paid">Settled</option>
                      <option value="pending">Outstanding</option>
                      <option value="overdue">Delinquent</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 py-1">
                  <input
                    type="checkbox"
                    id="useInviteLink"
                    name="useInviteLink"
                    checked={formData.useInviteLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, useInviteLink: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-primary bg-card focus:ring-primary focus:ring-offset-background"
                  />
                  <label htmlFor="useInviteLink" className="text-sm font-medium text-foreground select-none cursor-pointer">
                    Invite via Email Link (Tenant Self-Onboarding)
                  </label>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-secondary text-foreground font-medium rounded-md shadow-sm hover:bg-secondary/70 transition-colors text-sm border border-transparent hover:border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity text-sm"
                  >
                    Register Resident
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
        <Card variant="elevated" className="p-12 text-center border-dashed border-2">
          <div className="text-muted-foreground flex flex-col items-center">
            <Users size={32} className="mb-4 opacity-50" />
            <p className="text-sm font-semibold tracking-wide uppercase text-foreground mb-1">Ledger Empty</p>
            <p className="text-xs">Register your first resident to commence tracking yield.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
