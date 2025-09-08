// FILE: lib/services.ts

import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/services/firebase";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod"; // Import Zod

// --- SINGLE SOURCE OF TRUTH FOR SERVICE DATA STRUCTURE ---
// DEFINE AND EXPORT THE SCHEMA HERE
export const serviceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required."),
  alt: z.string().min(1, "Alt text is required."),
  description: z.string().min(1, "Description is required."),
  src: z.string().url("Image URL must be a valid URL."),
});

// Infer the TypeScript type directly from the Zod schema
export type Service = z.infer<typeof serviceSchema>;


// Path to the specific document in Firestore
const contentDocRef = doc(db, "content", "services");

/**
 * Fetches the array of services from Firestore.
 */
export const getServices = async (): Promise<Service[]> => {
  try {
    const docSnap = await getDoc(contentDocRef);
    if (docSnap.exists()) {
      // Validate the fetched data to ensure it matches our schema
      const validatedCards = z.array(serviceSchema).safeParse(docSnap.data().cards);
      if (validatedCards.success) {
        return validatedCards.data;
      } else {
        console.warn("Firestore data validation failed:", validatedCards.error);
        return []; // Return empty array if data is invalid
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Could not fetch services from Firestore.");
  }
};

/**
 * Uploads an image to Firebase Storage and returns the URL.
 */
const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `services/${uuidv4()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

/**
 * Deletes an image from Firebase Storage using its URL.
 */
const deleteImage = async (imageUrl: string) => {
  if (!imageUrl.includes("firebasestorage.googleapis.com")) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Failed to delete old image (it may have already been removed):", error);
  }
};


/**
 * Adds a new service to the 'cards' array.
 */
export const addService = async (
  serviceData: Omit<Service, "id" | "src">,
  imageFile: File
): Promise<void> => {
  const imageUrl = await uploadImage(imageFile);
  const newService: Service = {
    ...serviceData,
    id: uuidv4(),
    src: imageUrl,
  };
  await updateDoc(contentDocRef, {
    cards: arrayUnion(newService),
  }, { merge: true });
};

/**
 * Updates an existing service in the 'cards' array.
 */
export const updateService = async (
  updatedService: Service,
  newImageFile?: File
): Promise<void> => {
  const currentServices = await getServices();
  const serviceIndex = currentServices.findIndex((s) => s.id === updatedService.id);

  if (serviceIndex === -1) {
    throw new Error("Service not found to update.");
  }

  const oldService = currentServices[serviceIndex];
  let finalServiceData = { ...updatedService };

  if (newImageFile) {
    if (oldService.src) {
      await deleteImage(oldService.src);
    }
    const newImageUrl = await uploadImage(newImageFile);
    finalServiceData.src = newImageUrl;
  }

  const newServicesArray = currentServices.map((service) =>
    service.id === updatedService.id ? finalServiceData : service
  );
  
  await updateDoc(contentDocRef, { cards: newServicesArray });
};


/**
 * Deletes a service from the 'cards' array.
 */
export const deleteService = async (serviceId: string): Promise<void> => {
    const currentServices = await getServices();
    const serviceToDelete = currentServices.find((s) => s.id === serviceId);

    if (!serviceToDelete) {
        throw new Error("Service not found for deletion.");
    }
    
    if (serviceToDelete.src) {
      await deleteImage(serviceToDelete.src);
    }
    
    const newServicesArray = currentServices.filter((service) => service.id !== serviceId);
    
    await updateDoc(contentDocRef, { cards: newServicesArray });
};