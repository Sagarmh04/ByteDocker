import { ClientsView } from "@/components/clients-view";

// This is a Server Component by default in the App Router.
// It acts as a clean entry point for our client-facing logic.
export default function ClientsPage() {
  return (
    <main className="min-h-screen">
      {/*
        All the heavy lifting (theming, data fetching, interactivity)
        will be handled inside the ClientsView component.
      */}
      <ClientsView />
    </main>
  );
}