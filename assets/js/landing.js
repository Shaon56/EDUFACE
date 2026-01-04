/* ===========================
   Landing Page JavaScript
   =========================== */

const API_BASE_URL = 'https://eduface-backend.onrender.com/api';

// ===== BACKEND WAKE-UP FEATURE =====
// Keep the backend alive by pinging health endpoint periodically
function initBackendWakeup() {
    // Ping health endpoint to wake up backend if sleeping
    fetch(`${API_BASE_URL}/health`)
        .catch(e => console.log('Backend warming up...'));
    
    // Keep backend alive every 10 minutes
    setInterval(() => {
        fetch(`${API_BASE_URL}/health`)
            .catch(e => console.log('Backend keepalive ping'));
    }, 10 * 60 * 1000); // 10 minutes
}

// Wake up backend before critical operations
async function ensureBackendAwake() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            timeout: 15000
        });
        return response.ok;
    } catch (e) {
        // Backend is likely sleeping, try again after 3 seconds
        console.log('Backend sleeping, waiting to wake up...');
        await new Promise(r => setTimeout(r, 3000));
        try {
            const retryResponse = await fetch(`${API_BASE_URL}/health`);
            return retryResponse.ok;
        } catch (retryE) {
            console.error('Backend still not responding');
            return false;
        }
    }
}

// Initialize wake-up on page load
window.addEventListener('load', () => {
    initBackendWakeup();
    console.log('Backend wake-up service started');
});

// Scroll to Login Section
function scrollToLogin() {
    const loginSection = document.getElementById('login');
    loginSection.scrollIntoView({ behavior: 'smooth' });
}

// Toggle between Login and Register Forms
function toggleForm(formId) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    // Remove active class from all toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected form
    document.getElementById(formId).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    // Validate required fields
    if (!email || !password) {
        showError('login-error', 'Please enter email and password');
        return;
    }

    try {
        // Show loading message for slow backend wake-up
        showError('login-error', '⏳ Checking backend status... Please wait...');
        
        // Ensure backend is awake before attempting login
        const backendReady = await ensureBackendAwake();
        if (!backendReady) {
            showError('login-error', '❌ Backend is not responding. Please try again in a moment.');
            return;
        }
        
        console.log('Logging in...', { email, role });
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                role: role
            })
        });

        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response:', data);

        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_id', data.user.id);
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('user_name', data.user.full_name);

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            showError('login-error', data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.message.includes('Failed to fetch')) {
            showError('login-error', '❌ Cannot connect to server. Make sure backend is running at http://localhost:5000');
        } else {
            showError('login-error', 'Network error. Please check if backend server is running.');
        }
    }
}

// Handle Registration
async function handleRegister(event) {
    event.preventDefault();

    const formData = {
        full_name: document.getElementById('register-name').value,
        student_id: document.getElementById('register-student-id').value,
        email: document.getElementById('register-email').value,
        parent_email: document.getElementById('register-parent-email').value,
        contact_number: document.getElementById('register-contact').value,
        password: document.getElementById('register-password').value
    };

    // Validate required fields
    if (!formData.full_name || !formData.student_id || !formData.email || !formData.parent_email || !formData.contact_number || !formData.password) {
        showError('register-error', 'Please fill in all fields');
        return;
    }

    try {
        // Show loading message for slow backend wake-up
        showError('register-error', '⏳ Checking backend status... Please wait...');
        
        // Ensure backend is awake before attempting registration
        const backendReady = await ensureBackendAwake();
        if (!backendReady) {
            showError('register-error', '❌ Backend is not responding. Please try again in a moment.');
            return;
        }
        
        console.log('Registering user...', formData);
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            // Show success message and redirect to login
            alert('Registration successful! Please login with your credentials.');
            
            // Switch to login form
            toggleForm('login-form');
            
            // Clear register form
            document.getElementById('register-form').reset();
            
            // Clear error messages
            document.getElementById('register-error').classList.remove('show');
        } else {
            showError('register-error', data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message.includes('Failed to fetch')) {
            showError('register-error', '❌ Cannot connect to server. Make sure backend is running at http://localhost:5000');
        } else {
            showError('register-error', 'Network error. Please check if backend server is running.');
        }
    }
}

// Show Error Message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');

    // Hide error after 5 seconds
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

// Prevent form submission on Enter key for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll behavior for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
