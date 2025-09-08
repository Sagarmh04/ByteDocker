// FILE: components/dashboard/services/service-form.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Service } from "./ServicesOverview"; // Point to the new location of the type

// FIX: Added .max(500) to the description validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  alt: z.string().min(1, "Alt text is required."),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(500, "Description cannot exceed 500 characters."),
  image: z.any(),
});

interface ServiceFormProps {
  mode: "create" | "update";
  initialData?: Service;
  onSubmit: (values: z.infer<typeof formSchema>, imageFile?: File) => Promise<void>;
  isSubmitting: boolean;
}

export function ServiceForm({ mode, initialData, onSubmit, isSubmitting }: ServiceFormProps) {
  const [preview, setPreview] = useState<string | null>(initialData?.src || null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      alt: initialData?.alt || "",
      description: initialData?.description || "",
    },
  });

  // FIX: Watch the description field to update the character counter
  const descriptionValue = form.watch("description");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          if (img.width >= img.height) {
            toast.error("Image must be portrait (width < height).");
            setPreview(initialData?.src || null);
            setImageFile(undefined);
            e.target.value = '';
          } else {
            setPreview(event.target?.result as string);
            setImageFile(file);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (mode === 'create' && !imageFile) {
        toast.error("Image is required to create a new service.");
        return;
    }
    onSubmit(values, imageFile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Thumbnail Image</FormLabel>
                  {preview && (
                    <div className="mb-4 aspect-[3/4] relative w-full overflow-hidden rounded-md border">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IT Consultation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Image alt text for accessibility" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Describe the service..." {...field} />
                  </FormControl>
                  <FormMessage />
                  {/* FIX: Added character counter */}
                  <div className="text-right text-sm text-muted-foreground">
                    {descriptionValue?.length || 0} / 500
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Service" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}