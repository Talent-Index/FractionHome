import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { buyTokens } from "@/services/backendApi";

export const BuyWidget = ({ property, onPurchase }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const pricePerToken = property.valuation / property.totalSupply;
  const totalCost = parseFloat(amount) * pricePerToken;
  const ownedTokens = property.ownedTokens || 0;
  const availableTokens = property.totalSupply - ownedTokens;

  const handlePurchase = async () => {
    const tokenAmount = parseInt(amount);

    if (!tokenAmount || tokenAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (tokenAmount > availableTokens) {
      toast.error(`Only ${availableTokens} tokens available`);
      return;
    }

    setLoading(true);

    try {
      // Call backend API - ensure frontend/src/services/backendApi.js exports buyTokens(propertyId, body)
      const resp = await buyTokens(property.id || property._id || property.tokenId, {
        amount: tokenAmount
      });

      // Backend should return transaction identifiers and/or updated state.
      // Try common fields, fallback to generated placeholders if missing.
      const txId = resp?.txId || resp?.transactionId || resp?.transaction?.id || `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}`;
      const eventId = resp?.eventId || resp?.event?.id || `evt-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Notify parent to update UI (component expects onPurchase(tokenAmount, txId, eventId))
      onPurchase(tokenAmount, txId, eventId);
      toast.success(`Successfully purchased ${tokenAmount} tokens!`);
      setAmount("");
    } catch (error) {
      toast.error(error?.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Purchase Tokens</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Number of Tokens</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            max={availableTokens}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Available: {availableTokens.toLocaleString()} tokens
          </p>
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="bg-accent p-4 rounded-lg space-y-2 animate-fade-in">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per token</span>
              <span className="font-medium">${pricePerToken.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{amount} tokens</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold">Total Cost</span>
              <span className="font-bold text-primary text-lg">
                $
                {totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handlePurchase}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Purchase Tokens"
          )}
        </Button>
      </div>
    </Card>
  );
};
