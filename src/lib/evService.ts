import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { EVModel } from "../types";
import { evModels } from "../data/evData";

export async function getAllEVs(): Promise<EVModel[]> {
  return [...evModels];
}

export async function getEVById(id: string): Promise<EVModel | null> {
  return evModels.find(ev => ev.id === id) || null;
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

