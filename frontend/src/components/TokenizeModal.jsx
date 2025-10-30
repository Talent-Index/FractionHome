import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { tokenizeProperty } from '@/services/backendApi';

export const TokenizeModal = ({ property, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    totalSupply: "",
    tokenName: "",
    tokenSymbol: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tokenDetails = {
        ...formData,
        totalSupply: parseInt(formData.totalSupply),
        propertyId: property.id
      };

      const result = await tokenizeProperty(property.id, tokenDetails);
      
      toast.success("Property successfully tokenized!");
      onSuccess?.(result);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to tokenize property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tokenize Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              name="tokenName"
              value={formData.tokenName}
              onChange={handleInputChange}
              placeholder="e.g., Property Token"
              required
            />
          </div>

          <div>
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              name="tokenSymbol"
              value={formData.tokenSymbol}
              onChange={handleInputChange}
              placeholder="e.g., PROP"
              required
            />
          </div>

          <div>
            <Label htmlFor="totalSupply">Total Supply</Label>
            <Input
              id="totalSupply"
              name="totalSupply"
              type="number"
              min="1"
              value={formData.totalSupply}
              onChange={handleInputChange}
              placeholder="Enter total number of tokens"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tokenizing...
                </>
              ) : (
                "Tokenize Property"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
