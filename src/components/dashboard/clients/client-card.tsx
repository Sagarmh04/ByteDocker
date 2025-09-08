import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Client } from "@/app/dashboard/clients/page";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 shrink-0">
                <Image src={client.logoUrl} alt={`${client.companyName} logo`} fill className="object-contain"/>
              </div>
              <div className="space-y-1">
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
              <DropdownMenuItem onClick={() => onDelete(client)} className="text-red-500 focus:text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="aspect-video relative w-full overflow-hidden rounded-md border">
          <Image src={client.imageUrl} alt={client.product} fill className="object-cover transition-transform hover:scale-105" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{client.description}</p>
      </CardContent>
    </Card>
  );
}