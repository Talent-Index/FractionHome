import { useState, useEffect } from "react";
import { getProperty, updateProperty, saveTransaction } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Coins,
  Hash,
  FileText,
  ExternalLink,
} from "lucide-react";
import { TokenizeModal } from "./TokenizeModal";
import { BuyWidget } from "./BuyWidget";
import { OwnershipDashboard } from "./OwnershipDashboard";
import { toast } from "sonner";

export const PropertyDetail = ({ propertyId, onBack }) => {
  const [property, setProperty] = useState(null);
  const [showTokenizeModal, setShowTokenizeModal] = useState(false);

  useEffect(() => {
    const prop = getProperty(propertyId);
    setProperty(prop || null);
  }, [propertyId]);

  const handleTokenizeSuccess = (txId, eventId, tokenId) => {
    if (!property) return;

    updateProperty(property.id, {
      tokenId,
      hcsEventId: eventId,
    });

    saveTransaction({
      id: Date.now().toString(),
      propertyId: property.id,
      type: "tokenize",
      amount: 0,
      txId,
      eventId,
      timestamp: new Date().toISOString(),
    });

    setProperty({ ...property, tokenId, hcsEventId: eventId });
    toast.success("Property tokenized successfully!");
  };

  const handlePurchase = (amount, txId, eventId) => {
    if (!property) return;

    const newOwnedTokens = (property.ownedTokens || 0) + amount;

    updateProperty(property.id, {
      ownedTokens: newOwnedTokens,
    });

    saveTransaction({
      id: Date.now().toString(),
      propertyId: property.id,
      type: "purchase",
      amount,
      txId,
      eventId,
      timestamp: new Date().toISOString(),
    });

    setProperty({ ...property, ownedTokens: newOwnedTokens });
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const pricePerToken = property.valuation / property.totalSupply;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="overflow-hidden shadow-card animate-fade-in">
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Property Info */}
            <Card className="p-6 shadow-card animate-slide-up">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{property.address}</span>
                  </div>
                </div>
                {property.tokenId && (
                  <Badge className="bg-success/10 text-success hover:bg-success/20">
                    Tokenized
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Valuation</p>
                  <p className="text-lg font-bold text-primary">
                    ${property.valuation.toLocaleString()}
                  </p>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
                  <p className="text-lg font-bold">
                    {property.totalSupply.toLocaleString()}
                  </p>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Price/Token</p>
                  <p className="text-lg font-bold">${pricePerToken.toFixed(2)}</p>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Coordinates</p>
                  <p className="text-xs font-mono">
                    {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {property.contentHash && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        Content Hash (SHA-256)
                      </p>
                      <p className="text-xs font-mono text-foreground break-all bg-muted p-2 rounded">
                        {property.contentHash}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {property.tokenId && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                      <p className="text-sm font-mono text-foreground bg-muted p-2 rounded">
                        {property.tokenId}
                      </p>
                    </div>
                  </div>
                  {property.hcsEventId && (
                    <div className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          HCS Event ID
                        </p>
                        <p className="text-sm font-mono text-foreground bg-muted p-2 rounded break-all">
                          {property.hcsEventId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!property.tokenId && (
                <div className="mt-6">
                  <Button
                    onClick={() => setShowTokenizeModal(true)}
                    size="lg"
                    className="w-full"
                  >
                    <Coins className="mr-2 h-5 w-5" />
                    Tokenize Property
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {property.tokenId && (
              <>
                <div
                  className="animate-slide-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <BuyWidget property={property} onPurchase={handlePurchase} />
                </div>
                <div
                  className="animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <OwnershipDashboard property={property} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <TokenizeModal
        open={showTokenizeModal}
        onClose={() => setShowTokenizeModal(false)}
        onSuccess={handleTokenizeSuccess}
        propertyTitle={property.title}
      />
    </div>
  );
};
