/* ===========================
   EDUFACE Dashboard - Modern JS
   Premium Student Dashboard UI
   =========================== */

// API Configuration
const API_BASE_URL = 'https://eduface-backend.onrender.com/api';
// const API_BASE_URL = 'http://localhost:5000/api';

/* ===========================
   Initialization
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize everything
    checkAuth();
    setupMobileNavigation();
    setupPageNavigation();
    loadUserInfo();
    updateTimeDisplay();
    initBackendWakeup();
    
    // Load first page
    showPage('home');
    loadDashboardData();
    
    // Setup periodic updates
    setInterval(updateTimeDisplay, 60000); // Update time every minute
});

/* ===========================
   Authentication
   =========================== */

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    window.location.href = 'index.html';
}

/* ===========================
   Backend Keepalive
   =========================== */

function initBackendWakeup() {
    // Ping health endpoint immediately
    fetch(`${API_BASE_URL}/health`)
        .catch(() => console.log('🌙 Backend warming up...'));
    
    // Keep backend alive every 10 minutes
    setInterval(() => {
        fetch(`${API_BASE_URL}/health`)
            .catch(() => console.log('💚 Backend keepalive ping'));
    }, 10 * 60 * 1000);
}

/* ===========================
   Navigation Setup
   =========================== */

function setupMobileNavigation() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close');

    if (!toggle) return;

    // Toggle sidebar
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        toggle.classList.toggle('active');
    });

    // Close sidebar
    closeBtn?.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
    });

    // Close sidebar when clicking overlay
    overlay?.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
    });
}

function setupPageNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const page = item.getAttribute('data-page');
            const page_title = getPageTitle(page);
            
            // Update sidebar
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Update bottom nav
            document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector(`.bottom-nav-item[data-page="${page}"]`)?.classList.add('active');
            
            // Update page title
            document.getElementById('page-title').textContent = page_title;
            
            // Close mobile sidebar
            closeMobileSidebar();
            
            // Show page
            showPage(page);
        });
    });

    // Bottom navigation
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const page = item.getAttribute('data-page');
            const page_title = getPageTitle(page);
            
            // Update sidebars
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
            
            document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Update page title
            document.getElementById('page-title').textContent = page_title;
            
            // Show page
            showPage(page);
        });
    });

    // Header menu for admin
    const headerMenuBtn = document.getElementById('header-menu-btn');
    const headerMenuDropdown = document.getElementById('header-menu-dropdown');
    
    headerMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        headerMenuDropdown?.style.display = 
            headerMenuDropdown?.style.display === 'none' ? 'block' : 'none';
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        if (headerMenuDropdown) {
            headerMenuDropdown.style.display = 'none';
        }
    });

    // Header menu items
    document.querySelectorAll('.header-menu-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            const page_title = getPageTitle(page);
            
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
            
            document.getElementById('page-title').textContent = page_title;
            headerMenuDropdown.style.display = 'none';
            
            showPage(page);
        });
    });
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('mobile-nav-toggle');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
    }
}

function getPageTitle(page) {
    const titles = {
        'home': 'Dashboard',
        'profile': 'Profile',
        'routine': 'Weekly Routine',
        'attendance': 'Attendance',
        'results': 'Results',
        'admin-users': 'User Management',
        'admin-routine': 'Manage Routine',
        'admin-attendance': 'Attendance Control'
    };
    return titles[page] || 'Dashboard';
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
    }
}

/* ===========================
   User Information
   =========================== */

async function loadUserInfo() {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    const userName = localStorage.getItem('user_name');
    const userInitial = (userName || 'A').charAt(0).toUpperCase();

    // Update sidebar user info
    document.getElementById('sidebar-user-name').textContent = userName || 'User';
    document.getElementById('sidebar-user-role').textContent = userRole ? 
        userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Student';
    document.getElementById('user-avatar').textContent = userInitial;

    // Update profile avatar
    document.getElementById('profile-avatar').textContent = userInitial;
    document.getElementById('profile-display-name').textContent = userName || 'User';

    // Show admin menu if admin
    if (userRole === 'admin') {
        document.getElementById('admin-nav-section').style.display = 'block';
        document.getElementById('admin-edit-section').style.display = 'block';
        document.getElementById('admin-routine-section').style.display = 'block';
        document.getElementById('admin-result-section').style.display = 'block';
        document.getElementById('admin-result-action-header').style.display = 'table-cell';
        
        // Show admin items in header menu
        document.querySelectorAll('.header-menu-item[data-page]').forEach(item => {
            item.style.display = 'block';
        });
    }

    // Load all data
    loadProfile();
    loadRoutine();
    loadAttendance();
    loadResults();
}

/* ===========================
   Time Display
   =========================== */

