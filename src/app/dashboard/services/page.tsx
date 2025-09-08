// FILE: app/(dashboard)/services/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Component Imports
import { ServicesList } from "@/components/dashboard/services/services-list";
import { ServiceForm } from "@/components/dashboard/services/service-form";

// Firebase Imports
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/services/firebase";
import { v4 as uuidv4 } from "uuid";

// --- ALL FIREBASE LOGIC IS NOW INSIDE THIS FILE ---

// 1. DEFINE THE DATA STRUCTURE
export interface Service {
  id: string;
  title: string;
  alt: string;
  description: string;
  src: string;
}

// 2. DEFINE THE FIRESTORE PATH
const contentDocRef = doc(db, "content", "services");

// 3. DEFINE THE DATA HANDLING FUNCTIONS

/**
 * Fetches the array of services from Firestore.
 */
const getServices = async (): Promise<Service[]> => {
  try {
    const docSnap = await getDoc(contentDocRef);
    if (docSnap.exists()) {
      return docSnap.data().cards || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("FATAL: Error fetching services document:", error);
    toast.error("Fatal error fetching services. Check console.");
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
  if (!imageUrl.includes("firebasorage.googleapis.com")) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("INFO: Failed to delete image (it may have been already removed):", error);
  }
};

/**
 * Adds a new service to the 'cards' array.
 */
const addService = async (
  serviceData: Omit<Service, "id" | "src">,
  imageFile: File
): Promise<void> => {
  const imageUrl = await uploadImage(imageFile);
  const newService: Service = {
    ...serviceData,
    id: uuidv4(),
    src: imageUrl,
  };
  await setDoc(contentDocRef, {
    cards: arrayUnion(newService),
  }, { merge: true });
};

/**
 * Updates an existing service in the 'cards' array.
 */
const updateService = async (
  updatedService: Service,
  newImageFile?: File
): Promise<void> => {
  const currentServices = await getServices();
  const serviceIndex = currentServices.findIndex((s) => s.id === updatedService.id);

  if (serviceIndex === -1) throw new Error("Service not found to update.");

  let finalServiceData = { ...updatedService };

  if (newImageFile) {
    await deleteImage(finalServiceData.src);
    finalServiceData.src = await uploadImage(newImageFile);
  }

  const newServicesArray = currentServices.map((service) =>
    service.id === updatedService.id ? finalServiceData : service
  );

  await updateDoc(contentDocRef, { cards: newServicesArray });
};

/**
 * Deletes a service from the 'cards' array.
 */
const deleteService = async (serviceId: string): Promise<void> => {
    const currentServices = await getServices();
    const serviceToDelete = currentServices.find((s) => s.id === serviceId);

    if (!serviceToDelete) throw new Error("Service to delete was not found.");
    
    await deleteImage(serviceToDelete.src);
    
    const newServicesArray = currentServices.filter((service) => service.id !== serviceId);
    
    await updateDoc(contentDocRef, { cards: newServicesArray });
};


// --- THE MAIN PAGE COMPONENT ---
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    const servicesData = await getServices();
    setServices(servicesData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenCreateDialog = () => {
    setEditingService(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (service: Service) => {
    setEditingService(service);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (service: Service) => {
    setDeletingService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (values: any, imageFile?: File) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingService ? "Updating service..." : "Adding service...");

    try {
      // Deconstruct the values from the form to create a clean data object
      const { title, alt, description } = values;
      const cleanData = { title, alt, description };

      if (editingService) {
        await updateService({ ...editingService, ...cleanData }, imageFile);
        toast.success("Service updated!", { id: toastId });
      } else {
        await addService(cleanData, imageFile as File);
        toast.success("Service added!", { id: toastId });
      }
      setIsFormDialogOpen(false);
      await fetchServices();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;
    const toastId = toast.loading("Deleting service...");
    try {
      await deleteService(deletingService.id);
      toast.success("Service deleted!", { id: toastId });
      await fetchServices();
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete.", { id: toastId });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">Manage the services offered by your company.</p>
          </div>
          <Button onClick={handleOpenCreateDialog}><PlusCircle className="mr-2 h-4 w-4" />Add New Service</Button>
        </div>
        <ServicesList services={services} isLoading={isLoading} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} />
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-black border border-gray-300 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>Fill in the details. All fields are mandatory.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ServiceForm mode={editingService ? "update" : "create"} initialData={editingService ?? undefined} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the service titled "{deletingService?.title}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}