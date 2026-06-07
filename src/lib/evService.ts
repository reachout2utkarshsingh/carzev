import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import { EVModel } from "../types";
import { evModels, updateEvModels } from "../data/evData";

const COLLECTION_NAME = "ev_models";

export async function getAllEVs(): Promise<EVModel[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (querySnapshot.empty) {
      console.log("Firestore ev_models collection is empty. Seeding default data...");
      for (const ev of evModels) {
        await setDoc(doc(db, COLLECTION_NAME, ev.id), ev);
      }
      updateEvModels(evModels);
      return [...evModels];
    }
    const list: EVModel[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as EVModel);
    });
    
    // Sort cars by brand and name to maintain a clean list
    list.sort((a, b) => {
      if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
      return a.name.localeCompare(b.name);
    });

    updateEvModels(list);
    return list;
  } catch (error) {
    console.error("Failed to fetch EVs from Firestore, using static backup:", error);
    return [...evModels];
  }
}

export async function getEVById(id: string): Promise<EVModel | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as EVModel;
    }
    const all = await getAllEVs();
    return all.find(ev => ev.id === id) || null;
  } catch (error) {
    console.error("Failed to fetch EV by ID from Firestore:", error);
    const all = await getAllEVs();
    return all.find(ev => ev.id === id) || null;
  }
}

export async function getFeaturedEVs(): Promise<EVModel[]> {
  const all = await getAllEVs();
  return all.filter(ev => ev.featured);
}

export async function getPopularEVs(): Promise<EVModel[]> {
  const all = await getAllEVs();
  return all.filter(ev => ev.popular);
}

export async function saveEV(ev: EVModel): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTION_NAME, ev.id), ev);
    const all = await getAllEVs();
    updateEvModels(all);
  } catch (error) {
    console.error("Failed to save EV to Firestore:", error);
    throw error;
  }
}

export async function deleteEV(evId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, evId));
    const all = await getAllEVs();
    updateEvModels(all);
  } catch (error) {
    console.error("Failed to delete EV from Firestore:", error);
    throw error;
  }
}

export async function addTestDriveRequest(request: any): Promise<string> {
  const docRef = await addDoc(collection(db, "test_drive_requests"), {
    ...request,
    timestamp: new Date().toISOString()
  });
  return docRef.id;
}

export async function addConsultationRequest(request: any): Promise<string> {
  const docRef = await addDoc(collection(db, "consultation_requests"), {
    ...request,
    timestamp: new Date().toISOString()
  });
  return docRef.id;
}

