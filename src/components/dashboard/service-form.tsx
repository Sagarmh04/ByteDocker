"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, storage } from "@/services/firebase";

interface ServiceFormProps {
  onClose: () => void;
}

interface ServiceFormProps {
  onClose: () => void;
  initialData?: {
    id: string;
    title: string;
    shortTitle: string;
    description: string;
    thumbnailUrl?: string;
    initialData?: {
      id: string;
      title: string;
      shortTitle: string;
      description: string;
      thumbnailUrl?: string;
    };
  };
}




export default function ServiceForm({ onClose, initialData }: ServiceFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [shortTitle, setShortTitle] = useState(initialData?.shortTitle || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    const newErrors: Record<string, string> = {};

    if (!title) newErrors.title = "Title is required.";
    else if (title.length > 30)
      newErrors.title = "Title must be at most 30 characters.";

    if (!shortTitle) newErrors.shortTitle = "Short title is required.";
    else {
      const existing = await getDoc(doc(db, "services", shortTitle));
      if (existing.exists())
        newErrors.shortTitle = "Short title must be unique.";
    }

    if (!description) newErrors.description = "Description is required.";
    else if (description.length > 1000000) {
      // Firestore string max ~1MB
      newErrors.description = "Description is too long.";
    }

    if (!thumbnail) newErrors.thumbnail = "Thumbnail is required.";
    else {
      // validate portrait
      const img = await fileToImage(thumbnail);
      if (img.width >= img.height) {
        newErrors.thumbnail = "Only portrait images allowed.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const isValid = await validate();
    if (!isValid) {
      setLoading(false);
      return;
    }

    if (initialData) {
  // update mode
  let url = initialData.thumbnailUrl || "";
  if (thumbnail) {
    try {
      // delete old image if exists
      if (initialData.thumbnailUrl) {
        const oldRef = ref(storage, initialData.thumbnailUrl);
        await deleteObject(oldRef);
      }
    } catch {
      // skip if not found
    }

    const fileRef = ref(storage, `services/${shortTitle}-${Date.now()}`);
    await uploadBytes(fileRef, thumbnail);
    url = await getDownloadURL(fileRef);
  }

  await setDoc(
    doc(db, "services", initialData.id),
    {
      title,
      shortTitle,
      description,
      thumbnailUrl: url,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  toast({ title: "Service updated", description: title });
} else {
    try {
      let url = "";
      if (thumbnail) {
        const fileRef = ref(storage, `services/${shortTitle}-${Date.now()}`);
        await uploadBytes(fileRef, thumbnail);
        url = await getDownloadURL(fileRef);
      }

      await setDoc(doc(db, "services", shortTitle), {
        title,
        shortTitle,
        description,
        thumbnailUrl: url,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Service created",
        description: `${title} has been added.`,
      });

      onClose();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
}
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4 border">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={30}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <Label htmlFor="shortTitle">Short Title (Doc ID)</Label>
        <Input
          id="shortTitle"
          value={shortTitle}
          onChange={(e) => setShortTitle(e.target.value)}
        />
        {errors.shortTitle && (
          <p className="text-sm text-red-500">{errors.shortTitle}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <Label htmlFor="thumbnail">Thumbnail</Label>
        <Input
          id="thumbnail"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setThumbnail(file);
          }}
        />
        {errors.thumbnail && (
          <p className="text-sm text-red-500">{errors.thumbnail}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          type="button"
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
