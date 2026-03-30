/** 
 * Project Hamz swim school digital platform
 * Version :1.0.0(MVP) 
 * Developer:Mark Kalungi
 * Role:Full stack developer and systems architect
 * Stack:Firebae(Auth/Firestore) vanilla Js, css3
 * Buildimg digital solutions for Kampala's rising startups**/
// 1. Import the Firebase functions we need
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();

// 2. Security Check: Protect the Admin Page
// This function runs every time a page loads
export function checkAdminAccess() {
    onAuthStateChanged(auth, (user) => {
        const isProjectAdminPage = window.location.pathname.includes('admin.html');

        if (isProjectAdminPage && !user) {
            // If on admin page but NOT logged in, kick them to home
            console.warn("Unauthorized access attempt. Redirecting...");
            window.location.href = "index.html";
        }
    });
}

// 3. Login Function (Used on the Admin Page)
export function loginAdmin(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Welcome, Coach Mark!");
            showAdminDashboard();
            // Refresh to show the dashboard content
            window.location.reload();
        })
        .catch((error) => {
            alert("Login Failed: " + error.message);
        });
}

// 4. Logout Function
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            showLoginForm();
            window.location.href = "index.html";
        });
    });
}

// 5. UI Functions for Login/Dashboard
export function showLoginForm() {
    const loginSection = document.getElementById('login-section');
    const dashboard = document.getElementById('admin-dashboard');
    if (loginSection) loginSection.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
}

export function showAdminDashboard() {
    const loginSection = document.getElementById('login-section');
    const dashboard = document.getElementById('admin-dashboard');
    if (loginSection) loginSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
}

// 6. Security Check: Protect the Admin Page
// This function runs every time a page loads
export function checkAdminAccess() {
    onAuthStateChanged(auth, (user) => {
        const isProjectAdminPage = window.location.pathname.includes('admin.html');

        if (isProjectAdminPage) {
            if (user) {
                // User is logged in, show dashboard
                showAdminDashboard();
            } else {
                // User not logged in, show login form
                showLoginForm();
            }
        }
    });
}

// 7. Initialize Login Form
export function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            loginAdmin(email, password);
        });
    }
}

// Run the security check immediately
checkAdminAccess();
initLoginForm();