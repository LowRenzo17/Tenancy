import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';

/**
 * EditableTenantItem Component
 * Design System: The Architectural Ledger
 * - Inline editing for tenant information
 * - Rent amount and status updates
 */
export default function EditableTenantItem({ tenant, properties, onUpdate, onDelete, idx }) {
  const [isEditing, setIsEditing] = useState(false);
  const safeDateString = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.valueOf())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    fullName: tenant.fullName || tenant.name || '',
    email: tenant.email || '',
    assignedProperty: tenant.assignedProperty?._id || tenant.assignedProperty || tenant.propertyId || '',
    unitNumber: tenant.unitNumber || '',
    monthlyRent: tenant.monthlyRent || tenant.rentAmount || '',
    leaseStartDate: safeDateString(tenant.leaseStartDate),
    leaseEndDate: safeDateString(tenant.leaseEndDate),
    rentStatus: tenant.rentStatus || 'pending',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyRent' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (formData.fullName.trim() && formData.assignedProperty && formData.monthlyRent) {
      try {
        await onUpdate(tenant.id, formData);
        toast.success("Tenant details updated successfully");
        setIsEditing(false);
      } catch (error) {
        toast.error("Failed to update tenant details");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: tenant.fullName || tenant.name || '',
      email: tenant.email || '',
      assignedProperty: tenant.assignedProperty?._id || tenant.assignedProperty || tenant.propertyId || '',
      unitNumber: tenant.unitNumber || '',
      monthlyRent: tenant.monthlyRent || tenant.rentAmount || '',
      leaseStartDate: safeDateString(tenant.leaseStartDate),
      leaseEndDate: safeDateString(tenant.leaseEndDate),
      rentStatus: tenant.rentStatus || 'pending',
    });
    setIsEditing(false);
  };

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id?.toString() === propertyId?.toString())?.name || 'Unknown Property';
  };

  if (isEditing) {
    return (
      <Card variant="elevated" className={`p-6 border ${idx % 2 === 0 ? 'bg-card' : 'bg-secondary/30'}`}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tenant Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
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
                onChange={handleChange}
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Property
              </label>
              <select
                name="assignedProperty"
                value={formData.assignedProperty}
                onChange={handleChange}
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
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
                Unit / Room Number
              </label>
              <input
                type="text"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                placeholder="e.g. 4B"
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Lease Start
              </label>
              <input
                type="date"
                name="leaseStartDate"
                value={formData.leaseStartDate}
                onChange={handleChange}
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Lease End
              </label>
              <input
                type="date"
                name="leaseEndDate"
                value={formData.leaseEndDate}
                onChange={handleChange}
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Monthly Rent (KSh)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">KSh</span>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  className="w-full pl-12 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Rent Status
              </label>
              <select
                name="rentStatus"
                value={formData.rentStatus}
                onChange={handleChange}
                className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border mt-4">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity text-sm border border-transparent hover:border-border"
            >
              <Check size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground font-medium rounded-md shadow-sm hover:bg-secondary/70 transition-colors text-sm border border-transparent hover:border-border"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={`p-5 transition-all ${idx % 2 === 0 ? 'bg-card' : 'bg-secondary/30'}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {tenant.fullName || tenant.name}
            </h3>
            {tenant.unitNumber && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                Unit {tenant.unitNumber}
              </span>
            )}
            <StatusBadge status={tenant.rentStatus} />
          </div>
          
          <div className="text-sm font-medium text-muted-foreground flex flex-col md:flex-row md:gap-6 gap-1">
            <span>{getPropertyName(tenant.assignedProperty?._id || tenant.assignedProperty || tenant.propertyId)}</span>
            {tenant.email && <span className="hidden md:inline text-border">&bull;</span>}
            {tenant.email && <span>{tenant.email}</span>}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6 pt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Monthly Yield</p>
              <p className="text-sm font-bold text-foreground">
                {formatCurrency(tenant.monthlyRent || tenant.rentAmount || 0)}
              </p>
            </div>
            {tenant.leaseEndDate && (
               <div>
                 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Term End</p>
                 <p className="text-sm font-bold text-foreground">
                   {new Date(tenant.leaseEndDate).toLocaleDateString()}
                 </p>
               </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t border-border mt-4 md:mt-0 md:border-0 md:pl-4 opacity-0 lg:opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit resident"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(tenant.id)}
            className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete resident"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
