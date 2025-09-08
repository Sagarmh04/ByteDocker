// app/dashboard/services/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ServiceForm from "@/components/dashboard/service-form";
import ServiceList from "@/components/dashboard/service-list";

export default function ServicesPage() {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={() => setOpenForm(true)}>Create Service</Button>
      </div>

      {openForm && <ServiceForm onClose={() => setOpenForm(false)} />}

      <ServiceList />
    </div>
  );
}
