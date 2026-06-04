import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCwd1JtJp__vCdxclw8mZb5djN9WKiwuo",
  authDomain: "carzev-3421b.firebaseapp.com",
  projectId: "carzev-3421b",
  storageBucket: "carzev-3421b.firebasestorage.app",
  messagingSenderId: "949772820767",
  appId: "1:949772820767:web:29dfc5ac842926596b102a",
  measurementId: "G-M568NGH4MH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