function updateTimeDisplay() {
    const now = new Date();
    const hour = now.getHours();
    
    let timeText = 'Just now';
    if (hour < 12) timeText = 'Good morning';
    else if (hour < 18) timeText = 'Good afternoon';
    else timeText = 'Good evening';
    
    document.getElementById('time-display').textContent = timeText;
    
    // Update welcome message
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    document.getElementById('welcome-message').textContent = dateStr;
}

/* ===========================
   Dashboard Data Loading
   =========================== */

async function loadDashboardData() {
    try {
        const userId = localStorage.getItem('user_id');
        const token = getAuthToken();

        // Load attendance for stats
        const attendanceRes = await fetch(`${API_BASE_URL}/attendance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const attendanceData = await attendanceRes.json();

        if (Array.isArray(attendanceData)) {
            if (attendanceData.length > 0) {
                // Calculate attendance stats
                const totalRecords = attendanceData.length;
                const presentCount = attendanceData.filter(r => 
                    (r.Status || r.status || '').toLowerCase() === 'present'
                ).length;
                const attendanceRate = Math.round((presentCount / totalRecords) * 100);
                
                document.getElementById('attendance-rate').textContent = `${attendanceRate}%`;
                
                // Show recent attendance
                const recentAttendance = attendanceData.slice(0, 5);
                const attendanceList = document.getElementById('recent-attendance');
                attendanceList.innerHTML = '';
                
                recentAttendance.forEach(record => {
                    const subject = record.Subject || record.subject || 'N/A';
                    const status = record.Status || record.status || 'Unknown';
                    const isPresent = status.toLowerCase() === 'present';
                    
                    const html = `
                        <div class="attendance-item">
                            <div>
                                <div class="attendance-item-subject">${subject}</div>
                                <div class="attendance-item-date">Today</div>
                            </div>
                            <div class="attendance-item-status ${isPresent ? '' : 'absent'}">
                                ${isPresent ? '✓ Present' : '✗ Absent'}
                            </div>
                        </div>
                    `;
                    attendanceList.innerHTML += html;
                });
            }
        }

        // Load results for average grade
        const resultsRes = await fetch(`${API_BASE_URL}/results`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const resultsData = await resultsRes.json();

        if (Array.isArray(resultsData) && resultsData.length > 0) {
            const marks = resultsData
                .map(r => parseInt(r.Marks || r.marks || 0))
                .filter(m => m > 0);
            
            if (marks.length > 0) {
                const avgMark = Math.round(marks.reduce((a, b) => a + b) / marks.length);
                const grade = getGradeFromMarks(avgMark);
                document.getElementById('avg-grade').textContent = grade;
            }
        }

        document.getElementById('classes-today').textContent = '2-3'; // Placeholder
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function getGradeFromMarks(marks) {
    if (marks >= 90) return 'A+';
    if (marks >= 85) return 'A';
    if (marks >= 80) return 'B+';
    if (marks >= 75) return 'B';
    if (marks >= 70) return 'C';
    if (marks >= 60) return 'D';
    return 'F';
}

/* ===========================
   Profile Functions
   =========================== */

async function loadProfile() {
    try {
        const userId = localStorage.getItem('user_id');
        const token = getAuthToken();

        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load profile');
        const user = await res.json();

        // Display profile with field mapping
        const fullName = user['Full Name'] || user.full_name || user['full name'] || 'N/A';
        const studentId = user['Student ID'] || user.student_id || user['student_id'] || 'N/A';
        const email = user.Email || user.email || 'N/A';
        const parentEmail = user['Parent Email'] || user.parent_email || user['parent email'] || 'N/A';
        const contact = user['Contact'] || user.contact || 'N/A';

        document.getElementById('profile-name').value = fullName;
        document.getElementById('profile-student-id').value = studentId;
        document.getElementById('profile-email').value = email;
        document.getElementById('profile-parent-email').value = parentEmail;
        document.getElementById('profile-contact').value = contact;
        document.getElementById('profile-display-id').textContent = `Student ID: ${studentId}`;

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function enableProfileEdit() {
    document.querySelectorAll('#profile-page .form-input').forEach(input => {
        input.removeAttribute('readonly');
    });
    document.getElementById('edit-profile-btn').style.display = 'none';
    document.getElementById('save-profile-btn').style.display = 'inline-block';
    document.getElementById('cancel-profile-btn').style.display = 'inline-block';
}

function disableProfileEdit() {
    document.querySelectorAll('#profile-page .form-input').forEach(input => {
        input.setAttribute('readonly', '');
    });
    document.getElementById('edit-profile-btn').style.display = 'inline-block';
    document.getElementById('save-profile-btn').style.display = 'none';
    document.getElementById('cancel-profile-btn').style.display = 'none';
}

async function saveProfileChanges() {
    try {
        const userId = localStorage.getItem('user_id');
        const token = getAuthToken();

        const updateData = {
            'Full Name': document.getElementById('profile-name').value,
            'Email': document.getElementById('profile-email').value,
            'Parent Email': document.getElementById('profile-parent-email').value,
            'Contact': document.getElementById('profile-contact').value
        };

        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!res.ok) throw new Error('Failed to update profile');

        alert('Profile updated successfully!');
        disableProfileEdit();
        loadProfile();

    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error updating profile');
    }
}

/* ===========================
   Routine Functions
   =========================== */

async function loadRoutine() {
    try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/routines`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load routines');
        const routines = await res.json();

        setupRoutineNavigation(routines);
        displayRoutineForDay('Monday', routines);

    } catch (error) {
        console.error('Error loading routine:', error);
    }
}

function setupRoutineNavigation(routines) {
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const day = btn.getAttribute('data-day');
            displayRoutineForDay(day, routines);
        });
    });
}

