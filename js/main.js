/** 
 * Project Hamz swim school digital platform
 * Version :1.0.0(MVP) 
 * Developer:Mark Kalungi
 * Role:Full stack developer and systems architect
 * Stack:Firebae(Auth/Firestore) vanilla Js, css3
 * Buildimg digital solutions for Kampala's rising startups**/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, updateDoc, deleteDoc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHoZn0XbDcFk9-8AjXSZaVk1gNy2Hg-Y4",
  authDomain: "hamz-swim-school.firebaseapp.com",
  projectId: "hamz-swim-school",
  storageBucket: "hamz-swim-school.appspot.com",
  messagingSenderId: "819246835345",
  appId: "1:819246835345:web:40b0966996cc769fa78130",
  measurementId: "G-1L9V0Q9ZP8"
};

initializeApp(firebaseConfig);

const db = getFirestore();
const auth = getAuth();

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

async function loadAvailabilityForClient() {
    const calendarEl = document.getElementById('lesson-calender');
    if (!calendarEl) return;

    const today = new Date();
    const daysToShow = 14;

    try {
        const availabilitySnap = await getDocs(collection(db, 'availability'));
        const modeByDate = {};
        availabilitySnap.forEach((docSnap) => {
            const data = docSnap.data() || {};
            // Backwards compatible: old docs used {status: 'free'|'booked'}
            const mode =
                data.mode ??
                (data.status === 'free' ? 'public' : data.status === 'booked' ? 'solo_booked' : undefined);
            if (typeof mode === 'string') modeByDate[docSnap.id] = mode;
        });

        // Only clear once we know we can render
        calendarEl.innerHTML = '';

        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const key = formatDateKey(d);
            const mode = modeByDate[key] || 'off';
            const ui =
                mode === 'public'
                    ? { className: 'public', label: 'Available' }
                    : mode === 'solo_booked'
                      ? { className: 'booked', label: 'Booked (Solo)' }
                      : mode === 'corporate_only'
                        ? { className: 'corporate', label: 'Corporate only' }
                        : { className: 'off', label: 'Unavailable' };
            const div = document.createElement('div');
            div.className = `calender-cell ${ui.className}`;
            div.textContent = `${d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} - ${ui.label}`;
            calendarEl.appendChild(div);
        }
    } catch (err) {
        console.error('Failed to load availability calendar:', err);
        // Keep the existing placeholder and show an error for debugging
        const msg = document.createElement('p');
        msg.className = 'loading';
        msg.textContent = 'Calendar failed to load (check Firestore rules / console).';
        calendarEl.appendChild(msg);
    }
}

async function initAdminCalendar() {
    const controlsEl = document.getElementById('admin-calender-controls');
    if (!controlsEl) return;

    controlsEl.innerHTML = '<p>Select dates and status</p>';

    const today = new Date();
    const daysToShow = 14;
    let modeByDate = {};
    try {
        const availabilitySnap = await getDocs(collection(db, 'availability'));
        availabilitySnap.forEach((docSnap) => {
            const data = docSnap.data() || {};
            const mode =
                data.mode ??
                (data.status === 'free' ? 'public' : data.status === 'booked' ? 'solo_booked' : undefined);
            if (typeof mode === 'string') modeByDate[docSnap.id] = mode;
        });
    } catch (err) {
        console.error('Failed to load admin availability controls:', err);
        controlsEl.innerHTML += '<p class="loading">Failed to load availability (check Firestore rules / console).</p>';
        return;
    }

    for (let i = 0; i < daysToShow; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const key = formatDateKey(d);
        const mode = modeByDate[key] || 'off';

        const row = document.createElement('div');
        row.className = 'admin-date-row';

        const label = document.createElement('span');
        label.textContent = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

        const select = document.createElement('select');
        select.className = 'admin-mode-select';
        const options = [
            { value: 'off', label: 'Unavailable' },
            { value: 'public', label: 'Public (open for swimmers)' },
            { value: 'solo_booked', label: 'Booked (solo client)' },
            { value: 'corporate_only', label: 'Corporate only' }
        ];
        select.innerHTML = options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('');
        select.value = mode;

        select.addEventListener('change', async () => {
            const newMode = select.value;
            await setDoc(doc(db, 'availability', key), { mode: newMode }, { merge: true });
        });

        row.appendChild(label);
        row.appendChild(select);
        controlsEl.appendChild(row);
    }
}

