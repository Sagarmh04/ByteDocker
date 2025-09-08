"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox"
// Firebase imports — adjust path if your firebase client utilities live elsewhere
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/services/firebase";

// UI components (replace with your project's own components if different)
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Input from "@/components/ui/input2";
import { Textarea } from "@/components/ui/textarea";

interface Card {
  id: string;
  title: string;
}

// Types for documents
type CardItem = { id: string; title: string };
type ServiceDetail = {
  id: string;
  title: string;
  src?: string; // thumbnail url
  images?: string[]; // additional images urls
  techStack?: string[]; // array of logo doc ids
  description?: string;
  updatedAt?: number;
};

type LogoItem = {
  id: string;
  title: string;
  url: string;
  type: "url" | "storage";
  storagePath?: string; // only for storage type
};

export default function DetailedPage() {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [serviceDetails, setServiceDetails] = useState<Record<string, ServiceDetail>>({});
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLogoManagerOpen, setIsLogoManagerOpen] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      await fetchCardsAndSync();
      await fetchServiceDetails();
      await fetchLogos();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  // 1) Fetch the content/services document and sync to serviceDetails collection
  async function fetchCardsAndSync() {
    // Read main cards array: content/services -> field: cards (array)
    const contentDocRef = doc(db, "content", "services");
    const contentSnap = await getDoc(contentDocRef);
    if (!contentSnap.exists()) {
      toast.error("Main content/services document not found.");
      setCards([]);
      return;
    }

    const data = contentSnap.data();
    const cardsArr: CardItem[] = Array.isArray(data.cards)
      ? data.cards.map((c: Card) => ({ id: String(c.id), title: String(c.title) }))
      : [];

    setCards(cardsArr);

    // Sync to serviceDetails collection
    const detailsCol = collection(db, "serviceDetails");
    const existingDetailsSnap = await getDocs(detailsCol);
    const existingIds = new Set<string>();
    existingDetailsSnap.forEach((d) => existingIds.add(d.id));

    const cardIds = new Set(cardsArr.map((c) => c.id));

    // Add missing docs
    const batch = writeBatch(db);
    let anyChange = false;
    for (const c of cardsArr) {
      if (!existingIds.has(c.id)) {
        const docRef = doc(db, "serviceDetails", c.id);
        // create a minimal doc—admin will fill details later
        batch.set(docRef, {
          id: c.id,
          title: c.title,
          src: "",
          images: [],
          techStack: [],
          description: "",
          updatedAt: Date.now(),
        });
        anyChange = true;
      } else {
        // Optionally, ensure title is up-to-date
        const docRef = doc(db, "serviceDetails", c.id);
        try {
  batch.update(docRef, { title: c.title, updatedAt: Date.now() });
} catch (err) {
  console.error("Batch update failed:", err);
}
        

      }
    }

    // Delete docs that no longer have a card entry
    for (const existingId of existingIds) {
      if (!cardIds.has(existingId)) {
        const docRef = doc(db, "serviceDetails", existingId);
        batch.delete(docRef);
        anyChange = true;
      }
    }

    if (anyChange) {
      await batch.commit();
    }
  }

  // 2) Fetch serviceDetails into local state
  async function fetchServiceDetails() {
    const q = query(collection(db, "serviceDetails"));
    const snap = await getDocs(q);
    const map: Record<string, ServiceDetail> = {};
    snap.forEach((d) => {
      const data = d.data() as ServiceDetail;
      map[d.id] = { ...data };
    });
    setServiceDetails(map);
  }

  // 3) Fetch logos
  async function fetchLogos() {
    const q = query(collection(db, "logos"));
    const snap = await getDocs(q);
    const arr: LogoItem[] = [];
    snap.forEach((d) => {
      const dt = d.data();
      arr.push({
        id: d.id,
        title: dt.title,
        url: dt.url,
        type: dt.type,
        storagePath: dt.storagePath,
      });
    });
    setLogos(arr);
  }

  // Open editor
  function openEditor(id: string) {
    setEditingId(id);
  }

  // Close editor and refresh
  async function closeEditor(refetch = true) {
    setEditingId(null);
    if (refetch) await fetchServiceDetails();
  }

  // Render list
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Service Details Admin</h2>
        <div className="flex gap-2">
          <Button onClick={() => { setIsLogoManagerOpen(true); }}>Manage Logos</Button>
          <Button onClick={async () => { setLoading(true); try { await fetchCardsAndSync(); await fetchServiceDetails(); toast.success("Sync complete"); } catch(e){toast.error("Sync failed");} finally { setLoading(false); } }}>Sync Now</Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-sm">Loading...</div>}

        {cards.length === 0 && !loading && <div>No cards found in content/services.</div>}

        {cards.map((c) => {
          const detail = serviceDetails[c.id];
          return (
            <div key={c.id} className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-muted-foreground">ID: {c.id}</div>
                <div className="text-sm text-muted-foreground">{detail?.description?.slice(0,100)}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => openEditor(c.id)}>Edit</Button>
                {/* No delete option as requested */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor dialog */}
      {editingId && (
        <EditServiceDialog
          id={editingId}
          onClose={() => closeEditor(true)}
          logos={logos}
          refetchLogos={fetchLogos}
        />
      )}

      {/* Logo manager */}
      {isLogoManagerOpen && (
        <LogoManagerDialog
          onClose={() => { setIsLogoManagerOpen(false); fetchLogos(); }}
          logos={logos}
          refetch={fetchLogos}
        />
      )}
    </div>
  );
}

/* -------------------------------------------
   EditServiceDialog: edit a single serviceDetails doc
   - thumbnail (single, mandatory)
   - additional images (multiple)
   - tech stack (multi-select logos)
   - description (markdown-like, newline allowed, max 500 chars)
-------------------------------------------- */
function EditServiceDialog({ id, onClose, logos, refetchLogos }: { id: string; onClose: () => void; logos: LogoItem[]; refetchLogos: () => Promise<void>; }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ServiceDetail | null>(null);

  // Form state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [addFiles, setAddFiles] = useState<File[]>([]);
  const [addPreviews, setAddPreviews] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [existingImages, setExistingImages] = useState<string[]>([]); // already uploaded additional images
  const [existingThumbnail, setExistingThumbnail] = useState<string | undefined>("");

  useEffect(() => { loadDetail(); /* eslint-disable-next-line */ }, [id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const docRef = doc(db, "serviceDetails", id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        toast.error("Service detail not found.");
        onClose();
        return;
      }
      const data = snap.data() as ServiceDetail;
      setDetail(data);
      setSelectedTech(data.techStack || []);
      setDescription(data.description || "");
      setExistingImages(data.images || []);
      setExistingThumbnail(data.src || "");
      setThumbnailPreview(data.src || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load service detail.");
    } finally {
      setLoading(false);
    }
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    const url = URL.createObjectURL(f);
    setThumbnailPreview(url);
  }

  function handleAddFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fList = Array.from(e.target.files || []);
    setAddFiles((s) => [...s, ...fList]);
    const previews = fList.map((f) => URL.createObjectURL(f));
    setAddPreviews((p) => [...p, ...previews]);
  }

  function toggleTech(logoId: string) {
    setSelectedTech((s) => (s.includes(logoId) ? s.filter((x) => x !== logoId) : [...s, logoId]));
  }

  async function handleRemoveExistingImage(url: string) {
    // simply remove from doc (we won't delete storage file automatically here)
    setExistingImages((s) => s.filter((u) => u !== url));
  }

  // Save handler: must ensure thumbnail exists either as existingThumbnail or newly uploaded thumbnailFile
  async function handleSave() {
    // validation
    if (!existingThumbnail && !thumbnailFile) {
      toast.error("Thumbnail is required.");
      return;
    }
    if (description.length > 500) {
      toast.error("Description exceeds 500 characters.");
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, "serviceDetails", id);
      let thumbnailUrl = existingThumbnail || "";

      // 1) upload thumbnail if new
      if (thumbnailFile) {
        const thumbRef = ref(storage, `services/${id}/thumbnail_${Date.now()}_${thumbnailFile.name}`);
        await uploadBytes(thumbRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }

      // 2) upload additional files and collect urls
      const uploadedUrls: string[] = [];
      for (const f of addFiles) {
        const ar = ref(storage, `services/${id}/images/${Date.now()}_${f.name}`);
        await uploadBytes(ar, f);
        const url = await getDownloadURL(ar);
        uploadedUrls.push(url);
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      // 3) update the doc
      await updateDoc(docRef, {
        src: thumbnailUrl,
        images: finalImages,
        techStack: selectedTech,
        description,
        updatedAt: Date.now(),
      });

      toast.success("Saved");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
<DialogContent className="sm:max-w-lg bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-0">
  <DialogHeader className="px-6 pt-4">
    <DialogTitle>Edit Service — {id}</DialogTitle>
  </DialogHeader>

  {/* Scrollable Body */}
  <div className="max-h-[80vh] overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-700 hover:scrollbar-thumb-neutral-500 dark:hover:scrollbar-thumb-neutral-600">
    <div className="space-y-4 py-2">
  {/* --- Thumbnail --- */}
  <div>
    <label className="block mb-1 font-medium">Thumbnail (required)</label>
    <div className="flex gap-3 items-center">
      {thumbnailPreview ? (
        <div className="w-28 h-36 relative border rounded overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailPreview} alt="thumb" className="object-cover w-full h-full" />
        </div>
      ) : (
        <div className="w-28 h-36 border rounded flex items-center justify-center text-sm">
          No thumbnail
        </div>
      )}
      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
        />
        <div className="text-sm text-muted-foreground mt-1">Single image required.</div>
      </div>
    </div>
  </div>

  {/* --- Additional Images --- */}
  <div>
    <label className="block mb-1 font-medium">Additional images</label>
    <div className="flex gap-2 mb-2">
      {(existingImages ?? []).map((u) => (
        <div key={u} className="w-20 h-20 relative border rounded overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="img" className="object-cover w-full h-full" />
        </div>
      ))}
      {(addPreviews ?? []).map((u, i) => (
        <div key={u + i} className="w-20 h-20 relative border rounded overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="new" className="object-cover w-full h-full" />
        </div>
      ))}
    </div>
    <Input
      type="file"
      accept="image/*"
      multiple
      onChange={handleAddFilesChange}
    />
    <div className="text-sm text-muted-foreground mt-1">Multiple images allowed.</div>

    <div className="mt-2">
      {(existingImages ?? []).length > 0 && (
        <div>
          <div className="text-sm font-medium">Remove existing images</div>
          <div className="flex gap-2 mt-1">
            {(existingImages ?? []).map((u) => (
              <div key={u} className="flex flex-col items-center">
                <div className="w-16 h-16 relative border rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="ex" className="object-cover w-full h-full" />
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => handleRemoveExistingImage(u)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>



<div>
  <label className="block mb-1 font-medium">Tech stack (choose logos)</label>
  <div className="grid grid-cols-3 gap-3">
    {(logos ?? []).map((l) => {
      // Use Firestore doc id OR fall back to title
      const logoId = l.id ?? l.title;

      return (
        <label
          key={logoId}
          className="flex items-center gap-2 border p-2 rounded cursor-pointer"
        >
          <Checkbox
            checked={(selectedTech ?? []).includes(logoId)}
            onCheckedChange={() => toggleTech(logoId)}
          />
          <div className="w-8 h-8 relative overflow-hidden rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={l.url}
              alt={l.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-sm">{l.title}</div>
        </label>
      );
    })}
  </div>
</div>


  {/* --- Description --- */}
  <div>
    <label className="block mb-1 font-medium">
      Description (Markdownish, max 500 chars)
    </label>
    <Textarea
      value={description ?? ""}   // 👈 Always controlled
      onChange={(e) => setDescription(e.target.value)}
      rows={6}
    />
    <div className="text-right text-sm text-muted-foreground">
      {(description ?? "").length} / 500
    </div>
  </div>

  {/* --- Actions --- */}
  <div className="flex justify-end gap-2">
    <Button type="button" onClick={() => onClose()} variant="ghost">
      Cancel
    </Button>
    <Button onClick={handleSave} disabled={loading}>
      {loading ? "Saving..." : "Save"}
    </Button>
  </div>
</div>
</div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------
   LogoManagerDialog
   - list logos from `logos` prop
   - add new logo: either URL or upload
   - remove logo: if `type === 'storage'` delete storage object then remove doc; if `type === 'url'` just remove doc
-------------------------------------------- */
function LogoManagerDialog({ onClose, logos, refetch }: { onClose: () => void; logos: LogoItem[]; refetch: () => Promise<void>; }) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<"url" | "upload">("url");
  const [urlValue, setUrlValue] = useState("");
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [titleValue, setTitleValue] = useState(""); // <-- NEW
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (fileValue) URL.revokeObjectURL(fileValue.name);
    };
  }, [fileValue]);

  async function handleAdd() {
    if (!titleValue.trim()) {
      toast.error("Enter a title for the logo");
      return;
    }
    if (type === "url") {
      if (!urlValue) {
        toast.error("Enter a URL");
        return;
      }
      setLoading(true);
      try {
        const docRef = doc(collection(db, "logos"));
        await setDoc(docRef, {
          url: urlValue,
          type: "url",
          storagePath: "",
          title: titleValue, // <-- Save title
          createdAt: Date.now(),
        });
        toast.success("Logo added (URL).");
        setUrlValue("");
        setTitleValue(""); // <-- Reset
        await refetch();
      } catch (err) {
        console.error(err);
        toast.error("Failed to add logo.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!fileValue) {
        toast.error("Select a file to upload");
        return;
      }
      setLoading(true);
      try {
        const path = `logos/${Date.now()}_${fileValue.name}`;
        const sRef = ref(storage, path);
        await uploadBytes(sRef, fileValue);
        const url = await getDownloadURL(sRef);
        const docRef = doc(collection(db, "logos"));
        await setDoc(docRef, {
          url,
          type: "storage",
          storagePath: path,
          title: titleValue, // <-- Save title
          createdAt: Date.now(),
        });
        toast.success("Logo uploaded and added.");
        setFileValue(null);
        setTitleValue(""); // <-- Reset
        await refetch();
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload logo.");
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleDelete(logo: LogoItem) {
    setLoading(true);
    try {
      // first delete storage file if needed
      if (logo.type === "storage" && logo.storagePath) {
        const sRef = ref(storage, logo.storagePath);
        await deleteObject(sRef).catch((e) => {
          // if storage file not found, continue to delete doc
          console.warn("deleteObject failed", e);
        });
      }
      // delete the logo doc
      await deleteDoc(doc(db, "logos", logo.id));
      toast.success("Logo removed.");
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete logo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-neutral-900 shadow-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>Manage Logos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Button onClick={() => setAdding((s) => !s)}>{adding ? "Cancel Add" : "Add Logo"}</Button>
          </div>

          {adding && (
            <div className="border p-3 rounded">
              <div className="mb-2">
                <Input
                  placeholder="Logo Title"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2">
                  <input type="radio" name="type" checked={type === "url"} onChange={() => setType("url")} />
                  <span>URL</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="type" checked={type === "upload"} onChange={() => setType("upload")} />
                  <span>Upload</span>
                </label>
              </div>

              {type === "url" ? (
                <div className="mt-3">
                  <Input placeholder="https://example.com/logo.png" value={urlValue} onChange={(e) => setUrlValue(e.target.value)} />
                </div>
              ) : (
                <div className="mt-3">
                  <Input type="file" accept="image/*" onChange={(e) => setFileValue(e.target.files?.[0] || null)} />
                </div>
              )}

              <div className="flex justify-end mt-3">
                <Button onClick={handleAdd} disabled={loading}>{loading ? "Adding..." : "Submit"}</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {logos.map((l) => (
              <div key={l.id} className="border rounded p-2 flex flex-col items-center">
                <div className="w-16 h-16 overflow-hidden rounded mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.url} alt={l.id} className="object-cover w-full h-full" />
                </div>
                <div className="text-sm mb-1">{l.title || l.id}</div> {/* Show title if available */}
                <div className="text-xs text-muted-foreground mb-2">{l.type}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => handleDelete(l)} disabled={loading}>Delete</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onClose()}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
