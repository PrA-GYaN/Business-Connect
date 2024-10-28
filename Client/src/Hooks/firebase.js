// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBIsMQDunBQZUih7UHhl2m_s9K6UJCumOE",
    authDomain: "final-year-project-e4210.firebaseapp.com",
    projectId: "final-year-project-e4210",
    storageBucket: "final-year-project-e4210.appspot.com",
    messagingSenderId: "822773472210",
    appId: "1:822773472210:web:75b625f1cb57eb7ec2860b",
    measurementId: "G-ED71367YBC"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };