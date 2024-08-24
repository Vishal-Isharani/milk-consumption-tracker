// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIGiXgkDRXC6xucYbRCVrQRt9Up5mAfY8",
  authDomain: "milk-tracker-b5da1.firebaseapp.com",
  projectId: "milk-tracker-b5da1",
  storageBucket: "milk-tracker-b5da1.appspot.com",
  messagingSenderId: "841500949192",
  appId: "1:841500949192:web:1012d429d41ea2c677c3fd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
