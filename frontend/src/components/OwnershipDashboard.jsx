import { Card } from "@/components/ui/card";
import { PieChart, TrendingUp } from "lucide-react";

export const OwnershipDashboard = ({ property }) => {
  const ownedTokens = property.ownedTokens || 0;
  const ownershipPercentage = (ownedTokens / property.totalSupply) * 100;
  const investmentValue = (property.valuation / property.totalSupply) * ownedTokens;

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Your Ownership</h3>
      </div>

      <div className="space-y-6">
        {/* Ownership Visualization */}
        <div className="relative">
          <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-1000 ease-out flex items-center justify-center text-xs font-medium text-primary-foreground"
              style={{ width: `${Math.max(ownershipPercentage, 5)}%` }}
            >
              {ownershipPercentage > 5 && `${ownershipPercentage.toFixed(2)}%`}
            </div>
          </div>
          {ownershipPercentage <= 5 && ownershipPercentage > 0 && (
            <span className="text-xs text-muted-foreground absolute right-0 top-9">
              {ownershipPercentage.toFixed(2)}%
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-accent/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Tokens Owned</p>
            <p className="text-2xl font-bold text-foreground">
              {ownedTokens.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              of {property.totalSupply.toLocaleString()}
            </p>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Investment Value</p>
            <p className="text-2xl font-bold text-primary">
              $
              {investmentValue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <div className="flex items-center gap-1 mt-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">+0%</span>
            </div>
          </div>
        </div>

        {ownedTokens === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            You don't own any tokens yet. Purchase tokens to start investing!
          </div>
        )}
      </div>
    </Card>
  );
};
