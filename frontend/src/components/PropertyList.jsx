import { useState, useEffect } from "react";
import { PropertyCard } from "./PropertyCard";
import { Loader2 } from "lucide-react";
import { getProperties } from "@/services/backendApi";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import heroImage from "@/assets/hero-property.jpg";

export const PropertyList = ({ onPropertyClick, onUploadClick }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        // Ensure each property has required fields with defaults
        const processedProperties = (data.items || data || []).map((property) => ({
          ...property,
          valuation: property.valuation || 0,
          totalSupply: property.totalSupply || 0,
          tokenId: property.tokenId || null,
          ownedTokens: property.ownedTokens || 0,
        }));
        setProperties(processedProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading properties: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Real Estate"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
          <div className="text-center text-primary-foreground px-4">
            <h1 className="text-5xl font-bold mb-4 animate-fade-in">
              Real Estate Tokenization
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Democratizing property investment through blockchain technology
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={onUploadClick}
              className="shadow-xl transition-bounce hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              List New Property
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="container mx-auto px-4 py-12">
        {properties.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-muted-foreground mb-6">
              <p className="text-xl mb-2">No properties listed yet</p>
              <p className="text-sm">Start by uploading your first property</p>
            </div>
            <Button onClick={onUploadClick} variant="default" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Upload Property
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                Available Properties
              </h2>
              <Button onClick={onUploadClick} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => onPropertyClick(property.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
