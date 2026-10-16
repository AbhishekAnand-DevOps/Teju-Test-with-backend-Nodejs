/**
 * TEJASHWINI PORTFOLIO — ADMIN CONTROL OS CLIENT ENGINE
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    token: localStorage.getItem('admin_token') || null,
    user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
    currentInquiryId: null,
    inquiryPage: 1,
    inquiryLimit: 15,
    searchDebounceTimer: null
  };

  // DOM Elements
  const authScreen = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const demoFillBtn = document.getElementById('demo-fill-btn');
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');

  // Header Elements
  const headerClock = document.getElementById('header-clock');
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const btnLogout = document.getElementById('btn-logout');
  const btnOpenPwdModal = document.getElementById('btn-open-pwd-modal');
  const headerUserName = document.getElementById('header-user-name');
  const headerUserAvatar = document.getElementById('header-user-avatar');
  const dropdownUserName = document.getElementById('dropdown-user-name');
  const dropdownUserEmail = document.getElementById('dropdown-user-email');

  // KPI Elements
  const statTotalInquiries = document.getElementById('stat-total-inquiries');
  const statActiveInquiries = document.getElementById('stat-active-inquiries');
  const statPipelineValue = document.getElementById('stat-pipeline-value');
  const statTotalProjects = document.getElementById('stat-total-projects');
  const statNewBadge = document.getElementById('stat-new-badge');
  const tabInquiryCount = document.getElementById('tab-inquiry-count');

  // Tab Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Inquiry Filter & Table Elements
  const inquirySearch = document.getElementById('inquiry-search');
  const filterStatus = document.getElementById('filter-status');
  const filterType = document.getElementById('filter-type');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnRefreshInquiries = document.getElementById('btn-refresh-inquiries');
  const inquiriesTableBody = document.getElementById('inquiries-table-body');
  const inquiriesPagination = document.getElementById('inquiries-pagination');
  const paginationInfo = document.getElementById('pagination-info');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');

  // Inquiry Detail Modal Elements
  const inquiryDetailModal = document.getElementById('inquiry-detail-modal');
  const btnCloseInquiryModal = document.getElementById('btn-close-inquiry-modal');
  const modalInquiryStatusBadge = document.getElementById('modal-inquiry-status-badge');
  const modalInquiryClient = document.getElementById('modal-inquiry-client');
  const modalInquiryEmail = document.getElementById('modal-inquiry-email');
  const modalInquiryType = document.getElementById('modal-inquiry-type');
  const modalInquiryBudget = document.getElementById('modal-inquiry-budget');
  const modalInquiryTimeline = document.getElementById('modal-inquiry-timeline');
  const modalInquiryDate = document.getElementById('modal-inquiry-date');
  const modalInquiryIp = document.getElementById('modal-inquiry-ip');
  const modalInquiryBrief = document.getElementById('modal-inquiry-brief');
  const modalInquiryStatusSelect = document.getElementById('modal-inquiry-status-select');
  const modalInquiryNotes = document.getElementById('modal-inquiry-notes');
  const btnSaveInquiry = document.getElementById('btn-save-inquiry');
  const btnDeleteInquiry = document.getElementById('btn-delete-inquiry');
  const btnEmailClient = document.getElementById('btn-email-client');

  // Project CMS Elements
  const projectsAdminGrid = document.getElementById('projects-admin-grid');
  const btnAddProject = document.getElementById('btn-add-project');
  const projectModal = document.getElementById('project-modal');
  const projectModalTitle = document.getElementById('project-modal-title');
  const btnCloseProjectModal = document.getElementById('btn-close-project-modal');
  const btnCancelProject = document.getElementById('btn-cancel-project');
  const projectForm = document.getElementById('project-form');
  const pFormId = document.getElementById('project-form-id');
  const pTitle = document.getElementById('p-title');
  const pCategory = document.getElementById('p-category');
  const pClient = document.getElementById('p-client');
  const pTimeline = document.getElementById('p-timeline');
  const pTools = document.getElementById('p-tools');
  const pDeliverables = document.getElementById('p-deliverables');
  const pImage = document.getElementById('p-image');
  const pImageFile = document.getElementById('p-image-file');
  const pChallenge = document.getElementById('p-challenge');
  const pSolution = document.getElementById('p-solution');

  // Password Modal
  const pwdModal = document.getElementById('pwd-modal');
  const btnClosePwdModal = document.getElementById('btn-close-pwd-modal');
  const btnCancelPwd = document.getElementById('btn-cancel-pwd');
  const changePwdForm = document.getElementById('change-pwd-form');

  // System Diagnostics Elements
  const sysNodeVersion = document.getElementById('sys-node-version');
  const sysPlatform = document.getElementById('sys-platform');
  const sysUptime = document.getElementById('sys-uptime');
  const sysMemory = document.getElementById('sys-memory');

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    let icon = '✨';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --------------------------------------------------------------------------
  // API HELPER & ORIGIN RESOLVER
  // --------------------------------------------------------------------------
  const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '5000' ? '' : 'http://localhost:5000')
    : (window.location.hostname.includes('onrender.com') ? '' : 'https://teju-test-with-backend-nodejs.onrender.com');

  function resolveMediaUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    const clean = url.startsWith('/') ? url : `/${url}`;
    return API_BASE ? `${API_BASE}${clean}` : clean;
  }

  async function apiCall(endpoint, options = {}) {
    const headers = options.headers || {};
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    try {
      const res = await fetch(targetUrl, { ...options, headers });
      const data = await res.json();

      if (res.status === 401) {
        logout('Session expired. Please log in again.');
        throw new Error(data.message || 'Session expired');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Server request failed');
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION & SESSION LIFECYCLE
  // --------------------------------------------------------------------------
  async function checkSession() {
    if (!state.token) {
      showLoginScreen();
      return;
    }

    try {
      const data = await apiCall('/api/auth/me');
      state.user = data.data.user;
      localStorage.setItem('admin_user', JSON.stringify(state.user));
      showDashboardScreen();
    } catch (err) {
      console.warn('Invalid token session, prompting login', err.message);
      showLoginScreen();
    }
  }

  function showLoginScreen() {
    authScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
  }

  function showDashboardScreen() {
    authScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';

    if (state.user) {
      headerUserName.textContent = state.user.name || 'Admin';
      headerUserAvatar.textContent = (state.user.name || 'A')[0].toUpperCase();
      dropdownUserName.textContent = state.user.name || 'Admin';
      dropdownUserEmail.textContent = state.user.email || 'admin@tejashwini.art';
    }

    // Load initial dashboard datasets
    loadDashboardStats();
    loadInquiries();
    loadProjects();
  }

  function logout(msg = 'Logged out successfully.') {
    state.token = null;
    state.user = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    showLoginScreen();
    showToast(msg, 'info');
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginErrorMsg.style.display = 'none';
      const submitBtn = document.getElementById('login-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Verifying credentials...</span>';

      try {
        const payload = {
          email: loginEmail.value.trim(),
          password: loginPassword.value
        };

        const res = await apiCall('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        state.token = res.data.token;
        state.user = res.data.user;
        localStorage.setItem('admin_token', state.token);
        localStorage.setItem('admin_user', JSON.stringify(state.user));

        showToast(`Welcome back, ${state.user.name}! 🚀`, 'success');
        showDashboardScreen();
      } catch (err) {
        loginErrorMsg.textContent = err.message || 'Login failed. Please verify credentials.';
        loginErrorMsg.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Authenticate Session</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        `;
      }
    });
  }

  // Auto-fill demo button
  if (demoFillBtn) {
    demoFillBtn.addEventListener('click', () => {
      loginEmail.value = 'admin@tejashwini.art';
      loginPassword.value = 'Admin@2025!';
      showToast('⚡ Credentials prefilled', 'info');
    });
  }

  // Password visibility toggle
  if (togglePwdBtn) {
    togglePwdBtn.addEventListener('click', () => {
      const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      loginPassword.setAttribute('type', type);
      togglePwdBtn.textContent = type === 'password' ? '👁' : '🔒';
    });
  }

  // User Dropdown Menu
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });
  }

  document.addEventListener('click', () => {
    if (userDropdown) userDropdown.classList.remove('open');
  });

  if (btnLogout) {
    btnLogout.addEventListener('click', () => logout());
  }

  // --------------------------------------------------------------------------
  // LIVE CLOCK TICKER (IST)
  // --------------------------------------------------------------------------
  function updateClock() {
    if (!headerClock) return;
    const now = new Date();
    const formatted = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    headerClock.textContent = `${formatted} IST`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --------------------------------------------------------------------------
  // TAB NAVIGATION
  // --------------------------------------------------------------------------
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');

      if (targetId === 'tab-projects') loadProjects();
      if (targetId === 'tab-system') loadDashboardStats();
    });
  });

  // --------------------------------------------------------------------------
  // KPI STATS LOADER
  // --------------------------------------------------------------------------
  async function loadDashboardStats() {
    try {
      const data = await apiCall('/api/stats/dashboard');
      const { inquiries, totalProjects, system } = data.data;

      // Update KPI widgets
      statTotalInquiries.textContent = inquiries.totalInquiries.toLocaleString();
      statActiveInquiries.textContent = inquiries.activeInquiries.toLocaleString();
      statPipelineValue.textContent = `₹${inquiries.totalPipelineValue.toLocaleString()}`;
      statTotalProjects.textContent = totalProjects.toLocaleString();
      statNewBadge.textContent = `${inquiries.newInquiries} New`;
      tabInquiryCount.textContent = inquiries.totalInquiries;

      // Update Diagnostics
      if (sysNodeVersion) sysNodeVersion.textContent = system.nodeVersion;
      if (sysPlatform) sysPlatform.textContent = system.platform;
      if (sysUptime) sysUptime.textContent = formatUptime(system.uptimeSeconds);
      if (sysMemory) sysMemory.textContent = `${system.memoryUsageMb.rss} MB`;
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }

  function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
  }

  // --------------------------------------------------------------------------
  // INQUIRIES CRM LOGIC
  // --------------------------------------------------------------------------
  async function loadInquiries() {
    inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="loading-state">Loading inquiries...</td></tr>`;

    try {
      const params = new URLSearchParams({
        page: state.inquiryPage,
        limit: state.inquiryLimit
      });

      if (filterStatus.value !== 'all') params.set('status', filterStatus.value);
      if (filterType.value !== 'all') params.set('project_type', filterType.value);
      if (inquirySearch.value.trim()) params.set('search', inquirySearch.value.trim());

      const res = await apiCall(`/api/inquiries?${params.toString()}`);
      const { inquiries, pagination } = res.data;

      renderInquiriesTable(inquiries);
      renderPagination(pagination);
    } catch (err) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color: var(--accent-pink);">Failed to load inquiries: ${err.message}</td></tr>`;
    }
  }

  function renderInquiriesTable(inquiries) {
    if (!inquiries || inquiries.length === 0) {
      inquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📭</div>
            <p>No project inquiries found matching your filters.</p>
          </td>
        </tr>
      `;
      return;
    }

    inquiriesTableBody.innerHTML = inquiries.map((item) => {
      const budgetFormatted = item.budget > 0 ? `₹${item.budget.toLocaleString()}` : 'Flexible';
      const initial = (item.client_name || 'C')[0].toUpperCase();
      const statusLabel = formatStatus(item.status);
      const submittedDate = formatDate(item.created_at);

      return `
        <tr>
          <td><span class="badge badge-${item.status}">${statusLabel}</span></td>
          <td>
            <div class="client-cell">
              <div class="client-avatar">${initial}</div>
              <div class="client-info">
                <strong>${escapeHtml(item.client_name)}</strong>
                <a href="mailto:${escapeHtml(item.client_email)}">${escapeHtml(item.client_email)}</a>
              </div>
            </div>
          </td>
          <td><span style="color: #fff; font-size: 0.85rem;">${escapeHtml(item.project_type)}</span></td>
          <td style="font-weight: 700; color: #10b981;">${budgetFormatted}</td>
          <td>${escapeHtml(item.timeline || '2-3 Weeks')}</td>
          <td>${submittedDate}</td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm view-inquiry-btn" data-id="${item.id}">
              <span>View Brief</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click listeners to "View Brief" buttons
    document.querySelectorAll('.view-inquiry-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openInquiryModal(id);
      });
    });
  }

  function renderPagination(pagination) {
    if (!pagination || pagination.total === 0) {
      inquiriesPagination.style.display = 'none';
      return;
    }

    inquiriesPagination.style.display = 'flex';
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.total, pagination.page * pagination.limit);
    paginationInfo.textContent = `Showing ${start}-${end} of ${pagination.total} inquiries`;

    btnPrevPage.disabled = pagination.page <= 1;
    btnNextPage.disabled = pagination.page >= pagination.totalPages;
  }

  btnPrevPage.addEventListener('click', () => {
    if (state.inquiryPage > 1) {
      state.inquiryPage--;
      loadInquiries();
    }
  });

  btnNextPage.addEventListener('click', () => {
    state.inquiryPage++;
    loadInquiries();
  });

  // Filter Event Listeners
  filterStatus.addEventListener('change', () => { state.inquiryPage = 1; loadInquiries(); });
  filterType.addEventListener('change', () => { state.inquiryPage = 1; loadInquiries(); });
  btnRefreshInquiries.addEventListener('click', () => { loadInquiries(); loadDashboardStats(); });

  inquirySearch.addEventListener('input', () => {
    clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(() => {
      state.inquiryPage = 1;
      loadInquiries();
    }, 300);
  });

  // CSV Export
  btnExportCsv.addEventListener('click', () => {
    window.location.href = `${API_BASE}/api/inquiries/export/csv?token=${encodeURIComponent(state.token)}`;
    showToast('📥 Downloading CSV report...', 'success');
  });

  // --------------------------------------------------------------------------
  // INQUIRY DETAIL MODAL
  // --------------------------------------------------------------------------
  async function openInquiryModal(id) {
    try {
      state.currentInquiryId = id;
      const res = await apiCall(`/api/inquiries/${id}`);
      const inquiry = res.data;

      modalInquiryClient.textContent = inquiry.client_name;
      modalInquiryEmail.textContent = inquiry.client_email;
      modalInquiryType.textContent = inquiry.project_type;
      modalInquiryBudget.textContent = inquiry.budget > 0 ? `₹${inquiry.budget.toLocaleString()}` : 'Flexible';
      modalInquiryTimeline.textContent = inquiry.timeline || 'Flexible';
      modalInquiryDate.textContent = new Date(inquiry.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      modalInquiryIp.textContent = inquiry.ip_address || 'Internal';
      modalInquiryBrief.textContent = inquiry.project_brief;

      modalInquiryStatusSelect.value = inquiry.status;
      modalInquiryNotes.value = inquiry.notes || '';

      modalInquiryStatusBadge.className = `badge badge-${inquiry.status}`;
      modalInquiryStatusBadge.textContent = formatStatus(inquiry.status);

      const emailSubject = `Re: ${inquiry.project_type || 'Project'} Inquiry - Tejashwini Studio`;
      const emailBody = `Hi ${inquiry.client_name || 'there'},\n\nThank you for reaching out regarding your ${inquiry.project_type || 'creative'} project.\n\nI have reviewed your project brief:\n"${inquiry.project_brief || ''}"\n\nEstimated Timeline: ${inquiry.timeline || 'Flexible'}\nBudget: ${inquiry.budget > 0 ? '₹' + inquiry.budget.toLocaleString() : 'Flexible'}\n\nI'd love to discuss how we can bring this vision to life. Let me know when you're available for a quick chat or call.\n\nWarm regards,\nTejashwini\nCreative Director & Designer\nadmin@tejashwini.art`;

      // Compose Gmail URL directly (opens in new tab)
      btnEmailClient.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inquiry.client_email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      btnEmailClient.target = '_blank';
      btnEmailClient.rel = 'noopener noreferrer';

      inquiryDetailModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function closeInquiryModal() {
    inquiryDetailModal.classList.remove('open');
    document.body.style.overflow = '';
    state.currentInquiryId = null;
  }

  if (btnCloseInquiryModal) btnCloseInquiryModal.addEventListener('click', closeInquiryModal);

  // Save Inquiry status and notes
  if (btnSaveInquiry) {
    btnSaveInquiry.addEventListener('click', async () => {
      if (!state.currentInquiryId) return;
      btnSaveInquiry.disabled = true;
      btnSaveInquiry.textContent = 'Saving...';

      try {
        await apiCall(`/api/inquiries/${state.currentInquiryId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: modalInquiryStatusSelect.value,
            notes: modalInquiryNotes.value.trim()
          })
        });

        showToast('Inquiry status updated successfully', 'success');
        closeInquiryModal();
        loadInquiries();
        loadDashboardStats();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btnSaveInquiry.disabled = false;
        btnSaveInquiry.textContent = 'Save Changes';
      }
    });
  }

  // Delete Inquiry
  if (btnDeleteInquiry) {
    btnDeleteInquiry.addEventListener('click', async () => {
      if (!state.currentInquiryId) return;
      if (!confirm('Are you sure you want to permanently delete this project inquiry?')) return;

      try {
        await apiCall(`/api/inquiries/${state.currentInquiryId}`, { method: 'DELETE' });
        showToast('Inquiry permanently deleted', 'info');
        closeInquiryModal();
        loadInquiries();
        loadDashboardStats();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // --------------------------------------------------------------------------
  // PORTFOLIO PROJECTS CMS LOGIC
  // --------------------------------------------------------------------------
  async function loadProjects() {
    projectsAdminGrid.innerHTML = `<div class="loading-state">Loading portfolio projects...</div>`;

    try {
      const res = await apiCall('/api/projects');
      const projects = res.data;

      if (!projects || projects.length === 0) {
        projectsAdminGrid.innerHTML = `<div class="empty-state">No portfolio projects currently in database.</div>`;
        return;
      }

      projectsAdminGrid.innerHTML = projects.map((p) => {
        return `
          <div class="project-admin-card" data-id="${p.id}">
            <img src="${escapeHtml(resolveMediaUrl(p.image))}" alt="${escapeHtml(p.title)}" class="project-card-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'180\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23161a29\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%2364748b\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\'>Thumbnail</text></svg>'">
            <div class="project-card-body">
              <span class="badge badge-proposal_sent" style="align-self: flex-start; margin-bottom: 0.5rem;">${escapeHtml(p.category)}</span>
              <h4>${escapeHtml(p.title)}</h4>
              <div class="project-card-meta">Client: <strong>${escapeHtml(p.client)}</strong> | ${escapeHtml(p.timeline)}</div>
              <div class="project-card-tools"><strong>Tools:</strong> ${escapeHtml(p.tools)}</div>
              
              <div class="project-card-actions">
                <button class="btn btn-secondary btn-sm edit-project-btn" data-id="${p.id}" style="flex: 1;">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-project-btn" data-id="${p.id}">Delete</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Attach handlers
      document.querySelectorAll('.edit-project-btn').forEach((btn) => {
        btn.addEventListener('click', () => openProjectModal(btn.getAttribute('data-id')));
      });

      document.querySelectorAll('.delete-project-btn').forEach((btn) => {
        btn.addEventListener('click', () => deleteProject(btn.getAttribute('data-id')));
      });

    } catch (err) {
      projectsAdminGrid.innerHTML = `<div class="empty-state" style="color: var(--accent-pink);">Failed to load projects: ${err.message}</div>`;
    }
  }

  // File upload handler for project image
  if (pImageFile) {
    pImageFile.addEventListener('change', async () => {
      const file = pImageFile.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        showToast('Uploading asset...', 'info');
        const res = await apiCall('/api/upload', {
          method: 'POST',
          body: formData
        });
        pImage.value = res.data.url;
        showToast('✓ File uploaded successfully', 'success');
      } catch (err) {
        showToast(`Upload failed: ${err.message}`, 'error');
      }
    });
  }

  // Open Project Modal (Create or Edit)
  async function openProjectModal(id = null) {
    projectForm.reset();
    pFormId.value = '';

    if (id) {
      projectModalTitle.textContent = 'Edit Portfolio Project';
      try {
        const res = await apiCall(`/api/projects/${id}`);
        const p = res.data;
        pFormId.value = p.id;
        pTitle.value = p.title;
        pCategory.value = p.category;
        pClient.value = p.client;
        pTimeline.value = p.timeline;
        pTools.value = p.tools;
        pDeliverables.value = p.deliverables;
        pImage.value = p.image;
        pChallenge.value = p.challenge || '';
        pSolution.value = p.solution || '';
      } catch (err) {
        showToast(err.message, 'error');
        return;
      }
    } else {
      projectModalTitle.textContent = 'Add New Portfolio Project';
    }

    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (btnAddProject) btnAddProject.addEventListener('click', () => openProjectModal());
  if (btnCloseProjectModal) btnCloseProjectModal.addEventListener('click', closeProjectModal);
  if (btnCancelProject) btnCancelProject.addEventListener('click', closeProjectModal);

  // Submit Project Form
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = pFormId.value;
      const saveBtn = document.getElementById('btn-save-project-submit');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const payload = {
        title: pTitle.value.trim(),
        category: pCategory.value.trim(),
        client: pClient.value.trim(),
        timeline: pTimeline.value.trim(),
        tools: pTools.value.trim(),
        deliverables: pDeliverables.value.trim(),
        image: pImage.value.trim(),
        challenge: pChallenge.value.trim(),
        solution: pSolution.value.trim()
      };

      try {
        if (id) {
          await apiCall(`/api/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
          showToast('Project updated successfully', 'success');
        } else {
          await apiCall('/api/projects', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          showToast('New project created and published', 'success');
        }

        closeProjectModal();
        loadProjects();
        loadDashboardStats();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Project';
      }
    });
  }

  async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this portfolio project?')) return;
    try {
      await apiCall(`/api/projects/${id}`, { method: 'DELETE' });
      showToast('Project deleted successfully', 'info');
      loadProjects();
      loadDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // CHANGE PASSWORD MODAL
  // --------------------------------------------------------------------------
  if (btnOpenPwdModal) {
    btnOpenPwdModal.addEventListener('click', () => {
      userDropdown.classList.remove('open');
      changePwdForm.reset();
      pwdModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closePwdModal() {
    pwdModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (btnClosePwdModal) btnClosePwdModal.addEventListener('click', closePwdModal);
  if (btnCancelPwd) btnCancelPwd.addEventListener('click', closePwdModal);

  if (changePwdForm) {
    changePwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const curr = document.getElementById('curr-pwd').value;
      const newP = document.getElementById('new-pwd').value;
      const conf = document.getElementById('confirm-pwd').value;

      if (newP !== conf) {
        showToast('New passwords do not match!', 'error');
        return;
      }

      try {
        await apiCall('/api/auth/change-password', {
          method: 'POST',
          body: JSON.stringify({ currentPassword: curr, newPassword: newP })
        });
        showToast('Password updated successfully! Please keep it secure.', 'success');
        closePwdModal();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // --------------------------------------------------------------------------
  // ESC KEY MODAL CLOSER
  // --------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeInquiryModal();
      closeProjectModal();
      closePwdModal();
    }
  });

  // --------------------------------------------------------------------------
  // FORMATTING HELPERS
  // --------------------------------------------------------------------------
  function formatStatus(status) {
    const map = {
      'new': 'New Brief',
      'in_discussion': 'In Discussion',
      'proposal_sent': 'Proposal Sent',
      'accepted': 'Accepted / Won',
      'completed': 'Completed',
      'archived': 'Archived'
    };
    return map[status] || status;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '--';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize session check on load
  checkSession();
});
