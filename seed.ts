import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { evModels } from "./src/data/evData";

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
const db = getFirestore(app);

async function seed() {
  console.log(`Starting to seed ${evModels.length} EV models...`);
  for (const ev of evModels) {
    await setDoc(doc(db, "ev_models", ev.id), ev);
    console.log(`✅ Seeded: ${ev.name}`);
  }
  console.log("🎉 All done!");
}

seed().catch(err => {
  console.error("❌ Error seeding:", err);
});