// 1. DYNAMIC MARQUEE: Pull text and update all pages instantly
export function listenToMarquee() {
    const marqueeContainer = document.getElementById('marquee-text');
    if (marqueeContainer) marqueeContainer.innerHTML = "";
    
    // onSnapshot is "Real-time" - if the admin changes it, the user sees it immediately
    onSnapshot(doc(db, "settings", "marquee"), (doc) => {
        if (doc.exists() && marqueeContainer) {
            marqueeContainer.innerHTML = `<span>${doc.data().text}</span>`;
        }
    });
}

// 2. SHOP LOADER: Pull products and build the HTML grid
export async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    const querySnapshot = await getDocs(collection(db, "products"));
    // Keep any hard-coded products in HTML, only refresh Firestore-rendered ones
    productList.querySelectorAll('[data-dynamic-product="true"]').forEach((el) => el.remove());

    querySnapshot.forEach((doc) => {
        const item = doc.data();
        const imageUrl =
            typeof item.image_url === 'string' &&
            (item.image_url.startsWith('http://') || item.image_url.startsWith('https://')) &&
            !item.image_url.includes('fakepath') &&
            !item.image_url.startsWith('file:')
                ? item.image_url
                : 'imgs/SWIM.png';
        const card = `
            <div class="product-card glass-panel" data-dynamic-product="true">
                <img src="${imageUrl}" alt="${item.name}">
                <div class="product-info">
                    <h3>${item.name}</h3>
                    <p class="price">UGX ${item.price}</p>
                    <p style="font-size: 0.9rem; color: var(--light-gray); margin-bottom: 10px;">${item.description || "Quality swim equipment from Hamz Swim School"}</p>
                    <a href="http://wa.me/256708009153?text=I%20want%20to%20buy%20${encodeURIComponent(item.name)}" 
                       class="btn-shop">Order on WhatsApp</a>
                </div>
            </div>
        `;
        productList.innerHTML += card;
    });
}

// 3. ADMIN: Add a new product
export async function addProduct(name, price, description, imageUrl) {
    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            description: description || "Quality swim equipment from Hamz Swim School",
            image_url: imageUrl,
            createdAt: new Date()
        });
        alert("Product Added Successfully!");
        window.location.reload();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// 4. ADMIN: Update Marquee Text
export async function updateMarqueeText(newText) {
    const marqueeRef = doc(db, "settings", "marquee");
    await updateDoc(marqueeRef, { text: newText });
    alert("Marquee Updated!");
}

// 5. ADMIN: updateMarquee - This gets called by the button onclick
// It gets the text from the input field and passes it to updateMarqueeText()
window.updateMarquee = function() {
    const input = document.getElementById('marquee-input');
    const text = input.value.trim();
    
    if (!text) {
        alert("Please enter some text for the marquee!");
        return;
    }
    
    updateMarqueeText(text);
    input.value = ""; // Clear the input after update
};

// 6. ADMIN: updatePoster - Updates the home page poster/ad
window.updatePoster = async function() {
    const title = document.getElementById('poster-title').value.trim();
    const description = document.getElementById('poster-desc').value.trim();
    const imageUrl = document.getElementById('poster-url').value.trim();

    if (!title || !description || !imageUrl) {
        alert("Please fill in all poster fields and provide an image URL!");
        return;
    }

    try {
        const posterRef = doc(db, "settings", "ad");
        await updateDoc(posterRef, {
            title: title,
            description: description,
            image_url: imageUrl,
            updatedAt: new Date()
        });
        alert("Poster Updated Successfully!");
        // Clear the fields
        document.getElementById('poster-title').value = "";
        document.getElementById('poster-desc').value = "";
        document.getElementById('poster-url').value = "";
    } catch (e) {
        console.error("Error updating poster:", e);
        alert("Error: " + e.message);
    }
};

// 7. ADMIN: Load products for the admin panel
export async function loadAdminProducts() {
    const productList = document.getElementById('admin-product-list');
    if (!productList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productList.innerHTML = "";

        if (querySnapshot.empty) {
            productList.innerHTML = "<p>No products added yet.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const item = doc.data();
            const imageUrl =
                typeof item.image_url === 'string' &&
                (item.image_url.startsWith('http://') || item.image_url.startsWith('https://')) &&
                !item.image_url.includes('fakepath') &&
                !item.image_url.startsWith('file:')
                    ? item.image_url
                    : 'imgs/SWIM.png';
            const card = `
                <div class="product-card" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                    <img src="${imageUrl}" alt="${item.name}" style="max-width: 100px; height: auto;">
                    <h4>${item.name}</h4>
                    <p>UGX ${item.price}</p>
                    <p style="font-size: 0.8rem; color: var(--light-gray); margin: 5px 0;">${item.description || "No description provided"}</p>
                    <button onclick="deleteProduct('${doc.id}')" style="background: red; color: white; padding: 5px 10px; border: none; cursor: pointer;">Delete</button>
                </div>
            `;
            productList.innerHTML += card;
        });
    } catch (e) {
        console.error("Error loading products:", e);
        productList.innerHTML = "<p>Error loading products</p>";
    }
}

