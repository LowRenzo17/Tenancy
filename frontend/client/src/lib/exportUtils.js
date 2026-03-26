/**
 * Export Utilities
 * Helper functions for generating CSV and PDF reports
 */

/**
 * Export properties to CSV
 */
export const exportPropertiesToCSV = (properties) => {
  if (properties.length === 0) {
    alert('No properties to export');
    return;
  }

  const headers = ['Property Name', 'Location', 'Status'];
  const rows = properties.map(p => [
    p.name,
    p.location,
    p.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, 'properties-report.csv');
};

/**
 * Export tenants to CSV
 */
export const exportTenantsToCSV = (tenants, properties) => {
  if (tenants.length === 0) {
    alert('No tenants to export');
    return;
  }

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown';
  };

  const headers = ['Tenant Name', 'Property', 'Monthly Rent', 'Rent Status'];
  const rows = tenants.map(t => [
    t.name,
    getPropertyName(t.propertyId),
    `$${t.rentAmount.toLocaleString()}`,
    t.rentStatus,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, 'tenants-report.csv');
};

/**
 * Export revenue report to CSV
 */
export const exportRevenueReportToCSV = (tenants, properties) => {
  if (tenants.length === 0) {
    alert('No tenant data to export');
    return;
  }

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown';
  };

  const totalRent = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const paidRent = tenants
    .filter(t => t.rentStatus === 'paid')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const pendingRent = tenants
    .filter(t => t.rentStatus === 'pending')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const overdueRent = tenants
    .filter(t => t.rentStatus === 'overdue')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);

  const headers = ['Metric', 'Amount'];
  const rows = [
    ['Total Expected Rent', `$${totalRent.toLocaleString()}`],
    ['Paid', `$${paidRent.toLocaleString()}`],
    ['Pending', `$${pendingRent.toLocaleString()}`],
    ['Overdue', `$${overdueRent.toLocaleString()}`],
    ['Collection Rate', `${totalRent > 0 ? Math.round((paidRent / totalRent) * 100) : 0}%`],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, 'revenue-report.csv');
};

/**
 * Export maintenance requests to CSV
 */
export const exportMaintenanceToCSV = (maintenanceRequests, properties) => {
  if (maintenanceRequests.length === 0) {
    alert('No maintenance requests to export');
    return;
  }

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === parseInt(propertyId))?.name || 'Unknown';
  };

  const headers = ['Description', 'Property', 'Status'];
  const rows = maintenanceRequests.map(r => [
    r.description,
    getPropertyName(r.propertyId),
    r.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, 'maintenance-report.csv');
};

/**
 * Helper function to download CSV
 */
const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate PDF report (using HTML table conversion)
 */
export const generatePDFReport = (title, data, filename) => {
  // Create a simple HTML table
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #071e27;
          }
          h1 {
            color: #003441;
            border-bottom: 2px solid #003441;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #e6f6ff;
            color: #003441;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #003441;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #d5ecf8;
          }
          tr:nth-child(even) {
            background-color: #f3faff;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #40484b;
            border-top: 1px solid #d5ecf8;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${data}
        <div class="footer">
          <p>© 2026 Tenancy Slate - Premium Property Management</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Create table HTML for PDF
 */
export const createTableHTML = (headers, rows) => {
  const headerHTML = headers.map(h => `<th>${h}</th>`).join('');
  const rowsHTML = rows
    .map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');

  return `
    <table>
      <thead>
        <tr>${headerHTML}</tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
  `;
};