function displayRoutineForDay(day, routines) {
    const filtered = routines.filter(r => (r.Day || r.day) === day);
    const container = document.getElementById('routine-cards');
    
    if (!container) return;

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8;">No classes scheduled for this day</p>';
        return;
    }

    filtered.forEach(routine => {
        const subject = routine.Subject || routine.subject || 'N/A';
        const startTime = routine['Start Time'] || routine.start_time || '00:00';
        const endTime = routine['End Time'] || routine.end_time || '00:00';
        const room = routine.Room || routine.room || 'N/A';
        const instructor = routine.Instructor || routine.instructor || 'TBA';

        const html = `
            <div class="routine-card">
                <h4>${subject}</h4>
                <div class="routine-details">
                    <div class="routine-detail">
                        <strong>Time:</strong>
                        <span>${startTime} - ${endTime}</span>
                    </div>
                    <div class="routine-detail">
                        <strong>Room:</strong>
                        <span>${room}</span>
                    </div>
                    <div class="routine-detail">
                        <strong>Instructor:</strong>
                        <span>${instructor}</span>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

/* ===========================
   Attendance Functions
   =========================== */

async function loadAttendance() {
    try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/attendance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load attendance');
        const data = await res.json();

        displayAttendance(data);

    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

function displayAttendance(data) {
    const container = document.getElementById('attendance-table');
    if (!container) return;

    container.innerHTML = '';

    // Group by subject
    const bySubject = {};
    data.forEach(record => {
        const subject = record.Subject || record.subject || 'Unknown';
        if (!bySubject[subject]) {
            bySubject[subject] = { total: 0, present: 0 };
        }
        bySubject[subject].total++;
        if ((record.Status || record.status || '').toLowerCase() === 'present') {
            bySubject[subject].present++;
        }
    });

    // Display table
    Object.entries(bySubject).forEach(([subject, stats]) => {
        const rate = stats.total > 0 ? 
            Math.round((stats.present / stats.total) * 100) : 0;

        const row = `
            <tr>
                <td>${subject}</td>
                <td class="text-right">${stats.total}</td>
                <td class="text-right">${stats.present}</td>
                <td class="text-right"><strong>${rate}%</strong></td>
            </tr>
        `;
        container.innerHTML += row;
    });
}

/* ===========================
   Results Functions
   =========================== */

async function loadResults() {
    try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/results`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load results');
        const data = await res.json();

        displayResults(data);

    } catch (error) {
        console.error('Error loading results:', error);
    }
}

function displayResults(data) {
    const container = document.getElementById('results-table');
    if (!container) return;

    container.innerHTML = '';

    data.forEach(result => {
        const subject = result.Subject || result.subject || 'N/A';
        const marks = result.Marks || result.marks || 'N/A';
        const grade = result.Grade || result.grade || 'N/A';

        const row = `
            <tr>
                <td>${subject}</td>
                <td class="text-right">${marks}</td>
                <td class="text-right"><strong>${grade}</strong></td>
            </tr>
        `;
        container.innerHTML += row;
    });
}

/* ===========================
   Admin: User Management
   =========================== */

