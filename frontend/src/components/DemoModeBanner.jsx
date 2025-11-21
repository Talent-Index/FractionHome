import { AlertCircle } from "lucide-react";

export const DemoModeBanner = () => {
  return (
    <div className="bg-warning text-warning-foreground px-4 py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <AlertCircle className="h-4 w-4" />
        <span>Demo Mode – Using dummy Hedera Testnet accounts (0.0.123456)</span>
      </div>
    </div>
  );
};
