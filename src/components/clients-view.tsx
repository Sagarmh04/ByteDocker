'use client';

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

// --- Assumed Imports ---
// Make sure you have these shadcn/ui components installed and available.
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {db} from '@/services/firebase'
export interface Client {
  id: string;
  companyName: string;
  logoUrl: string;
  imageUrl: string;
  description: string;
  industry: string;
  scopeOfWork: string;
  product: string;
  feedback: {
    rating: number;
    message: string;
  };
}

// --- Dummy Data for Initial Upload ---
const DUMMY_CLIENTS: Client[] = [
    {
        id: "nexus-fintech",
        companyName: "Nexus Fintech",
        logoUrl: "https://placehold.co/150x50/000000/FFFFFF/png?text=Nexus",
        imageUrl: "https://placehold.co/400x300/1E90FF/FFFFFF/png?text=Nexus+App",
        description: "Nexus Fintech is revolutionizing digital banking. We partnered to build a robust back-end and a seamless user interface.",
        industry: "Fintech",
        scopeOfWork: "Web Application",
        product: "Digital Banking Platform",
        feedback: { rating: 5, message: "Their team delivered a flawless platform that has become the cornerstone of our business." }
    },
    {
        id: "horizon-logistics",
        companyName: "Horizon Logistics",
        logoUrl: "https://placehold.co/150x50/000000/FFFFFF/png?text=Horizon",
        imageUrl: "https://placehold.co/400x300/B8860B/FFFFFF/png?text=Logistics+System",
        description: "Horizon provides global supply chain solutions. We developed a real-time tracking mobile app that increased their efficiency by 40%.",
        industry: "Logistics",
        scopeOfWork: "Mobile Application",
        product: "Fleet Management App",
        feedback: { rating: 5, message: "The mobile app is a game-changer. Our clients love the transparency, and our team is more efficient than ever." }
    },
    {
        id: "apex-realty",
        companyName: "Apex Realty",
        logoUrl: "https://placehold.co/150x50/000000/FFFFFF/png?text=Apex",
        imageUrl: "https://placehold.co/400x300/1E90FF/FFFFFF/png?text=Real+Estate+Portal",
        description: "A premier real estate agency, Apex Realty needed a powerful web portal. We built a high-performance website with advanced search.",
        industry: "Real Estate",
        scopeOfWork: "Website Development",
        product: "Property Listing Portal",
        feedback: { rating: 4, message: "A fantastic website that perfectly captures our brand. The search functionality is particularly impressive." }
    },
    {
        id: "vitality-health",
        companyName: "Vitality Health",
        logoUrl: "https://placehold.co/150x50/000000/FFFFFF/png?text=Vitality",
        imageUrl: "https://placehold.co/400x300/B8860B/FFFFFF/png?text=Health+App",
        description: "Vitality Health connects patients with healthcare providers through a secure mobile app. We designed their HIPAA-compliant platform.",
        industry: "HealthTech",
        scopeOfWork: "Mobile Application",
        product: "Telemedicine Platform",
        feedback: { rating: 5, message: "Their attention to security and user experience was outstanding. The best partners for any HealthTech project." }
    },
    {
        id: "quantum-ecommerce",
        companyName: "Quantum E-commerce",
        logoUrl: "https://placehold.co/150x50/000000/FFFFFF/png?text=Quantum",
        imageUrl: "https://placehold.co/400x300/1E90FF/FFFFFF/png?text=E-commerce+Store",
        description: "Quantum is a fast-growing online retail brand. We built a scalable e-commerce website with custom inventory management.",
        industry: "E-commerce",
        scopeOfWork: "Website Development",
        product: "Custom E-commerce Site",
        feedback: { rating: 5, message: "Our sales have doubled since launching the new site. The entire process was smooth and professional." }
    }
];

