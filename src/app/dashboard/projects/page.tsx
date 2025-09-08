// FILE: app/(dashboard)/projects/page.tsx
// All logic, all components, everything is in this one file.

"use client";

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react";

// UI Component Imports
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Firebase Imports
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/services/firebase";
import { v4 as uuidv4 } from "uuid";

// ===================================================================================
// 1. DATA STRUCTURE DEFINITIONS
// ===================================================================================
export interface Project {
  id: string;
  clientName: string;
  description: string;
  imageUrl: string;
  projectType: string;
  year: number;
}

// FIX: Create an explicit type for the form data to eliminate 'any'
interface ProjectFormData {
  clientName: string;
  projectType: string;
  year: number;
  description: string;
}

// ===================================================================================
// 2. PROJECT CARD COMPONENT (SIMPLE UI)
// ===================================================================================
interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{project.clientName}</CardTitle>
            <CardDescription>{project.projectType} - {project.year}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(project)} className="text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="aspect-video relative w-full overflow-hidden rounded-md border">
          <Image src={project.imageUrl} alt={`Image for ${project.clientName} project`} fill className="object-cover" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{project.description}</p>
      </CardContent>
    </Card>
  );
}

// ===================================================================================
// 3. PROJECTS LIST COMPONENT (SIMPLE UI)
// ===================================================================================
interface ProjectsListProps {
  projects: Project[];
  isLoading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectsList({ projects, isLoading, onEdit, onDelete }: ProjectsListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Projects...</p>
      </div>
    );
  }
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed py-16 text-center">
        <h3 className="text-xl font-semibold">No Projects Found</h3>
        <p className="mt-2">Click Add New Project to get started.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

// ===================================================================================
// 4. PROJECT FORM COMPONENT (BRUTE-FORCE, NO ZOD, NO REACT-HOOK-FORM)
// ===================================================================================
interface ProjectFormProps {
  mode: "create" | "update";
  initialData?: Project;
  // FIX: Use the explicit ProjectFormData type instead of 'any'
  onSubmit: (formData: ProjectFormData, imageFile?: File) => Promise<void>;
  isSubmitting: boolean;
}

function ProjectForm({ mode, initialData, onSubmit, isSubmitting }: ProjectFormProps) {
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [projectType, setProjectType] = useState(initialData?.projectType || "");
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [description, setDescription] = useState(initialData?.description || "");
  
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!clientName || !projectType || !year || !description) {
      toast.error("All fields are mandatory.");
      return;
    }
    if (mode === "create" && !imageFile) {
      toast.error("An image is required for a new project.");
      return;
    }

    const formData: ProjectFormData = {
      clientName,
      projectType,
      year: Number(year),
      description,
    };
    
    onSubmit(formData, imageFile);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2"><label className="text-sm font-medium">Client Name</label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} /></div>
        <div><label className="text-sm font-medium">Year</label><Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></div>
      </div>
      <div><label className="text-sm font-medium">Project Type</label><Input value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="e.g., E-commerce Platform" /></div>
      <div><label className="text-sm font-medium">Project Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} /></div>
      
      <div>
        <label className="text-sm font-medium">Project Image</label>
        {imagePreview && <div className="mt-2 mb-4 aspect-video relative w-full border rounded-md"><Image src={imagePreview} alt="Image preview" fill className="object-cover"/></div>}
        <Input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// ===================================================================================
// 5. MAIN PAGE COMPONENT (DEFAULT EXPORT)
// ===================================================================================
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // --- BRUTE-FORCE FIREBASE LOGIC ---

  const uploadImage = async (file: File): Promise<string> => { const storageRef = ref(storage, `projects/${uuidv4()}-${file.name}`); await uploadBytes(storageRef, file); return getDownloadURL(storageRef); };
  const deleteImage = async (imageUrl: string) => { if (!imageUrl.includes("firebasestorage.googleapis.com")) return; try { const imageRef = ref(storage, imageUrl); await deleteObject(imageRef); } catch (error) { console.error("INFO: Failed to delete image:", error); } };

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectsData: Project[] = [];
      querySnapshot.forEach(doc => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
    } catch (error) {
      toast.error("Could not fetch projects.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // --- UI ACTION HANDLERS ---
  
  const handleOpenCreateDialog = () => { setEditingProject(null); setIsFormDialogOpen(true); };
  const handleOpenEditDialog = (project: Project) => { setEditingProject(project); setIsFormDialogOpen(true); };
  const handleOpenDeleteDialog = (project: Project) => { setDeletingProject(project); setIsDeleteDialogOpen(true); };

  // FIX: Parameter `formData` now has the explicit `ProjectFormData` type
  const handleFormSubmit = async (formData: ProjectFormData, imageFile?: File) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingProject ? "Updating project..." : "Adding project...");
    try {
      if (editingProject) {
        // UPDATE LOGIC
        const docRef = doc(db, "projects", editingProject.id);
        let imageUrl = editingProject.imageUrl;
        if (imageFile) {
          await deleteImage(editingProject.imageUrl);
          imageUrl = await uploadImage(imageFile);
        }
        await updateDoc(docRef, { ...formData, imageUrl });
        toast.success("Project updated!", { id: toastId });
      } else {
        // ADD LOGIC
        const id = uuidv4();
        const docRef = doc(db, "projects", id);
        const imageUrl = await uploadImage(imageFile!);
        const newProject = { ...formData, id, imageUrl };
        await setDoc(docRef, newProject);
        toast.success("Project added!", { id: toastId });
      }
      setIsFormDialogOpen(false);
      await fetchProjects();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    const toastId = toast.loading("Deleting project...");
    try {
      await deleteImage(deletingProject.imageUrl);
      await deleteDoc(doc(db, "projects", deletingProject.id));
      toast.success("Project deleted!", { id: toastId });
      await fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project.", { id: toastId });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p>Manage your company project portfolio.</p>
          </div>
          <Button onClick={handleOpenCreateDialog}><PlusCircle className="mr-2 h-4 w-4" />Add New Project</Button>
        </div>
        <ProjectsList projects={projects} isLoading={isLoading} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} />
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-black border border-gray-300 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>Fill in all project details. All fields are mandatory.</DialogDescription>
          </DialogHeader>
          <div className="py-4 pr-6 max-h-[80vh] overflow-y-auto">
            <ProjectForm mode={editingProject ? "update" : "create"} initialData={editingProject ?? undefined} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the project for {deletingProject?.clientName}.</AlertDialogDescription>
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