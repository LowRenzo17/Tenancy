import { useState, useMemo } from 'react';
import { Plus, Building2, Filter, Download, Search, X, Home } from 'lucide-react';
import Card from '../components/Card';
import EditablePropertyItem from '../components/EditablePropertyItem';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 8;

/**
 * Properties Page
 * Design System: The Architectural Ledger
 * - Real data-driven metrics
 * - Functional filter, search, export, pagination
 * - Add unit with unit number support
 */
export default function Properties({ properties, onAddProperty, onDeleteProperty, onUpdateProperty }) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newProperty, setNewProperty] = useState({
    name: '',
    location: '',
    propertyType: 'apartment',
    unitNumber: '',
    monthlyRent: '',
    status: 'vacant',
  });

  // ---------- Real Metrics ----------
  const totalUnits = properties.length;
  const occupiedUnits = properties.filter(p => (p.status || '').toLowerCase() === 'occupied').length;
  const vacantUnits = totalUnits - occupiedUnits;
  const totalMonthlyRevenue = properties.reduce((sum, p) => sum + (parseFloat(p.monthlyRent) || 0), 0);
  const avgRent = totalUnits > 0 ? Math.round(totalMonthlyRevenue / totalUnits) : 0;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // ---------- Filter + Search ----------
  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchesStatus = filterStatus === 'all' || (p.status || '').toLowerCase() === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.unitNumber || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [properties, filterStatus, searchQuery]);

  // ---------- Pagination ----------
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ---------- Add Property ----------
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newProperty.name.trim()) {
      toast.error('Property name is required');
      return;
    }
    try {
      await onAddProperty({
        ...newProperty,
        monthlyRent: parseFloat(newProperty.monthlyRent) || 0,
      });
      toast.success(`Unit "${newProperty.name}" added successfully`);
      setShowForm(false);
      setNewProperty({ name: '', location: '', propertyType: 'apartment', unitNumber: '', monthlyRent: '', status: 'vacant' });
      setCurrentPage(1);
    } catch (err) {
      toast.error('Failed to add unit. Please try again.');
    }
  };

  // ---------- Export CSV ----------
  const handleExport = () => {
    if (properties.length === 0) {
      toast.error('No properties to export.');
      return;
    }
    const headers = ['Name', 'Unit Number', 'Type', 'Location', 'Monthly Rent (KSh)', 'Status'];
    const rows = properties.map(p => [
      p.name || '',
      p.unitNumber || '',
      p.propertyType || '',
      p.location || '',
      p.monthlyRent || 0,
      p.status || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Properties exported as CSV');
  };

  const statusOptions = [
    { value: 'all', label: 'All Units' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'vacant', label: 'Vacant' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Property Ledger
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalUnits} unit{totalUnits !== 1 ? 's' : ''} across your portfolio · {occupiedUnits} occupied · {vacantUnits} vacant
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setShowForm(!showForm); setShowFilter(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Add Unit
          </button>
          <button
            onClick={() => { setShowFilter(!showFilter); setShowForm(false); }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md font-semibold text-sm transition-colors ${showFilter ? 'bg-secondary border-primary' : 'border-border hover:bg-secondary/50'}`}
          >
            <Filter size={16} /> Filter
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md font-semibold text-sm hover:bg-secondary/50 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Real Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Units</p>
          <p className="text-3xl font-black tracking-tight text-foreground">{totalUnits}</p>
        </Card>
        <Card variant="elevated" className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Occupancy</p>
          <p className="text-3xl font-black tracking-tight text-foreground">{occupancyRate}%</p>
        </Card>
        <Card variant="elevated" className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Monthly Revenue</p>
          <p className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(totalMonthlyRevenue)}</p>
        </Card>
        <Card variant="elevated" className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Average Rent</p>
          <p className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(avgRent)}</p>
        </Card>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <Card variant="elevated" className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, location or unit..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-secondary rounded-md border border-border outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Status Filter */}
            <div className="flex gap-2">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setFilterStatus(opt.value); setCurrentPage(1); }}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${filterStatus === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/70 text-foreground'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {(searchQuery || filterStatus !== 'all') && (
            <p className="text-xs text-muted-foreground mt-3">
              Showing {filtered.length} of {totalUnits} units
            </p>
          )}
        </Card>
      )}

      {/* Add Unit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card variant="elevated" className="w-full max-w-2xl p-8 animate-fade-in-up border-border max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-5">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Home size={18} className="text-primary" /> Register New Unit
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
                  Property / Unit Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harbor Terrace Block A"
                  value={newProperty.name}
                  onChange={e => setNewProperty({ ...newProperty, name: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
                  Unit Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4B, 12A, Ground Floor"
                  value={newProperty.unitNumber}
                  onChange={e => setNewProperty({ ...newProperty, unitNumber: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
                  Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 Waterfront Dr, Nairobi"
                  value={newProperty.location}
                  onChange={e => setNewProperty({ ...newProperty, location: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
                  Unit Type
                </label>
                <select
                  value={newProperty.propertyType}
                  onChange={e => setNewProperty({ ...newProperty, propertyType: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="single">Single Room</option>
                  <option value="studio">Studio</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial">Commercial Space</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
                  Monthly Rent (KSh)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={newProperty.monthlyRent}
                  onChange={e => setNewProperty({ ...newProperty, monthlyRent: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
                  Occupancy Status
                </label>
                <select
                  value={newProperty.status}
                  onChange={e => setNewProperty({ ...newProperty, status: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> Save Unit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-border rounded-md font-semibold text-sm hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
          </Card>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-secondary/10 rounded-xl border border-border overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary/20">
          <div className="col-span-4">Property & Unit</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Address</div>
          <div className="col-span-2">Monthly Rent</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Rows */}
        <div className="p-4 space-y-2">
          {paginated.length > 0 ? (
            paginated.map((prop, idx) => (
              <EditablePropertyItem
                key={prop._id || prop.id}
                property={prop}
                onUpdate={onUpdateProperty}
                onDelete={onDeleteProperty}
                idx={idx}
              />
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm font-semibold text-foreground mb-1">
                {searchQuery || filterStatus !== 'all' ? 'No units match your filters' : 'No units listed yet'}
              </p>
              <p className="text-xs">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Click "Add Unit" to register your first property.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} unit{filtered.length !== 1 ? 's' : ''}
            </span>
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-white disabled:opacity-40 text-sm"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${page === currentPage ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-white'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-white disabled:opacity-40 text-sm"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
