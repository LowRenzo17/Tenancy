/**
 * Export Utilities — EstateLedger
 * Professional CSV and PDF report generation
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

const getPropertyName = (propertyId, properties) =>
  properties.find(
    (p) =>
      p._id === propertyId ||
      p.id?.toString() === propertyId?.toString()
  )?.name || 'Unknown Property';

const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

const fmt = (n) => `KSh ${Number(n || 0).toLocaleString('en-KE')}`;
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const today = () => new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
const nowISO = () => new Date().toISOString().split('T')[0];

/**
 * Download a CSV blob with UTF-8 BOM (for Excel compatibility)
 */
const downloadCSV = (rows, filename) => {
  // BOM + content
  const BOM = '\uFEFF';
  const content = BOM + rows.map((r) => r.map(escapeCSV).join(',')).join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Open a styled print window and trigger browser print-to-PDF
 */
const printPDF = (title, subtitle, summaryRows, tableHeaders, tableRows, filename) => {
  const summaryHTML = summaryRows.length
    ? `<div class="summary">
        ${summaryRows.map(([label, value]) => `
          <div class="summary-item">
            <span class="summary-label">${label}</span>
            <span class="summary-value">${value}</span>
          </div>`).join('')}
       </div>`
    : '';

  const thead = `<tr>${tableHeaders.map((h) => `<th>${h}</th>`).join('')}</tr>`;
  const tbody = tableRows
    .map((row, i) => `<tr class="${i % 2 === 0 ? '' : 'alt'}">${row.map((c) => `<td>${c ?? '—'}</td>`).join('')}</tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      color: #071e27;
      background: #fff;
      padding: 0;
      font-size: 12px;
    }

    /* ── Cover strip ─────────────────────────────── */
    .cover {
      background: linear-gradient(135deg, #003441 0%, #0f4c5c 100%);
      color: #fff;
      padding: 36px 48px 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .cover-brand { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; opacity: .7; margin-bottom: 8px; }
    .cover-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2; }
    .cover-subtitle { font-size: 13px; opacity: .75; margin-top: 4px; }
    .cover-meta { text-align: right; font-size: 10px; opacity: .65; line-height: 1.8; }

    /* ── Body wrapper ────────────────────────────── */
    .body { padding: 32px 48px 40px; }

    /* ── Summary cards ───────────────────────────── */
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 28px;
    }
    .summary-item {
      flex: 1 1 140px;
      background: #f0f9ff;
      border: 1px solid #d0eaf6;
      border-top: 3px solid #003441;
      border-radius: 6px;
      padding: 12px 16px;
    }
    .summary-label {
      display: block;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #40484b;
      margin-bottom: 6px;
    }
    .summary-value {
      display: block;
      font-size: 18px;
      font-weight: 800;
      color: #003441;
    }

    /* ── Section heading ─────────────────────────── */
    .section-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #40484b;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e0edf2;
    }

    /* ── Table ───────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    thead tr {
      background: #003441;
      color: #fff;
    }
    thead th {
      padding: 10px 14px;
      text-align: left;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    tbody td {
      padding: 9px 14px;
      color: #071e27;
      border-bottom: 1px solid #e8f2f7;
      vertical-align: top;
    }
    tbody tr.alt td { background: #f7fbfd; }
    tbody tr:last-child td { border-bottom: none; }

    /* ── Footer ──────────────────────────────────── */
    .footer {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid #d5ecf8;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #7a9099;
    }

    /* ── Print rules ─────────────────────────────── */
    @media print {
      body { background: #fff; }
      .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tbody tr.alt td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .summary-item { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
  <!-- Cover Header -->
  <div class="cover">
    <div>
      <div class="cover-brand">EstateLedger · Property Management</div>
      <div class="cover-title">${title}</div>
      <div class="cover-subtitle">${subtitle}</div>
    </div>
    <div class="cover-meta">
      Generated: ${today()}<br/>
      Confidential
    </div>
  </div>

  <!-- Body -->
  <div class="body">
    ${summaryHTML}

    ${tableRows.length > 0 ? `
      <div class="section-title">Detailed Records — ${tableRows.length} item${tableRows.length !== 1 ? 's' : ''}</div>
      <table>
        <thead><tr>${tableHeaders.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    ` : '<p style="color:#7a9099;font-size:12px;">No records found for this report.</p>'}

    <div class="footer">
      <span>© ${new Date().getFullYear()} EstateLedger — Premium Property Management Platform</span>
      <span>Report ID: EL-${nowISO()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
    </div>
  </div>

  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  <\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    throw new Error('Pop-up blocked — please allow pop-ups to export PDFs');
  }
  win.document.write(html);
  win.document.close();
  // Also set suggested filename via title
  win.document.title = filename.replace('.pdf', '');
};

// ─── CSV Exports ─────────────────────────────────────────────────────────────

export const exportPropertiesToCSV = (properties) => {
  if (!properties.length) { throw new Error('No properties to export'); }

  const meta = [
    ['EstateLedger — Properties Report'],
    [`Generated: ${today()}`],
    [`Total Units: ${properties.length}`],
    [],
  ];

  const headers = ['Property Name', 'Unit Number', 'Type', 'Location', 'Monthly Rent (KSh)', 'Status'];
  const rows = properties.map((p) => [
    p.name,
    p.unitNumber || '',
    capitalize(p.propertyType || 'unit'),
    p.location || '',
    p.monthlyRent || 0,
    capitalize(p.status || 'vacant'),
  ]);

  downloadCSV([...meta, headers, ...rows], `EL-Properties-${nowISO()}.csv`);
};

export const exportTenantsToCSV = (tenants, properties) => {
  if (!tenants.length) { throw new Error('No tenants to export'); }

  const meta = [
    ['EstateLedger — Tenant Directory Report'],
    [`Generated: ${today()}`],
    [`Total Tenants: ${tenants.length}`],
    [],
  ];

  const headers = ['Tenant Name', 'Email', 'Property', 'Unit', 'Monthly Rent (KSh)', 'Rent Status', 'Lease Start', 'Lease End'];
  const rows = tenants.map((t) => [
    t.name || t.fullName,
    t.email || '',
    getPropertyName(t.propertyId, properties),
    t.unitNumber || '',
    t.rentAmount || 0,
    capitalize(t.rentStatus || 'pending'),
    t.leaseStartDate ? new Date(t.leaseStartDate).toLocaleDateString('en-KE') : '',
    t.leaseEndDate ? new Date(t.leaseEndDate).toLocaleDateString('en-KE') : '',
  ]);

  downloadCSV([...meta, headers, ...rows], `EL-Tenants-${nowISO()}.csv`);
};

export const exportRevenueReportToCSV = (tenants, properties) => {
  if (!tenants.length) { throw new Error('No tenant data to export'); }

  const totalRent = tenants.reduce((s, t) => s + (t.rentAmount || 0), 0);
  const paidRent = tenants.filter((t) => t.rentStatus === 'paid').reduce((s, t) => s + (t.rentAmount || 0), 0);
  const pendingRent = tenants.filter((t) => t.rentStatus === 'pending').reduce((s, t) => s + (t.rentAmount || 0), 0);
  const overdueRent = tenants.filter((t) => t.rentStatus === 'overdue').reduce((s, t) => s + (t.rentAmount || 0), 0);
  const collectionRate = totalRent > 0 ? Math.round((paidRent / totalRent) * 100) : 0;

  const meta = [
    ['EstateLedger — Revenue Summary Report'],
    [`Generated: ${today()}`],
    [`Collection Rate: ${collectionRate}%`],
    [],
    ['SUMMARY METRICS'],
    ['Metric', 'Amount (KSh)', 'Notes'],
    ['Total Expected Rent', totalRent, `${tenants.length} tenants`],
    ['Collected (Paid)', paidRent, `${tenants.filter((t) => t.rentStatus === 'paid').length} tenants`],
    ['Pending', pendingRent, `${tenants.filter((t) => t.rentStatus === 'pending').length} tenants`],
    ['Overdue', overdueRent, `${tenants.filter((t) => t.rentStatus === 'overdue').length} tenants`],
    ['Collection Rate', `${collectionRate}%`, ''],
    [],
    ['TENANT BREAKDOWN'],
  ];

  const headers = ['Tenant Name', 'Property', 'Rent (KSh)', 'Status'];
  const rows = tenants.map((t) => [
    t.name || t.fullName,
    getPropertyName(t.propertyId, properties),
    t.rentAmount || 0,
    capitalize(t.rentStatus || 'pending'),
  ]);

  downloadCSV([...meta, headers, ...rows], `EL-Revenue-${nowISO()}.csv`);
};

export const exportMaintenanceToCSV = (maintenanceRequests, properties) => {
  if (!maintenanceRequests.length) { throw new Error('No maintenance data to export'); }

  const pending = maintenanceRequests.filter((r) => r.status === 'pending').length;
  const inProgress = maintenanceRequests.filter((r) => r.status === 'in-progress').length;
  const completed = maintenanceRequests.filter((r) => r.status === 'completed').length;

  const meta = [
    ['EstateLedger — Maintenance Log Report'],
    [`Generated: ${today()}`],
    [`Total Tickets: ${maintenanceRequests.length}  |  Pending: ${pending}  |  In Progress: ${inProgress}  |  Resolved: ${completed}`],
    [],
  ];

  const headers = ['Title', 'Description', 'Property', 'Category', 'Priority', 'Status', 'Date Submitted'];
  const rows = maintenanceRequests.map((r) => [
    r.title || 'Maintenance Request',
    r.description || '',
    getPropertyName(r.propertyId, properties),
    capitalize(r.category || 'general'),
    capitalize(r.priority || 'medium'),
    capitalize(r.status || 'pending'),
    r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-KE') : '',
  ]);

  downloadCSV([...meta, headers, ...rows], `EL-Maintenance-${nowISO()}.csv`);
};

// ─── PDF Exports ─────────────────────────────────────────────────────────────

export const generatePDFReport = (title, _tableHTML, _filename) => {
  // Legacy shim — now handled by the richer functions below
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(`<html><head><title>${title}</title></head><body>${_tableHTML}</body></html>`);
    win.document.close();
    win.print();
  }
};

export const createTableHTML = (headers, rows) => {
  // Kept for backward compat — not used by new PDF functions
  return rows.map((r) => r.join('\t')).join('\n');
};

export const exportPropertiesToPDF = (properties) => {
  const totalRent = properties.reduce((s, p) => s + (p.monthlyRent || 0), 0);
  const occupied = properties.filter((p) => (p.status || '').toLowerCase() === 'occupied').length;

  printPDF(
    'Properties Report',
    `Portfolio overview — ${properties.length} unit${properties.length !== 1 ? 's' : ''}`,
    [
      ['Total Units', properties.length],
      ['Occupied', occupied],
      ['Vacant', properties.length - occupied],
      ['Occupancy Rate', `${properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0}%`],
      ['Total Monthly Revenue', fmt(totalRent)],
    ],
    ['Property Name', 'Unit No.', 'Type', 'Location', 'Monthly Rent', 'Status'],
    properties.map((p) => [
      p.name,
      p.unitNumber || '—',
      capitalize(p.propertyType || 'unit'),
      p.location || '—',
      fmt(p.monthlyRent),
      capitalize(p.status || 'vacant'),
    ]),
    `EL-Properties-${nowISO()}.pdf`
  );
};

export const exportTenantsToPDF = (tenants, properties) => {
  const paid = tenants.filter((t) => t.rentStatus === 'paid').length;
  const pending = tenants.filter((t) => t.rentStatus === 'pending').length;
  const overdue = tenants.filter((t) => t.rentStatus === 'overdue').length;
  const totalRent = tenants.reduce((s, t) => s + (t.rentAmount || 0), 0);

  printPDF(
    'Tenant Directory Report',
    `Active residents — ${tenants.length} tenant${tenants.length !== 1 ? 's' : ''}`,
    [
      ['Total Tenants', tenants.length],
      ['Paid', paid],
      ['Pending', pending],
      ['Overdue', overdue],
      ['Total Monthly Rent', fmt(totalRent)],
    ],
    ['Tenant Name', 'Property', 'Unit', 'Monthly Rent', 'Lease Expires', 'Rent Status'],
    tenants.map((t) => [
      t.name || t.fullName,
      getPropertyName(t.propertyId, properties),
      t.unitNumber || '—',
      fmt(t.rentAmount),
      t.leaseEndDate ? new Date(t.leaseEndDate).toLocaleDateString('en-KE') : '—',
      `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:${t.rentStatus === 'paid' ? '#dcfce7' : t.rentStatus === 'overdue' ? '#fee2e2' : '#fef9c3'};color:${t.rentStatus === 'paid' ? '#166534' : t.rentStatus === 'overdue' ? '#991b1b' : '#713f12'}">${capitalize(t.rentStatus || 'pending')}</span>`,
    ]),
    `EL-Tenants-${nowISO()}.pdf`
  );
};

