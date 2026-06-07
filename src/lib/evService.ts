import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { EVModel } from "../types";
import { evModels, updateEvModels } from "../data/evData";

const LOCAL_STORAGE_KEY = 'carzev_evs';

export function getStoredEVs(): EVModel[] {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const userEVs: EVModel[] = localData ? JSON.parse(localData) : [];
    
    const deletedLocal = localStorage.getItem('carzev_deleted_evs');
    const deletedIds: string[] = deletedLocal ? JSON.parse(deletedLocal) : [];
    
    const merged = [...evModels];
    userEVs.forEach(userEv => {
      const idx = merged.findIndex(ev => ev.id === userEv.id);
      if (idx !== -1) {
        merged[idx] = userEv;
      } else {
        merged.push(userEv);
      }
    });

    return merged.filter(ev => !deletedIds.includes(ev.id));
  } catch (error) {
    console.error("Failed to parse EVs from local storage, returning defaults:", error);
    return [...evModels];
  }
}

export async function getAllEVs(): Promise<EVModel[]> {
  const merged = getStoredEVs();
  updateEvModels(merged);
  return merged;
}

export async function getEVById(id: string): Promise<EVModel | null> {
  const all = await getAllEVs();
  return all.find(ev => ev.id === id) || null;
}

export async function getFeaturedEVs(): Promise<EVModel[]> {
  const all = await getAllEVs();
  return all.filter(ev => ev.featured);
}

export async function getPopularEVs(): Promise<EVModel[]> {
  const all = await getAllEVs();
  return all.filter(ev => ev.popular);
}

export function saveEV(ev: EVModel): void {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingEVs: EVModel[] = localData ? JSON.parse(localData) : [];
    
    const idx = existingEVs.findIndex(item => item.id === ev.id);
    if (idx !== -1) {
      existingEVs[idx] = ev;
    } else {
      existingEVs.push(ev);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingEVs));
    
    // Remove from deleted list if re-added
    const deletedLocal = localStorage.getItem('carzev_deleted_evs');
    if (deletedLocal) {
      const deletedIds: string[] = JSON.parse(deletedLocal);
      const filtered = deletedIds.filter(id => id !== ev.id);
      localStorage.setItem('carzev_deleted_evs', JSON.stringify(filtered));
    }

    const all = getStoredEVs();
    updateEvModels(all);
  } catch (error) {
    console.error("Failed to save EV to local storage:", error);
    throw error; // Propagate to display in UI
  }
}

export function deleteEV(evId: string): void {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingEVs: EVModel[] = localData ? JSON.parse(localData) : [];
    
    const filtered = existingEVs.filter(item => item.id !== evId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    
    const deletedKey = 'carzev_deleted_evs';
    const deletedLocal = localStorage.getItem(deletedKey);
    const deletedIds: string[] = deletedLocal ? JSON.parse(deletedLocal) : [];
    if (!deletedIds.includes(evId)) {
      deletedIds.push(evId);
      localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
    }
    
    const all = getStoredEVs();
    updateEvModels(all);
  } catch (error) {
    console.error("Failed to delete EV:", error);
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

