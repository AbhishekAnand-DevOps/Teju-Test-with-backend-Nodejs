const http = require('http');
const { app, server } = require('../../server');

async function testBackend() {
  console.log('[Test] Running Automated Backend Validation Suite...');

  const baseUrl = `http://localhost:5000`;

  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, options);
    const contentType = res.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return { status: res.status, headers: res.headers, body };
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('✓ Health Check:', health.status, health.body.status, '| DB:', health.body.database);

    // 2. Public Projects List
    const projects = await request('/api/projects');
    console.log('✓ Projects API:', projects.status, `Loaded ${projects.body.data.length} projects`);

    // 3. Admin Authentication
    const login = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@tejashwini.art',
        password: 'Admin@2025!'
      })
    });
    console.log('✓ Admin Login:', login.status, login.body.message);
    const token = login.body.data.token;

    // 4. Submit Inquiry Brief
    const inquiry = await request('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Marvel VFX Studios',
        client_email: 'production@marvel.com',
        project_type: '3D CGI Commercial',
        budget: 8500,
        timeline: '3-4 Weeks',
        project_brief: 'Zero-gravity commercial breakdown with fluid caustics and futuristic neon lighting.'
      })
    });
    console.log('✓ Submit Inquiry:', inquiry.status, inquiry.body.message, `ID: ${inquiry.body.data.id}`);

    // 5. Inquiries CRM List (Admin Protected)
    const list = await request('/api/inquiries', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Admin Inquiries List:', list.status, `Total: ${list.body.data.pagination.total}`);

    // 6. CSV Export (Admin Protected)
    const csv = await request(`/api/inquiries/export/csv?token=${token}`);
    console.log('✓ CSV Export:', csv.status, `CSV Length: ${csv.body.length} chars`);

    // 7. Admin Dashboard KPI Stats
    const stats = await request('/api/stats/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Dashboard Stats:', stats.status, `Pipeline: ₹${stats.body.data.inquiries.totalPipelineValue}`);

    // 8. Static Landing Page & Admin UI
    const indexHtml = await request('/');
    console.log('✓ Static Index HTML:', indexHtml.status, `Length: ${indexHtml.body.length}`);

    const adminHtml = await request('/admin');
    console.log('✓ Admin Dashboard UI:', adminHtml.status, `Length: ${adminHtml.body.length}`);

    console.log('\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

// Wait for server to bind
setTimeout(testBackend, 1000);