// 8. ADMIN: Delete a product
window.deleteProduct = async function(docId) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, "products", docId));
        alert("Product deleted!");
        loadAdminProducts(); // Reload the list
    } catch (e) {
        console.error("Error deleting product:", e);
        alert("Error: " + e.message);
    }
};

// 9. ADMIN: Initialize - Set up form and load products when page loads
export function initializeAdmin() {
    // If this is the admin page, set up the form listener
    const form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop form from reloading page
            
            const name = document.getElementById('prod-name').value.trim();
            const price = document.getElementById('prod-price').value.trim();
            const description = document.getElementById('prod-description').value.trim();
            const imageUrl = document.getElementById('prod-img-url').value.trim();
            
            if (!name || !price || !imageUrl) {
                alert("Please fill in all required fields (name, price, and image URL)!");
                return;
            }

            await addProduct(name, parseInt(price), description, imageUrl);
            document.getElementById('prod-name').value = '';
            document.getElementById('prod-price').value = '';
            document.getElementById('prod-description').value = '';
            document.getElementById('prod-img-url').value = '';
        });
    }
    
    // Load the product list
    loadAdminProducts();
    // Initialize availability controls
    initAdminCalendar();
}

// Run initialization and auth guard
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('login-section');
    const adminContainer = document.querySelector('.admin-container');
    
    if (document.body.classList.contains('admin-body')) {
        if (user) {
            // User is logged in: show dashboard, hide login
            if (loginSection) loginSection.style.display = 'none';
            if (adminContainer) adminContainer.style.display = 'block';
            initializeAdmin();
        } else {
            // User is not logged in: show login, hide dashboard
            if (loginSection) loginSection.style.display = 'block';
            if (adminContainer) adminContainer.style.display = 'none';
        }
    } else {
        // home/shop/services pages
        listenToMarquee();
        loadProducts();
        loadAvailabilityForClient();
    }
});

// Handle login form submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const errorMsg = document.getElementById('login-error');
        
        if (!email || !password) {
            errorMsg.textContent = 'Please fill in all fields.';
            return;
        }
        
        try {
            errorMsg.textContent = '';
            // Try to sign in first
            await signInWithEmailAndPassword(auth, email, password);
            // If successful, onAuthStateChanged will handle the rest
        } catch (error) {
            // If sign in fails, try to create account
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    // If successful, onAuthStateChanged will handle the rest
                } catch (createError) {
                    errorMsg.textContent = 'Error: ' + createError.message;
                }
            } else {
                errorMsg.textContent = 'Error: ' + error.message;
            }
        }
        
        // Clear password field
        document.getElementById('login-password').value = '';
    });
}

// logout button support (if you have one in admin nav)
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            location.reload();
        } catch (err) {
            console.error('Error signing out:', err);
        }
    });
}

//dark mode toggle
const togglebtn = document.getElementById('theme-toggle');
if (togglebtn) {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        togglebtn.checked = true;
    }

    togglebtn.addEventListener('change', () => {
        if (togglebtn.checked) {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Add structured data for SEO
function addStructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "SportsActivityLocation"],
        "name": "Hamz Swim School",
        "description": "Professional swimming lessons, pool maintenance and quality swim equipment in Kampala, Uganda",
        "url": "https://hamz-swim-school.web.app",
        "telephone": "+256708009153",
        "email": "info@hamzswimschool.com",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Kampala",
            "addressCountry": "Uganda"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "0.3476",
            "longitude": "32.5825"
        },
        "openingHours": "Mo-Su 06:00-20:00",
        "priceRange": "UGX 3000-150000",
        "paymentAccepted": "Cash, Mobile Money",
        "category": "Swimming School",
        "servicesOffered": [
            "Swimming Lessons",
            "Pool Maintenance", 
            "Water Treatment",
            "Swim Equipment Sales"
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Swim Equipment",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": "Swim Goggles",
                    "price": "50000",
                    "priceCurrency": "UGX"
                },
                {
                    "@type": "Offer", 
                    "itemOffered": "Swimming Paddles",
                    "price": "80000",
                    "priceCurrency": "UGX"
                }
            ]
        }
    };

    // Create and inject structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);
}

// Add structured data when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addStructuredData);
} else {
    addStructuredData();
}

// Hamburger menu functionality
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const links = navLinks.querySelectorAll('li a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}