export const exportRevenueToPDF = (tenants, properties) => {
  const totalRent = tenants.reduce((s, t) => s + (t.rentAmount || 0), 0);
  const paidRent = tenants.filter((t) => t.rentStatus === 'paid').reduce((s, t) => s + (t.rentAmount || 0), 0);
  const pendingRent = tenants.filter((t) => t.rentStatus === 'pending').reduce((s, t) => s + (t.rentAmount || 0), 0);
  const overdueRent = tenants.filter((t) => t.rentStatus === 'overdue').reduce((s, t) => s + (t.rentAmount || 0), 0);

  printPDF(
    'Revenue & Collections Report',
    `Financial summary for ${new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}`,
    [
      ['Expected Revenue', fmt(totalRent)],
      ['Collected', fmt(paidRent)],
      ['Pending', fmt(pendingRent)],
      ['Overdue', fmt(overdueRent)],
      ['Collection Rate', `${totalRent > 0 ? Math.round((paidRent / totalRent) * 100) : 0}%`],
    ],
    ['Tenant', 'Property', 'Monthly Rent', 'Paid Amount', 'Status'],
    tenants.map((t) => [
      t.name || t.fullName,
      getPropertyName(t.propertyId, properties),
      fmt(t.rentAmount),
      t.rentStatus === 'paid' ? fmt(t.rentAmount) : fmt(0),
      `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:${t.rentStatus === 'paid' ? '#dcfce7' : t.rentStatus === 'overdue' ? '#fee2e2' : '#fef9c3'};color:${t.rentStatus === 'paid' ? '#166534' : t.rentStatus === 'overdue' ? '#991b1b' : '#713f12'}">${capitalize(t.rentStatus || 'pending')}</span>`,
    ]),
    `EL-Revenue-${nowISO()}.pdf`
  );
};

