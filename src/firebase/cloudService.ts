import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './config.ts';
import { User, Product, Order, PickupPoint, Campus } from '../types/index.ts';

export async function syncUserToCloud(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync user to Firestore:', err);
  }
}

export async function syncProductToCloud(product: Product): Promise<void> {
  try {
    const prodRef = doc(db, 'products', product.id);
    await setDoc(prodRef, {
      ...product,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync product to Firestore:', err);
  }
}

export async function syncOrderToCloud(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync order to Firestore:', err);
  }
}

export async function syncCampusToCloud(campus: Campus): Promise<void> {
  try {
    const campusRef = doc(db, 'campusConfigs', campus.id);
    await setDoc(campusRef, {
      id: campus.id,
      nameBn: campus.nameBn,
      nameEn: campus.nameEn,
      shortCode: campus.shortCode,
      locationBn: campus.locationBn,
      locationEn: campus.locationEn,
      color: campus.color,
      pickupPoints: campus.pickupPoints,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync campus to Firestore:', err);
  }
}

export async function syncSettingsToCloud(settings: { logoUrl?: string; tagline?: string }): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync settings to Firestore:', err);
  }
}

export async function fetchCloudSettings(): Promise<{ logoUrl?: string; tagline?: string } | null> {
  try {
    const settingsRef = doc(db, 'settings', 'global');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as { logoUrl?: string; tagline?: string };
    }
  } catch (err) {
    console.warn('Failed to fetch settings from Firestore:', err);
  }
  return null;
}

export async function fetchCloudCampuses(): Promise<Campus[]> {
  try {
    const snap = await getDocs(collection(db, 'campusConfigs'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Campus);
    }
  } catch (err) {
    console.warn('Failed to fetch campuses from Firestore:', err);
  }
  return [];
}
