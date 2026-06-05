import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { EVModel } from "../types";

export async function getAllEVs(): Promise<EVModel[]> {
  const snapshot = await getDocs(collection(db, "ev_models"));
  return snapshot.docs.map(doc => doc.data() as EVModel);
}

export async function getEVById(id: string): Promise<EVModel | null> {
  const snapshot = await getDoc(doc(db, "ev_models", id));
  return snapshot.exists() ? (snapshot.data() as EVModel) : null;
}

export async function getFeaturedEVs(): Promise<EVModel[]> {
  const all = await getAllEVs();
  return all.filter(ev => ev.featured);
}

export async function getPopularEVs(): Promise<EVModel[]> {
  const all = await getAllEVs();
  return all.filter(ev => ev.popular);
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

