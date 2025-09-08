// FILE: app/(dashboard)/clients/page.tsx
// All logic, all components, everything is in this one file.

"use client";

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react";

// UI Component Imports - These are the only external dependencies
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Firebase Imports
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/services/firebase";
import { v4 as uuidv4 } from "uuid";

// ===================================================================================
// 1. DATA STRUCTURE DEFINITIONS
// ===================================================================================
export interface Client {
  id: string;
  companyName: string;
  description: string;
  feedback: {
    message: string;
    rating: number;
  };
  imageUrl: string;
  industry: string;
  logoUrl: string;
  product: string;
  scopeOfWork: string;
}

// FIX: Create an explicit type for the form data to eliminate 'any'
interface ClientFormData {
  companyName: string;
  industry: string;
  product: string;
  scopeOfWork: string;
  description: string;
  feedback: {
    message: string;
    rating: number;
  };
}

// ===================================================================================
// 2. CLIENT CARD COMPONENT (SIMPLE UI)
// ===================================================================================
interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0">
              <Image src={client.logoUrl} alt={`${client.companyName} logo`} fill className="object-contain"/>
            </div>
            <div>
              <CardTitle>{client.companyName}</CardTitle>
              <CardDescription>{client.industry}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(client)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(client)} className="text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="aspect-video relative w-full overflow-hidden rounded-md border">
          <Image src={client.imageUrl} alt={client.product} fill className="object-cover" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{client.description}</p>
      </CardContent>
    </Card>
  );
}

// ===================================================================================
// 3. CLIENTS LIST COMPONENT (SIMPLE UI)
// ===================================================================================
interface ClientsListProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

function ClientsList({ clients, isLoading, onEdit, onDelete }: ClientsListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Clients...</p>
      </div>
    );
  }
  if (clients.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed py-16 text-center">
        <h3 className="text-xl font-semibold">No Clients Found</h3>
        <p className="mt-2">Click Add New Client to get started.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

// ===================================================================================
// 4. CLIENT FORM COMPONENT (BRUTE-FORCE, NO ZOD, NO REACT-HOOK-FORM)
// ===================================================================================
interface ClientFormProps {
  mode: "create" | "update";
  initialData?: Client;
  // FIX: Use the explicit ClientFormData type instead of 'any'
  onSubmit: (formData: ClientFormData, logoFile?: File, imageFile?: File) => Promise<void>;
  isSubmitting: boolean;
}

function ClientForm({ mode, initialData, onSubmit, isSubmitting }: ClientFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [product, setProduct] = useState(initialData?.product || "");
  const [scopeOfWork, setScopeOfWork] = useState(initialData?.scopeOfWork || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [feedbackMessage, setFeedbackMessage] = useState(initialData?.feedback.message || "");
  const [feedbackRating, setFeedbackRating] = useState(initialData?.feedback.rating || 5);

  const [logoFile, setLogoFile] = useState<File | undefined>();
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'logo' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'logo') {
          setLogoPreview(event.target?.result as string);
          setLogoFile(file);
        } else {
          setImagePreview(event.target?.result as string);
          setImageFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!companyName || !industry || !product || !scopeOfWork || !description || !feedbackMessage || !feedbackRating) {
      toast.error("All text fields are mandatory.");
      return;
    }
    if (mode === 'create' && (!logoFile || !imageFile)) {
      toast.error("Both a logo and a main image are required for a new client.");
      return;
    }
    if (feedbackRating < 1 || feedbackRating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }

    const formData: ClientFormData = {
      companyName,
      industry,
      product,
      scopeOfWork,
      description,
      feedback: {
        message: feedbackMessage,
        rating: Number(feedbackRating),
      },
    };
    
    onSubmit(formData, logoFile, imageFile);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="text-sm font-medium">Company Name</label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={mode === 'update'} /></div>
        <div><label className="text-sm font-medium">Industry</label><Input value={industry} onChange={(e) => setIndustry(e.target.value)} /></div>
        <div><label className="text-sm font-medium">Product / Service Delivered</label><Input value={product} onChange={(e) => setProduct(e.target.value)} /></div>
        <div><label className="text-sm font-medium">Scope of Work</label><Input value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium">Project Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Client Feedback</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3"><label className="text-sm font-medium">Feedback Message</label><Textarea value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} rows={4} /></div>
          <div><label className="text-sm font-medium">Rating (1-5)</label><Input type="number" value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} /></div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="text-sm font-medium">Company Logo</label>
          {logoPreview && <div className="mt-2 mb-4 relative h-32 w-full border rounded-md"><Image src={logoPreview} alt="Logo preview" fill className="object-contain p-2"/></div>}
          <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
        </div>
        <div>
          <label className="text-sm font-medium">Main Project Image</label>
          {imagePreview && <div className="mt-2 mb-4 aspect-video relative w-full border rounded-md"><Image src={imagePreview} alt="Image preview" fill className="object-cover"/></div>}
          <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Add Client" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// ===================================================================================
