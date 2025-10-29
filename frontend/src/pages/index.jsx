import { useState, useEffect } from "react";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { PropertyList } from "@/components/PropertyList";
import { PropertyDetail } from "@/components/PropertyDetail";
import { UploadForm } from "@/components/UploadForm";
import { getProperties, saveProperty } from "@/utils/storage";
import property1Image from "@/assets/property-1.jpg";
import property2Image from "@/assets/property-2.jpg";
import property3Image from "@/assets/property-3.jpg";

const Index = () => {
  const [view, setView] = useState("list");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  useEffect(() => {
    const properties = getProperties();
    if (properties.length === 0) {
      const sampleProperties = [
        {
          id: "1",
          title: "Modern Downtown Loft",
          address: "123 Main Street, New York, NY 10001",
          latitude: 40.7128,
          longitude: -74.0060,
          valuation: 1200000,
          totalSupply: 10000,
          description:
            "Stunning modern loft in the heart of downtown. Features floor-to-ceiling windows, open-concept design, premium finishes, and access to world-class amenities. Prime location near top restaurants, entertainment, and transit.",
          imageUrl: property1Image,
          contentHash:
            "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Beachfront Villa Paradise",
          address: "456 Ocean Drive, Miami, FL 33139",
          latitude: 25.7617,
          longitude: -80.1918,
          valuation: 3500000,
          totalSupply: 25000,
          description:
            "Luxurious beachfront villa with panoramic ocean views. Private beach access, infinity pool, state-of-the-art kitchen, and entertainment spaces. Perfect for luxury living and investment opportunities.",
          imageUrl: property2Image,
          contentHash:
            "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Corporate Tower Plaza",
          address: "789 Business Blvd, Chicago, IL 60601",
          latitude: 41.8781,
          longitude: -87.6298,
          valuation: 8500000,
          totalSupply: 50000,
          description:
            "Premium commercial office space in Chicago's central business district. Class A building with modern infrastructure, high-speed connectivity, conference facilities, and prestigious business address. Excellent investment opportunity with stable returns.",
          imageUrl: property3Image,
          contentHash:
            "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8",
          createdAt: new Date().toISOString(),
        },
      ];

      sampleProperties.forEach((prop) => saveProperty(prop));
    }
  }, []);

  const handlePropertyClick = (id) => {
    setSelectedPropertyId(id);
    setView("detail");
  };

  const handleUploadClick = () => setView("upload");

  const handleUploadSuccess = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setView("detail");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedPropertyId("");
  };

  return (
    <div className="min-h-screen">
      <DemoModeBanner />

      {view === "list" && (
        <PropertyList
          onPropertyClick={handlePropertyClick}
          onUploadClick={handleUploadClick}
        />
      )}

      {view === "detail" && selectedPropertyId && (
        <PropertyDetail
          propertyId={selectedPropertyId}
          onBack={handleBackToList}
        />
      )}

      {view === "upload" && (
        <UploadForm onBack={handleBackToList} onSuccess={handleUploadSuccess} />
      )}
    </div>
  );
};

export default Index;
