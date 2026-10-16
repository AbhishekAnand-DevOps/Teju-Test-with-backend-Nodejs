/**
 * Escape and format CSV value according to RFC 4180
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  } else {
    str = '"' + str + '"';
  }
  return str;
}

/**
 * Export array of inquiries to CSV text
 */
function exportInquiriesToCsv(inquiries = []) {
  const headers = [
    'ID',
    'Client Name',
    'Client Email',
    'Project Type',
    'Budget (INR)',
    'Timeline',
    'Project Brief',
    'Status',
    'Admin Notes',
    'Date Submitted'
  ];

  const rows = inquiries.map((item) => [
    escapeCsvValue(item.id),
    escapeCsvValue(item.client_name),
    escapeCsvValue(item.client_email),
    escapeCsvValue(item.project_type),
    escapeCsvValue(item.budget),
    escapeCsvValue(item.timeline),
    escapeCsvValue(item.project_brief),
    escapeCsvValue(item.status),
    escapeCsvValue(item.notes || ''),
    escapeCsvValue(item.created_at)
  ]);

  const csvContent = [headers.map(escapeCsvValue).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  return csvContent;
}

module.exports = {
  exportInquiriesToCsv
};
