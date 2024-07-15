// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvtuXM0kTzih0LCGhDAFvbCWBcYhlCeIw",
    authDomain: "video-36f9a.firebaseapp.com",
    projectId: "video-36f9a",
    storageBucket: "video-36f9a.appspot.com",
    messagingSenderId: "467891614866",
    appId: "1:467891614866:web:cde3005bf0142ead83e24b",
    measurementId: "G-JQWXYL80GG"
  };

  // Initialize Firebase
export const app = initializeApp(firebaseConfig);

// import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
// import { collection, getDocs, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
// import { app } from '../../../server/firebaseserver';

// const db = getFirestore(app);

// async function getData(){
//     const data = collection(db, "idk");
//     const docs = await getDocs(data);
//     const d = docs.docs.map(d => d.data());
//     return d;
// }
// console.log(getData());