// 5. MAIN PAGE COMPONENT (DEFAULT EXPORT)
// ===================================================================================
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // --- BRUTE-FORCE FIREBASE LOGIC ---

  const generateId = (companyName: string) => companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const uploadImage = async (file: File, path: string): Promise<string> => { const storageRef = ref(storage, `${path}/${uuidv4()}-${file.name}`); await uploadBytes(storageRef, file); return getDownloadURL(storageRef); };
  const deleteImage = async (imageUrl: string) => { if (!imageUrl.includes("firebasestorage.googleapis.com")) return; try { const imageRef = ref(storage, imageUrl); await deleteObject(imageRef); } catch (error) { console.error("INFO: Failed to delete image:", error); } };

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const clientsData: Client[] = [];
      querySnapshot.forEach(doc => {
        clientsData.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientsData);
    } catch (error) {
      toast.error("Could not fetch clients.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // --- UI ACTION HANDLERS ---
  
  const handleOpenCreateDialog = () => { setEditingClient(null); setIsFormDialogOpen(true); };
  const handleOpenEditDialog = (client: Client) => { setEditingClient(client); setIsFormDialogOpen(true); };
  const handleOpenDeleteDialog = (client: Client) => { setDeletingClient(client); setIsDeleteDialogOpen(true); };

  // FIX: Parameter `formData` now has the explicit `ClientFormData` type
  const handleFormSubmit = async (formData: ClientFormData, logoFile?: File, imageFile?: File) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingClient ? "Updating client..." : "Adding client...");
    try {
      if (editingClient) {
        // UPDATE LOGIC
        const docRef = doc(db, "clients", editingClient.id);
        let logoUrl = editingClient.logoUrl;
        let imageUrl = editingClient.imageUrl;
        if (logoFile) {
          await deleteImage(editingClient.logoUrl);
          logoUrl = await uploadImage(logoFile, "client-logos");
        }
        if (imageFile) {
          await deleteImage(editingClient.imageUrl);
          imageUrl = await uploadImage(imageFile, "client-images");
        }
        await updateDoc(docRef, { ...formData, logoUrl, imageUrl });
        toast.success("Client updated!", { id: toastId });
      } else {
        // ADD LOGIC
        const id = generateId(formData.companyName);
        const docRef = doc(db, "clients", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) throw new Error(`Client "${formData.companyName}" already exists.`);

        const logoUrl = await uploadImage(logoFile!, "client-logos");
        const imageUrl = await uploadImage(imageFile!, "client-images");
        const newClient = { ...formData, id, logoUrl, imageUrl };
        await setDoc(docRef, newClient);
        toast.success("Client added!", { id: toastId });
      }
      setIsFormDialogOpen(false);
      await fetchClients();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClient) return;
    const toastId = toast.loading("Deleting client...");
    try {
      await deleteImage(deletingClient.logoUrl);
      await deleteImage(deletingClient.imageUrl);
      await deleteDoc(doc(db, "clients", deletingClient.id));
      toast.success("Client deleted!", { id: toastId });
      await fetchClients();
    } catch (error) {
      toast.error("Failed to delete client.", { id: toastId });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p>Manage your client portfolio and testimonials.</p>
          </div>
          <Button onClick={handleOpenCreateDialog}><PlusCircle className="mr-2 h-4 w-4" />Add New Client</Button>
        </div>
        <ClientsList clients={clients} isLoading={isLoading} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} />
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl bg-white dark:bg-black border border-gray-300 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>Fill in all client details. All fields are mandatory.</DialogDescription>
          </DialogHeader>
          <div className="py-4 pr-6 max-h-[80vh] overflow-y-auto">
            <ClientForm mode={editingClient ? "update" : "create"} initialData={editingClient ?? undefined} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the client {deletingClient?.companyName}.</AlertDialogDescription>
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