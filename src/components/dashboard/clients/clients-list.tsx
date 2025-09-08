import { Loader2 } from "lucide-react";
import { ClientCard } from "./client-card";
import { Client } from "@/app/dashboard/clients/page";

interface ClientsListProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientsList({ clients, isLoading, onEdit, onDelete }: ClientsListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Clients...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed py-16 text-center">
        <h3 className="text-xl font-semibold">No Clients Found</h3>
        <p className="text-muted-foreground mt-2">
          Click Add New Client to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}