export const exportMaintenanceToPDF = (maintenanceRequests, properties) => {
  const pending = maintenanceRequests.filter((r) => r.status === 'pending').length;
  const inProgress = maintenanceRequests.filter((r) => r.status === 'in-progress').length;
  const completed = maintenanceRequests.filter((r) => r.status === 'completed').length;
  const critical = maintenanceRequests.filter((r) => r.priority === 'high' || r.priority === 'emergency').length;

  printPDF(
    'Maintenance Log Report',
    `Service ticket overview — ${maintenanceRequests.length} ticket${maintenanceRequests.length !== 1 ? 's' : ''}`,
    [
      ['Total Tickets', maintenanceRequests.length],
      ['Pending', pending],
      ['In Progress', inProgress],
      ['Resolved', completed],
      ['Critical / High Priority', critical],
    ],
    ['Title', 'Property', 'Category', 'Priority', 'Status', 'Submitted'],
    maintenanceRequests.map((r) => {
      const priorityColor = r.priority === 'emergency' || r.priority === 'high' ? '#fee2e2' : r.priority === 'low' ? '#dcfce7' : '#fef9c3';
      const priorityText = r.priority === 'emergency' || r.priority === 'high' ? '#991b1b' : r.priority === 'low' ? '#166534' : '#713f12';
      return [
        r.title || 'Maintenance Request',
        getPropertyName(r.propertyId, properties),
        capitalize(r.category || 'general'),
        `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:${priorityColor};color:${priorityText}">${capitalize(r.priority || 'medium')}</span>`,
        capitalize(r.status || 'pending'),
        r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-KE') : '—',
      ];
    }),
    `EL-Maintenance-${nowISO()}.pdf`
  );
};
