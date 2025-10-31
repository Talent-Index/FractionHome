import { useState, useEffect } from "react";
import { updateProperty, saveTransaction } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Coins,
  Hash,
  FileText,
  ExternalLink,
} from "lucide-react";
import TokenizeModal from "./TokenizeModal"; // Change to default import
import { BuyWidget } from "./BuyWidget";
import { OwnershipDashboard } from "./OwnershipDashboard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getPropertyTokens } from "@/services/backendApi";

export const PropertyDetail = ({ property }) => {
  const [currentProperty, setCurrentProperty] = useState(null);
  const [showTokenizeModal, setShowTokenizeModal] = useState(false);
  const navigate = useNavigate();

  // ✅ Keep local state synced with prop
  useEffect(() => {
    if (property) {
      // Ensure all required fields exist with defaults
      const processedProperty = {
        ...property,
        valuation: property.valuation || 0,
        totalSupply: property.totalSupply || 0,
        tokenId: property.tokenId || null,
        ownedTokens: property.ownedTokens || 0
      };
      console.log('Processed property:', processedProperty); // Debug log
      setCurrentProperty(processedProperty);
    }
  }, [property]);
  useEffect(() => {
  const fetchTokenData = async () => {
    if (!currentProperty?.tokenId) return;

    try {
      const tokenResponse = await getPropertyTokens(currentProperty.id);
      const chainInfo = tokenResponse?.data?.chainInfo;

      if (chainInfo?.totalSupply) {
        setCurrentProperty((prev) => ({
          ...prev,
          totalSupply: chainInfo.totalSupply, // already normalized to number
        }));
      }
    } catch (err) {
      console.error("Failed to fetch token data:", err);
    }
  };

  fetchTokenData();
}, [currentProperty]);

  // ✅ Handle successful tokenization
  const handleTokenizeSuccess = (txId, eventId, tokenId) => {
    if (!currentProperty) return;

    const updated = {
      ...currentProperty,
      tokenId,
      hcsEventId: eventId,
    };

    updateProperty(currentProperty.id, {
      tokenId,
      hcsEventId: eventId,
    });

    saveTransaction({
      id: Date.now().toString(),
      propertyId: currentProperty.id,
      type: "tokenize",
      amount: 0,
      txId,
      eventId,
      timestamp: new Date().toISOString(),
    });

    setCurrentProperty(updated);
    toast.success("Property tokenized successfully!");
  };

  // ✅ Handle purchase
  const handlePurchase = (amount, txId, eventId) => {
    if (!currentProperty) return;

    const newOwnedTokens = (currentProperty.ownedTokens || 0) + amount;

    updateProperty(currentProperty.id, {
      ownedTokens: newOwnedTokens,
    });

    saveTransaction({
      id: Date.now().toString(),
      propertyId: currentProperty.id,
      type: "purchase",
      amount,
      txId,
      eventId,
      timestamp: new Date().toISOString(),
    });

    setCurrentProperty({
      ...currentProperty,
      ownedTokens: newOwnedTokens,
    });

    toast.success(`Purchased ${amount} tokens successfully!`);
  };

  // Add error boundary
  if (!currentProperty) {
    console.log('No property data available'); // Debug log
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Property data not available</p>
      </div>
    );
  }

  // Calculate price with safety checks
  const pricePerToken = currentProperty.totalSupply > 0 
    ? currentProperty.valuation / currentProperty.totalSupply 
    : 0;

  const {
    title,
    address,
    description,
    valuation,
    totalSupply = 1, // prevent divide-by-zero
    latitude = 0,
    longitude = 0,
    imageUrl,
    contentHash,
    tokenId,
    hcsEventId,
  } = currentProperty;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          ← Back to Properties
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ---------- MAIN CONTENT ---------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="overflow-hidden shadow-card animate-fade-in">
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Property Info */}
            <Card className="p-6 shadow-card animate-slide-up">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{title}</h1>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{address}</span>
                  </div>
                </div>
                {tokenId && (
                  <Badge className="bg-success/10 text-success hover:bg-success/20">
                    Tokenized
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Valuation</p>
                  <p className="text-lg font-bold text-primary">
                    ${valuation.toLocaleString()}
                  </p>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
                  <p className="text-lg font-bold">{totalSupply.toLocaleString()}</p>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Price/Token</p>
                  <p className="text-lg font-bold">${pricePerToken.toFixed(2)}</p>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Coordinates</p>
                  <p className="text-xs font-mono">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Content Hash */}
              {contentHash && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        Content Hash (SHA-256)
                      </p>
                      <p className="text-xs font-mono text-foreground break-all bg-muted p-2 rounded">
                        {contentHash}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Token Info */}
              {tokenId && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                      <p className="text-sm font-mono text-foreground bg-muted p-2 rounded">
                        {tokenId}
                      </p>
                    </div>
                  </div>
                  {hcsEventId && (
                    <div className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          HCS Event ID
                        </p>
                        <p className="text-sm font-mono text-foreground bg-muted p-2 rounded break-all">
                          {hcsEventId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tokenize button */}
              {!tokenId && (
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

          {/* ---------- SIDEBAR ---------- */}
          <div className="space-y-6">
            {tokenId && (
              <>
                <div
                  className="animate-slide-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <BuyWidget
                    property={currentProperty}
                    onPurchase={handlePurchase}
                  />
                </div>
                <div
                  className="animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <OwnershipDashboard property={currentProperty} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <TokenizeModal
        property={currentProperty}
        isOpen={showTokenizeModal}
        onClose={() => setShowTokenizeModal(false)}
        onSuccess={handleTokenizeSuccess}
      />
    </div>
  );
};
