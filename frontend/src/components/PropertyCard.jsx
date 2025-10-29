import { MapPin, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

export const PropertyCard = ({ property, onClick }) => {
  const pricePerToken = property.valuation / property.totalSupply;

  return (
    <Card
      onClick={onClick}
      className="overflow-hidden cursor-pointer hover:shadow-card transition-smooth transform hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={property.imageUrl}
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
            <div className="text-xs text-muted-foreground mb-1">Total Valuation</div>
            <div className="flex items-center gap-1 font-semibold text-primary">
              <DollarSign className="h-4 w-4" />
              <span>{property.valuation.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Price per Token</div>
            <div className="font-semibold text-foreground">
              ${pricePerToken.toFixed(2)}
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
