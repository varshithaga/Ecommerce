import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBQrvJSZEPINaM9B0MJ_UEwynyQczqJJjk",
    authDomain: "ecommerce-f2632.firebaseapp.com",
    projectId: "ecommerce-f2632",
    storageBucket: "ecommerce-f2632.firebasestorage.app",
    messagingSenderId: "957148101488",
    appId: "1:957148101488:web:512b3d9ebdbfc3f5abedb5"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export default messaging;
