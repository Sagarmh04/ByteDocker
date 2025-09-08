import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';


// --- TypeScript Interface for Client Data ---
interface Client {
  id: string;
  name: string;
  logoUrl: string;
  imageUrl: string;
  industry: string;
  scope: string;
  projectDescription: string;
}

// --- Sample Data to Upload ---
const sampleClients = [
  {
    name: "Innovatech Solutions",
    logoUrl: "https://placehold.co/150x80/0D1B2A/FFFFFF?text=Innovatech",
    imageUrl: "https://placehold.co/600x400/1B263B/FFFFFF?text=Project+Dashboard",
    industry: "SaaS",
    scope: "Web Application Development",
    projectDescription: "Developed a comprehensive project management platform from scratch, improving team collaboration and efficiency by 40%.",
  },
  {
    name: "GreenLeaf Organics",
    logoUrl: "https://placehold.co/150x80/2A9D8F/FFFFFF?text=GreenLeaf",
    imageUrl: "https://placehold.co/600x400/264653/FFFFFF?text=E-commerce+Store",
    industry: "E-commerce, Retail",
    scope: "E-commerce Platform Development",
    projectDescription: "Built a fully-responsive online store with a custom CMS, leading to a 150% increase in online sales within the first quarter.",
  },
  {
    name: "Quantum Analytics",
    logoUrl: "https://placehold.co/150x80/E9C46A/000000?text=Quantum",
    imageUrl: "https://placehold.co/600x400/F4A261/FFFFFF?text=Data+Visualization",
    industry: "Data Science & Analytics",
    scope: "Big Data & Machine Learning",
    projectDescription: "Created a predictive analytics model to forecast market trends, providing actionable insights that drove key business decisions.",
  },
  {
    name: "HealthBridge Medical",
    logoUrl: "https://placehold.co/150x80/457B9D/FFFFFF?text=HealthBridge",
    imageUrl: "https://placehold.co/600x400/A8DADC/000000?text=Telehealth+App",
    industry: "Healthcare Technology",
    scope: "Mobile App Development (iOS & Android)",
    projectDescription: "Designed and launched a HIPAA-compliant telehealth application, connecting patients with doctors remotely and securely.",
  },
  {
    name: "Vertex Construction",
    logoUrl: "https://placehold.co/150x80/E63946/FFFFFF?text=Vertex",
    imageUrl: "https://placehold.co/600x400/D90429/FFFFFF?text=ERP+System",
    industry: "Construction & Real Estate",
    scope: "Enterprise Software Solutions",
    projectDescription: "Engineered a custom enterprise resource planning (ERP) system to manage construction projects, supply chains, and finances.",
  },
];

// --- The Main Client Page Component ---
const ClientPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupClients = async () => {
      setIsLoading(true);
      const clientsCollectionRef = collection(db, "clients");
      try {
        const querySnapshot = await getDocs(clientsCollectionRef);
        if (querySnapshot.empty) {
          console.log("No client data found. Uploading sample data...");
          for (const clientData of sampleClients) {
            await addDoc(clientsCollectionRef, clientData);
          }
          // Re-fetch after uploading
          const newSnapshot = await getDocs(clientsCollectionRef);
          const clientsList = newSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Client));
          setClients(clientsList);
        } else {
          console.log("Client data found.");
          const clientsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
          setClients(clientsList);
        }
      } catch (error) {
        console.error("Error setting up client data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setupClients();
  }, []);

  const duplicatedClients = [...clients, ...clients]; // Duplicate for a seamless loop

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
      <style>
        {`
          @keyframes slide {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          .slider-track {
            animation: slide 40s linear infinite;
          }
          .slider:hover .slider-track {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="w-full max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          Our Valued Partners
        </h1>
        <p className="text-lg text-gray-400">
          We are proud to have collaborated with innovative companies across various industries.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg">Loading Clients...</p>
        </div>
      ) : (
        <>
          {/* Client Details Display Area */}
          <div className="w-full max-w-4xl h-96 mb-12 bg-gray-800 rounded-lg shadow-2xl transition-all duration-500 ease-in-out flex items-center justify-center p-6 border border-gray-700">
            {activeClient ? (
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full animate-fade-in">
                <img
                  src={activeClient.imageUrl}
                  alt={activeClient.name}
                  className="w-full md:w-1/2 h-auto object-cover rounded-md shadow-lg"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/FF0000/FFFFFF?text=Error'; }}
                />
                <div className="md:w-1/2 text-left">
                  <h2 className="text-3xl font-bold text-blue-400">{activeClient.name}</h2>
                  <p className="text-sm font-semibold text-gray-400 mt-1 mb-3">
                    <span className="font-bold text-teal-300">Industry:</span> {activeClient.industry} | <span className="font-bold text-teal-300">Scope:</span> {activeClient.scope}
                  </p>
                  <p className="text-gray-300">{activeClient.projectDescription}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 12.002l-4.243 4.242a1 1 0 001.414 1.414L12 10.414l1.879-1.879m-3.758-3.758L12 2.121l3.758 3.758" />
                </svg>
                <p className="mt-2 text-xl">Hover over a logo to see project details</p>
              </div>
            )}
          </div>
          
          {/* Sliding Logo Banner */}
          <div className="w-full slider relative h-28 overflow-hidden bg-gray-900/50 before:absolute before:left-0 before:top-0 before:z-[2] before:h-full before:w-[100px] before:bg-gradient-to-r before:from-gray-900 before:to-transparent after:absolute after:right-0 after:top-0 after:z-[2] after:h-full after:w-[100px] after:bg-gradient-to-l after:from-gray-900 after:to-transparent">
            <div className="slider-track flex w-[calc(200px*10)]">
              {duplicatedClients.map((client, index) => (
                <div
                  key={`${client.id}-${index}`}
                  className="slide w-[200px] h-24 flex items-center justify-center p-4 cursor-pointer"
                  onMouseEnter={() => setActiveClient(client)}
                  onMouseLeave={() => setActiveClient(null)}
                >
                  <img
                    src={client.logoUrl}
                    alt={`${client.name} logo`}
                    className="max-w-full max-h-16 object-contain grayscale transition-all duration-300 hover:grayscale-0 hover:scale-110"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x80/FF0000/FFFFFF?text=Error'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientPage;