async function loadUsers() {
    try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load users');
        const data = await res.json();

        const container = document.getElementById('users-table');
        if (!container) return;

        container.innerHTML = '';

        data.forEach(user => {
            const name = user['Full Name'] || user.full_name || 'N/A';
            const email = user.Email || user.email || 'N/A';
            const studentId = user['Student ID'] || user.student_id || 'N/A';
            const contact = user.Contact || user.contact || 'N/A';

            const row = `
                <tr>
                    <td>${name}</td>
                    <td>${email}</td>
                    <td>${studentId}</td>
                    <td>${contact}</td>
                    <td class="text-center">
                        <button class="btn-secondary" onclick="editUser('${user.ID || user.id || ''}')">Edit</button>
                    </td>
                </tr>
            `;
            container.innerHTML += row;
        });

    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function handleUserSubmit(event) {
    event.preventDefault();

    try {
        const token = getAuthToken();
        const userData = {
            'Full Name': document.getElementById('user-name-input').value,
            'Student ID': document.getElementById('user-student-id-input').value,
            'Email': document.getElementById('user-email-input').value,
            'Parent Email': document.getElementById('user-parent-email-input').value,
            'Contact': document.getElementById('user-contact-input').value,
            'Password': document.getElementById('user-password-input').value
        };

        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!res.ok) throw new Error('Failed to add user');

        alert('User added successfully!');
        closeUserModal();
        loadUsers();

    } catch (error) {
        console.error('Error adding user:', error);
        alert('Error adding user');
    }
}

/* ===========================
   Admin: Routine Management
   =========================== */

async function loadRoutineAdmin() {
    try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/routines`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load routines');
        const data = await res.json();

        const container = document.getElementById('routine-table');
        if (!container) return;

        container.innerHTML = '';

        data.forEach(routine => {
            const subject = routine.Subject || routine.subject || 'N/A';
            const day = routine.Day || routine.day || 'N/A';
            const startTime = routine['Start Time'] || routine.start_time || '--';
            const endTime = routine['End Time'] || routine.end_time || '--';
            const room = routine.Room || routine.room || 'N/A';
            const instructor = routine.Instructor || routine.instructor || 'TBA';
            const id = routine.ID || routine.id || '';

            const row = `
                <tr>
                    <td>${subject}</td>
                    <td>${day}</td>
                    <td>${startTime} - ${endTime}</td>
                    <td>${room}</td>
                    <td>${instructor}</td>
                    <td class="text-center">
                        <button class="btn-secondary" onclick="deleteRoutine('${id}')">Delete</button>
                    </td>
                </tr>
            `;
            container.innerHTML += row;
        });

    } catch (error) {
        console.error('Error loading admin routines:', error);
    }
}

async function handleRoutineSubmit(event) {
    event.preventDefault();

    try {
        const token = getAuthToken();
        const routineData = {
            'Subject': document.getElementById('routine-subject').value,
            'Day': document.getElementById('routine-day').value,
            'Start Time': document.getElementById('routine-start-time').value,
            'End Time': document.getElementById('routine-end-time').value,
            'Room': document.getElementById('routine-room').value,
            'Instructor': document.getElementById('routine-instructor').value
        };

        const res = await fetch(`${API_BASE_URL}/routines`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(routineData)
        });

        if (!res.ok) throw new Error('Failed to save routine');

        alert('Routine saved successfully!');
        closeRoutineModal();
        loadRoutine();
        loadRoutineAdmin();

    } catch (error) {
        console.error('Error saving routine:', error);
        alert('Error saving routine');
    }
}

async function deleteRoutine(id) {
    if (!confirm('Delete this routine?')) return;

    try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/routines/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to delete routine');

        alert('Routine deleted!');
        loadRoutine();
        loadRoutineAdmin();

    } catch (error) {
        console.error('Error deleting routine:', error);
        alert('Error deleting routine');
    }
}

/* ===========================
   Admin: Results Management
   =========================== */

async function handleResultsSubmit(event) {
    event.preventDefault();

    try {
        const token = getAuthToken();
        const resultsData = {
            'Subject': document.getElementById('results-subject').value,
            'Student ID': document.getElementById('results-student-id').value,
            'Marks': parseInt(document.getElementById('results-marks').value),
            'Grade': document.getElementById('results-grade').value
        };

        const res = await fetch(`${API_BASE_URL}/results`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resultsData)
        });

        if (!res.ok) throw new Error('Failed to save results');

        alert('Results saved successfully!');
        closeResultsModal();
        loadResults();

    } catch (error) {
        console.error('Error saving results:', error);
        alert('Error saving results');
    }
}

/* ===========================
   Modal Functions
   =========================== */

function openRoutineModal() {
    document.getElementById('routine-modal').classList.add('active');
}

function closeRoutineModal() {
    document.getElementById('routine-modal').classList.remove('active');
    document.getElementById('routine-modal').querySelector('form').reset();
}

function openResultsModal() {
    document.getElementById('results-modal').classList.add('active');
}

function closeResultsModal() {
    document.getElementById('results-modal').classList.remove('active');
    document.getElementById('results-modal').querySelector('form').reset();
}

function openUserModal() {
    document.getElementById('user-modal').classList.add('active');
    loadUsers(); // Refresh user list
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
    document.getElementById('user-modal').querySelector('form').reset();
}

// Close modals when clicking backdrop
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal').forEach(modal => {
        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop?.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
});
