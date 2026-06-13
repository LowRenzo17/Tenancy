import { Trash2, Wrench, ArrowRight, Home, CheckCircle2, Clock, User } from 'lucide-react';
import Card from '../components/Card';
import { getMaintenanceStatusMessage } from '../lib/utils';
import { toast } from 'sonner';

/**
 * Maintenance Page — Owner View
 * Design System: The Architectural Ledger
 * - Kanban-style board for maintenance requests
 * - Owners manage requests; tenants submit via their portal
 */
export default function Maintenance({ maintenanceRequests, properties, onDeleteRequest, onUpdateStatus }) {
  // Resolve property name whether propertyId is a populated object or a raw ID
  const getPropertyName = (propertyId) => {
    if (propertyId && typeof propertyId === 'object') {
      return propertyId.name || propertyId.address || 'Unknown Property';
    }
    return properties.find(
      (p) => p.id === parseInt(propertyId) || p.id === propertyId || p._id === propertyId
    )?.name || 'Unknown Property';
  };

  const pending = maintenanceRequests.filter(r => r.status === 'pending' || !r.status);
  const inProgress = maintenanceRequests.filter(r => r.status === 'in-progress');
  const completed = maintenanceRequests.filter(r => r.status === 'completed');

  const activeRequestsCount = pending.length + inProgress.length;
  
  const criticalCount = [...pending, ...inProgress].filter(r => 
    r.priority === 'emergency' || r.priority === 'high'
  ).length;

  let resolutionEfficiencyText = 'N/A';
  if (completed.length > 0) {
    let totalHours = 0;
    let validCompletions = 0;
    completed.forEach(r => {
      const created = new Date(r.createdAt || Date.now());
      const completedAt = new Date(r.completionDate || r.updatedAt || Date.now()); 
      const diffInHours = (completedAt - created) / (1000 * 60 * 60);
      if (diffInHours >= 0) {
        totalHours += diffInHours;
        validCompletions++;
      }
    });
    if (validCompletions > 0) {
      const avgHours = totalHours / validCompletions;
      resolutionEfficiencyText = avgHours < 24 ? `${avgHours.toFixed(1)} Hours` : `${(avgHours / 24).toFixed(1)} Days`;
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await onUpdateStatus(id, status);
      toast.success(`Request marked as ${status.replace('-', ' ')}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDeleteRequest(id);
      toast.success('Ticket removed');
    } catch {
      toast.error('Failed to remove ticket');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Maintenance Ledger
          </h1>
          <p className="text-sm text-foreground/70 leading-relaxed">
            Oversee and resolve property maintenance requests<br/>across your portfolio with architectural precision.
          </p>
        </div>
        {/* Informational badge — owners review, tenants submit */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/60 border border-border rounded-lg text-sm text-muted-foreground font-medium">
          <Wrench size={15} className="text-primary shrink-0" />
          Tenant-submitted requests appear here
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 bg-[#eaf6fa] text-[#003441] relative overflow-hidden flex items-end justify-between min-h-[120px]">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Active Requests</p>
            <p className="text-4xl font-black tracking-tight">{activeRequestsCount < 10 ? `0${activeRequestsCount}` : activeRequestsCount}</p>
          </div>
          <Wrench size={80} className="absolute -right-4 -bottom-4 text-[#d5ecf8] opacity-50 transform -rotate-12" strokeWidth={1.5} />
        </div>
        
        <div className="rounded-xl p-6 bg-[#ffece8] text-[#ba1a1a] relative overflow-hidden flex items-end justify-between min-h-[120px]">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Critical Priority</p>
            <p className="text-4xl font-black tracking-tight">{criticalCount < 10 ? `0${criticalCount}` : criticalCount}</p>
          </div>
          <div className="absolute right-4 bottom-4 w-4 h-24 bg-[#ffd1c8] rounded-full opacity-60"></div>
        </div>

        <div className="rounded-xl p-6 bg-[#0f4c5c] text-white relative overflow-hidden flex items-end justify-between min-h-[120px]">
          <div className="relative z-10 w-full">
            <p className="text-xs font-medium opacity-80 mb-1">Resolution Efficiency</p>
            <p className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">{resolutionEfficiencyText}</span>
              <span className="text-xs opacity-70">avg. response</span>
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NEW SUBMISSIONS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0f4c5c]"></span>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">New Submissions ({pending.length < 10 ? `0${pending.length}` : pending.length})</h3>
          </div>
          
          <div className="space-y-4">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No new submissions.</p>
            ) : (
              pending.map((request) => {
                const priorityClass = request.priority === 'emergency' || request.priority === 'high' 
                  ? 'border-l-[#ba1a1a] bg-[#ffece8] text-[#ba1a1a]' 
                  : request.priority === 'low' 
                    ? 'border-l-green-400 bg-green-100 text-green-700'
                    : 'border-l-amber-400 bg-amber-100 text-amber-700';

                const badgeBg = request.priority === 'emergency' || request.priority === 'high' ? 'bg-[#ffece8] text-[#ba1a1a]' : request.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';

                return (
                  <div key={request._id || request.id} className={`bg-white rounded-xl shadow-sm border border-border border-l-4 ${priorityClass.split(' ')[0]} p-5 relative cursor-pointer hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeBg} uppercase tracking-wider`}>{request.priority || 'Medium'} urgency</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-foreground/70 uppercase tracking-wider capitalize">{request.category || 'General'}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-foreground mb-1">{request.title || 'Maintenance Request'}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {request.description}
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
                      <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider mb-1">
                        {getMaintenanceStatusMessage('pending').stage}
                      </p>
                      <p className="text-[11px] text-yellow-700 leading-relaxed">
                        {getMaintenanceStatusMessage('pending').message}
                      </p>
                    </div>
                    <div className="flex items-start justify-between pt-3 border-t border-border">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Home size={14} />
                          <span>{getPropertyName(request.propertyId)}{request.tenantId?.unitNumber ? ` — Unit ${request.tenantId.unitNumber}` : ''}</span>
                        </div>
                        {request.tenantId && typeof request.tenantId === 'object' && (
                          <div className="flex flex-col gap-0.5 pl-0.5">
                            <div className="flex items-center gap-2 text-[10px] text-foreground/80 font-medium">
                              <User size={12} className="text-primary" />
                              <span>{request.tenantId.fullName || 'Tenant'}</span>
                            </div>
                            {request.tenantId.phone && (
                              <span className="text-[10px] text-muted-foreground pl-4">📞 {request.tenantId.phone}</span>
                            )}
                            {request.tenantId.email && (
                              <span className="text-[10px] text-muted-foreground pl-4">✉️ {request.tenantId.email}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(request._id || request.id, 'in-progress'); }} className="text-primary hover:text-primary/70 mt-1" title="Move to In Progress">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">In Progress ({inProgress.length < 10 ? `0${inProgress.length}` : inProgress.length})</h3>
          </div>
          
          <div className="space-y-4">
            {inProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No tasks in progress.</p>
            ) : (
              inProgress.map((request) => (
                <div key={request._id || request.id} className="bg-white rounded-xl shadow-sm border border-border border-l-4 border-l-blue-400 p-5 relative cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">In Progress</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-foreground/70 uppercase tracking-wider capitalize">{request.category || 'General'}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 uppercase"><Clock size={12}/> {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{request.title || 'Maintenance Request'}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {request.description}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                    <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                      {getMaintenanceStatusMessage('in-progress').stage}
                    </p>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      {getMaintenanceStatusMessage('in-progress').message}
                    </p>
                  </div>
                  <div className="flex items-start justify-between pt-3 border-t border-border">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Home size={14} />
                        <span>{getPropertyName(request.propertyId)}{request.tenantId?.unitNumber ? ` — Unit ${request.tenantId.unitNumber}` : ''}</span>
                      </div>
                      {request.tenantId && typeof request.tenantId === 'object' && (
                        <div className="flex flex-col gap-0.5 pl-0.5">
                          <div className="flex items-center gap-2 text-[10px] text-foreground/80 font-medium">
                            <User size={12} className="text-primary" />
                            <span>{request.tenantId.fullName || 'Tenant'}</span>
                          </div>
                          {request.tenantId.phone && (
                            <span className="text-[10px] text-muted-foreground pl-4">📞 {request.tenantId.phone}</span>
                          )}
                          {request.tenantId.email && (
                            <span className="text-[10px] text-muted-foreground pl-4">✉️ {request.tenantId.email}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(request._id || request.id, 'completed'); }} className="text-green-600 hover:text-green-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-1" title="Mark as Completed">
                      <CheckCircle2 size={14} /> Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT COMPLETION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Recent Completion ({completed.length < 10 ? `0${completed.length}` : completed.length})</h3>
          </div>
          
          <div className="space-y-4">
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No recent completions.</p>
            ) : (
              completed.map((request) => (
                <div key={request._id || request.id} className="bg-secondary/40 rounded-xl border border-border p-5 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={12}/> Resolved
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-foreground/50 uppercase tracking-wider capitalize">{request.category || 'General'}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-foreground/50 line-through decoration-2 mb-4">{request.title || 'Maintenance Request'}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed opacity-60">
                      {request.description}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                    <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-1">
                      {getMaintenanceStatusMessage('completed').stage}
                    </p>
                    <p className="text-[11px] text-green-700 leading-relaxed">
                      {getMaintenanceStatusMessage('completed').message}
                    </p>
                  </div>
                  <div className="flex items-start justify-between pt-3 border-t border-border/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-2"><Home size={12} /> {getPropertyName(request.propertyId)}{request.tenantId?.unitNumber ? ` — Unit ${request.tenantId.unitNumber}` : ''}</span>
                      {request.tenantId && typeof request.tenantId === 'object' && (
                        <div className="flex flex-col gap-0.5 pl-0.5">
                          <div className="flex items-center gap-2 text-[10px] text-foreground/60 font-medium">
                            <User size={12} />
                            <span>{request.tenantId.fullName || 'Tenant'}</span>
                          </div>
                          {request.tenantId.phone && (
                            <span className="text-[10px] text-muted-foreground/70 pl-4">📞 {request.tenantId.phone}</span>
                          )}
                          {request.tenantId.email && (
                            <span className="text-[10px] text-muted-foreground/70 pl-4">✉️ {request.tenantId.email}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(request._id || request.id); }} className="text-red-400 hover:text-red-500 mt-1" title="Delete record">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
