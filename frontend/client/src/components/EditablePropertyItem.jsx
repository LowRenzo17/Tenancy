import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';

/**
 * EditablePropertyItem Component
 * Design System: The Architectural Ledger
 * - Inline editing with unit number support
 * - Toast feedback on save/delete
 */
export default function EditablePropertyItem({ property, onUpdate, onDelete, idx }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: property.name || '',
    unitNumber: property.unitNumber || '',
    location: property.location || '',
    monthlyRent: property.monthlyRent || '',
    propertyType: property.propertyType || 'apartment',
    status: property.status || 'vacant',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyRent' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Property name is required');
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(property.id || property._id, formData);
      toast.success(`"${formData.name}" updated successfully`);
      setIsEditing(false);
    } catch {
      toast.error('Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: property.name || '',
      unitNumber: property.unitNumber || '',
      location: property.location || '',
      monthlyRent: property.monthlyRent || '',
      propertyType: property.propertyType || 'apartment',
      status: property.status || 'vacant',
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${property.name}"? This cannot be undone.`)) return;
    try {
      await onDelete(property.id || property._id);
      toast.success(`"${property.name}" removed`);
    } catch {
      toast.error('Failed to delete property');
    }
  };

  const inputClass =
    'w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';
  const labelClass = 'block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1';

  if (isEditing) {
    return (
      <Card variant="elevated" className="p-6">
        <h4 className="text-sm font-bold text-foreground mb-4 pb-3 border-b border-border">
          Editing: {property.name}
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Property Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Sunrise Apartments"
              />
            </div>
            <div>
              <label className={labelClass}>Unit Number</label>
              <input
                type="text"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 4B, 12A"
              />
            </div>
            <div>
              <label className={labelClass}>Location / Address</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 12 Waterfront Dr, Nairobi"
              />
            </div>
            <div>
              <label className={labelClass}>Monthly Rent (KSh)</label>
              <input
                type="number"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleChange}
                className={inputClass}
                min="0"
              />
            </div>
            <div>
              <label className={labelClass}>Unit Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={inputClass}>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="bedsitter">Bedsitter</option>
                <option value="single">Single Room</option>
                <option value="studio">Studio</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Occupancy Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-border">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Check size={16} />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground font-medium rounded-md text-sm border border-border hover:bg-secondary/70 transition-colors"
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
    <div className={`rounded-lg border border-border p-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-3 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}`}>
      {/* Name + Unit */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
          {(property.name || 'P').substring(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm tracking-tight text-foreground truncate">{property.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {property.propertyType || 'Unit'}
            {property.unitNumber ? ` · Unit ${property.unitNumber}` : ''}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2">
        <StatusBadge status={property.status || 'vacant'} />
      </div>

      {/* Address */}
      <div className="col-span-3">
        <p className="text-sm text-foreground/80 truncate">{property.location || '—'}</p>
      </div>

      {/* Rent */}
      <div className="col-span-2">
        <p className="font-bold text-sm">{formatCurrency(parseFloat(property.monthlyRent) || 0)}</p>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Edit property"
          title="Edit"
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Delete property"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
