"use client"; // Add this directive at the very top

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CardSwipe } from "@/components/ui/card-swipe";

// The rest of your component code remains exactly the same...

const defaultMyCards = [
  {
    id: "ITCS",
    src: "/1.PNG",
    alt: "IT Consultation and Support",
    title: "IT Consultation and Support",
    description: "Frontend and Backend Integrations: Expert integrations and development of backends with frontends. \nData Security and Compliance: Assistance with implementing authentication and other secure data management protocols.",
  },
  {
    id: "IDSP",
    src: "/3.PNG",
    alt: "Internally Developed SaaS Products",
    title: "Internally Developed SaaS Products",
    description: "Quick Commerce Support Solutions: Logistic and inventory management solutions for companies offering fast deliveries. \nAutomated Mail System for Leads: Automated email tools for real estate and e-commerce businesses. \nInventory and Order Management System: A streamlined tool to track inventory levels, process orders, and manage logistics in real time, specifically suited for e-commerce or quick commerce businesses looking for a lean inventory management solution. \nCustomer Self-Service Portal: An online portal where customers can check order status, update information, submit support tickets, and access FAQs or help resources. This could reduce the load on customer support teams.",
  },
];
interface CardData {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}
export default function Services() {
const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrCreateServices = async () => {
      const servicesDocRef = doc(db, 'content', 'services');

      try {
        const docSnap = await getDoc(servicesDocRef);

        if (docSnap.exists()) {
          console.log("Services data found in Firestore.");
          setCards(docSnap.data().cards);
        } else {
          console.log("No services data found. Uploading default data...");
          await setDoc(servicesDocRef, { cards: defaultMyCards });
          setCards(defaultMyCards);
        }
      } catch (err) {
        console.error("Error fetching or creating services document:", err);
        setError("Failed to load services data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateServices();
  }, []);

  if (loading) {
    return <div>Loading Services...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="w-full">
      <CardSwipe cards={cards} autoplayDelay={2000} slideShadows={false} />
    </div>
  );
}