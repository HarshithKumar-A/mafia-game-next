import { initializeApp } from 'firebase/app';
import { getDatabase, } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyB6c1DCp7f_f-ufTLflyWvqayFfYc4Id-I",
    authDomain: "billsplitter-537ad.firebaseapp.com",
    databaseURL: "https://billsplitter-537ad-default-rtdb.firebaseio.com",
    projectId: "billsplitter-537ad",
    storageBucket: "billsplitter-537ad.appspot.com",
    messagingSenderId: "651821715309",
    appId: "1:651821715309:web:bea27585037af4819f1464",
    measurementId: "G-1X6M6RPVEB"
};
// Initialize firebase app.
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app); // Real time db
export const firestore = getFirestore(app); // Initialize Cloud Firestore
export const auth = getAuth(app);