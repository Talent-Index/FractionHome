import { MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${property.id}`);
  };

  // Add default values to prevent NaN
  const valuation = property.valuation || 0;
  const totalSupply = property.totalSupply || 1; // prevent divide by zero
  const pricePerToken = totalSupply > 0 ? valuation / totalSupply : 0;

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={property.photos?.[0] || '/placeholder-image.png'}
          alt={property.title}
          className="w-full h-full object-cover transition-smooth hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 text-foreground">
          {property.title}
        </h3>
        <div className="flex items-center text-muted-foreground text-sm mb-3 gap-1">
          <MapPin className="h-4 w-4" />
          <span>{property.address}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Total Valuation
            </div>
            <div className="flex items-center gap-1 font-semibold text-primary">
              <DollarSign className="h-4 w-4" />
              <span>{property.valuation.toLocaleString()}</span>
            </div>
          </div>
        
        </div>
        {property.tokenId && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
              Tokenized
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
