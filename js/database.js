/** 
 * Project Hamz swim school digital platform
 * Version :1.0.0(MVP) 
 * Developer:Mark Kalungi
 * Role:Full stack developer and systems architect
 * Stack:Firebae(Auth/Firestore) vanilla Js, css3
 * Buildimg digital solutions for Kampala's rising startups**/
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHoZn0XbDcFk9-8AjXSZaVk1gNy2Hg-Y4",
  authDomain: "hamz-swim-school.firebaseapp.com",
  projectId: "hamz-swim-school",
  storageBucket: "hamz-swim-school.appspot.com",
  messagingSenderId: "819246835345",
  appId: "1:819246835345:web:40b0966996cc769fa78130",
  measurementId: "G-1L9V0Q9ZP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, updateDoc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

// 1. DYNAMIC MARQUEE: Pull text and update all pages instantly
export function listenToMarquee() {
    const marqueeContainer = document.getElementById('marquee-text');
    
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
    productList.innerHTML = ""; // Clear the "Loading" text

    querySnapshot.forEach((doc) => {
        const item = doc.data();
        const card = `
            <div class="product-card">
                <img src="${item.image_url}" alt="${item.name}">
                <div class="product-info">
                    <h3>${item.name}</h3>
                    <p class="price">UGX ${item.price}</p>
                    <a href="https://wa.me/256XXXXXXXXX?text=I%20want%20to%20buy%20${encodeURIComponent(item.name)}" 
                       class="btn-shop">Order on WhatsApp</a>
                </div>
            </div>
        `;
        productList.innerHTML += card;
    });
}

// 3. ADMIN: Add a new product
export async function addProduct(name, price, imageUrl) {
    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
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