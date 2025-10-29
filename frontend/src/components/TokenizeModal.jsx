import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Coins } from "lucide-react";
import { generateTxId, generateEventId, generateTokenId, simulateBlockchainDelay } from "@/utils/mockHedera";

export const TokenizeModal = ({ open, onClose, onSuccess, propertyTitle }) => {
  const [stage, setStage] = useState("idle");
  const [txId, setTxId] = useState("");
  const [eventId, setEventId] = useState("");
  const [tokenId, setTokenId] = useState("");

  const handleTokenize = async () => {
    setStage("creating");
    await simulateBlockchainDelay(2000);

    const newTokenId = generateTokenId();
    setTokenId(newTokenId);
    setStage("confirming");
    await simulateBlockchainDelay(1500);

    const newTxId = generateTxId();
    const newEventId = generateEventId();
    setTxId(newTxId);
    setEventId(newEventId);
    setStage("success");

    setTimeout(() => {
      onSuccess(newTxId, newEventId, newTokenId);
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setStage("idle");
    setTxId("");
    setEventId("");
    setTokenId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tokenize Property</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {stage === "idle" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Ready to tokenize{" "}
                <span className="font-semibold text-foreground">{propertyTitle}</span> on Hedera blockchain?
              </p>
              <Button onClick={handleTokenize} className="w-full" size="lg">
                Start Tokenization
              </Button>
            </div>
          )}

          {stage === "creating" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="font-medium">Creating token on Hedera...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your request
              </p>
            </div>
          )}

          {stage === "confirming" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="font-medium">Confirming transaction...</p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                <p className="text-sm font-mono">{tokenId}</p>
              </div>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <p className="font-semibold text-lg">Tokenization Successful!</p>

              <div className="space-y-3 text-left">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                  <p className="text-sm font-mono break-all">{tokenId}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                  <p className="text-sm font-mono break-all">{txId}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">HCS Event ID</p>
                  <p className="text-sm font-mono break-all">{eventId}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