// --- Reusable Hover Content Component ---
function ClientHoverContent({ client, themeColors }: { client: Client; themeColors: { background: string; text: string; highlight: string; card: string; border: string; } }) {
  return (
    <div 
      style={{ backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }} 
      className="flex w-[600px] rounded-lg shadow-2xl overflow-hidden border"
    >
      <div className="w-2/5 flex-shrink-0">
        <img src={client.imageUrl} alt={`${client.companyName} project`} className="object-cover w-full h-full" />
      </div>
      <div className="w-3/5 p-6 flex flex-col">
        <div className="flex-grow">
          <h3 className="text-xl font-bold" style={{ color: themeColors.highlight }}>{client.companyName}</h3>
          <p className="text-sm mt-2 opacity-80">{client.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t" style={{ borderColor: themeColors.border }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Industry</p>
              <span className="px-2 py-1 text-xs rounded-full" style={{backgroundColor: 'rgba(128, 128, 128, 0.15)'}}>{client.industry}</span>
            </div>
            <div>
              <p className="font-semibold mb-1">Scope</p>
               <span className="px-2 py-1 text-xs rounded-full" style={{backgroundColor: 'rgba(128, 128, 128, 0.15)'}}>{client.scopeOfWork}</span>
            </div>
             <div className="col-span-2">
              <p className="font-semibold mb-1">Product Delivered</p>
              <p className="opacity-80">{client.product}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main View Component ---
export function ClientsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themeColors, setThemeColors] = useState({ background: '#FFFFFF', text: '#000000', highlight: '#B8860B', card: '#FFFFFF', border: '#E5E7EB' });
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  const carouselPlugin = useRef(Autoplay({ delay: 2500, stopOnInteraction: true, stopOnMouseEnter: true }));

  // Effect to handle client-side mounting and theme switching
  useEffect(() => {
    setIsMounted(true);
    setThemeColors(
      resolvedTheme === 'dark'
        ? { background: '#000000', text: '#FFFFFF', highlight: '#1E90FF', card: '#111827', border: '#374151' }
        : { background: '#FFFFFF', text: '#000000', highlight: '#B8860B', card: '#FFFFFF', border: '#E5E7EB' }
    );
  }, [resolvedTheme]);

  // Effect for Firebase data logic
  useEffect(() => {
    const initializeAndFetchClients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const clientsCollectionRef = collection(db, "clients");
        const existingDocs = await getDocs(clientsCollectionRef);
        
        if (existingDocs.empty) {
          await Promise.all(DUMMY_CLIENTS.map(client => setDoc(doc(db, "clients", client.id), client)));
        }

        const finalDocs = await getDocs(clientsCollectionRef);
        setClients(finalDocs.docs.map(doc => doc.data() as Client));
      } catch (err) {
        console.error("Firebase error:", err);
        setError("Failed to load client data. Please check your connection or Firebase setup.");
      } finally {
        setIsLoading(false);
      }
    };
    if (isMounted) {
      initializeAndFetchClients();
    }
  }, [isMounted]);

  // Prevents flash of unstyled content and hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ backgroundColor: themeColors.background, color: themeColors.text }} className="transition-colors duration-500">
      <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24">
        <div className="text-center mb-16">
          <h1 style={{ color: themeColors.highlight }} className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Trusted by Industry Leaders
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg opacity-70">
            We partner with innovative companies to build the future, one project at a time.
          </p>
        </div>

        {isLoading && <div className="text-center py-10">Loading Client Stories...</div>}
        {error && <div className="text-center py-10 text-red-500">{error}</div>}

        {!isLoading && !error && (
          <div className="space-y-24">
            <section>
              <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clients.map((client) => (
                  <HoverCard key={client.id} openDelay={200} closeDelay={100}>
                    <Card style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }} className="flex flex-col h-full border transition-all duration-300 hover:shadow-lg hover:border-highlight">
                      <CardHeader className="flex-row items-center gap-4">
                        <HoverCardTrigger asChild>
                          <img src={client.logoUrl} alt={`${client.companyName} logo`} width={100} height={40} className="object-contain cursor-pointer flex-shrink-0" />
                        </HoverCardTrigger>
                        <CardTitle className="text-lg font-semibold">{client.companyName}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="italic opacity-80">{client.feedback.message}</p>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-5 w-5 ${i < client.feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400/50"}`} />)}
                        </div>
                      </CardFooter>
                    </Card>
                    <HoverCardContent className="p-0 border-0 bg-transparent shadow-none" side="top" align="center">
                       <ClientHoverContent client={client} themeColors={themeColors} />
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </section>

            <section className="pt-12">
              <Carousel plugins={[carouselPlugin.current]} className="w-full" opts={{ align: "start", loop: true }}>
                <CarouselContent className="-ml-4">
                  {clients.map((client) => (
                    <CarouselItem key={client.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/6">
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                           <div style={{ backgroundColor: 'rgba(128, 128, 128, 0.05)'}} className="p-4 rounded-lg flex items-center justify-center h-24 cursor-pointer">
                              <img src={client.logoUrl} alt={`${client.companyName} logo`} width={150} height={50} className="object-contain grayscale hover:grayscale-0 transition-all duration-300" />
                           </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-0 border-0 bg-transparent shadow-none" side="top" align="center">
                          <ClientHoverContent client={client} themeColors={themeColors} />
                        </HoverCardContent>
                      </HoverCard>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}