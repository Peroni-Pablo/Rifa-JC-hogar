// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, get, set, remove, onValue, push } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMAKwySDP00Xvth5Cq4QB8xtMLqeJR3lM",
  authDomain: "rifa-jc-hogar-442b7.firebaseapp.com",
  projectId: "rifa-jc-hogar-442b7",
  storageBucket: "rifa-jc-hogar-442b7.firebasestorage.app",
  messagingSenderId: "88498157211",
  appId: "1:88498157211:web:c42fd0614bbf05dc4bb83e",
  databaseURL: "https://rifa-jc-hogar-442b7-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export for use in other scripts
window.firebaseDB = database;
window.firebaseRef = ref;
window.firebaseGet = get;
window.firebaseSet = set;
window.firebaseRemove = remove;
window.firebaseOnValue = onValue;
window.firebasePush = push;
