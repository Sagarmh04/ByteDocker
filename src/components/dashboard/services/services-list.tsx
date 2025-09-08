import { Loader2 } from "lucide-react";
import { ServiceCard } from "./service-card";
import { Service } from "./ServicesOverview";

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServicesList({
  services,
  isLoading,
  onEdit,
  onDelete,
}: ServicesListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Services...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed py-16 text-center">
        <h3 className="text-xl font-semibold">No Services Found</h3>
        <p className="text-muted-foreground mt-2">
          Click Add New Service to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}