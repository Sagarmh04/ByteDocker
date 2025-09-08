"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import ServiceForm from "./service-form";

interface Service {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  thumbnailUrl?: string;
  hidden?: boolean;
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState<Service | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "services"));
      const list: Service[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Service);
      });
      setServices(list);
    } catch (err: unknown) {
      toast({
        title: "Error fetching services",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (service: Service) => {
    if (!confirm(`Delete service "${service.title}"?`)) return;

    try {
      // Delete thumbnail first if exists
      if (service.thumbnailUrl) {
        try {
          const fileRef = ref(storage, service.thumbnailUrl);
          await deleteObject(fileRef);
        } catch {
          // Skip if file not found
        }
      }

      await deleteDoc(doc(db, "services", service.id));

      toast({ title: "Deleted", description: `${service.title} removed.` });
      fetchServices();
    } catch (err: unknown) {
      toast({
        title: "Error deleting service",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleHideToggle = async (service: Service) => {
    try {
      await updateDoc(doc(db, "services", service.id), {
        hidden: !service.hidden,
      });
      toast({
        title: service.hidden ? "Service unhidden" : "Service hidden",
        description: service.title,
      });
      fetchServices();
    } catch (err: unknown) {
      toast({
        title: "Error updating service",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {loading && <p>Loading services...</p>}
      {!loading && services.length === 0 && <p>No services found.</p>}

      {!loading &&
        services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div>
              <h2 className="font-bold">{service.title}</h2>
              <p className="text-sm text-gray-600">{service.description.slice(0, 80)}...</p>
              {service.hidden && (
                <p className="text-xs text-red-500 mt-1">Hidden</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditService(service)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleHideToggle(service)}
              >
                {service.hidden ? "Unhide" : "Hide"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(service)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}

      <Dialog open={!!editService} onOpenChange={() => setEditService(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editService && (
            <ServiceForm
              onClose={() => {
                setEditService(null);
                fetchServices();
              }}
              // Pre-fill fields in ServiceForm
              initialData={editService}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
