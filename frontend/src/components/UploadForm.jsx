import { useState } from "react";
import { saveProperty } from "@/utils/storage";
import { generateContentHash } from "@/utils/mockHedera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const UploadForm = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    latitude: "",
    longitude: "",
    valuation: "",
    totalSupply: "",
    description: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const property = {
        id: Date.now().toString(),
        title: formData.title,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        valuation: parseFloat(formData.valuation),
        totalSupply: parseInt(formData.totalSupply),
        description: formData.description,
        imageUrl: imagePreview,
        createdAt: new Date().toISOString(),
      };

      const contentHash = await generateContentHash({
        title: property.title,
        address: property.address,
        valuation: property.valuation,
        totalSupply: property.totalSupply,
      });

      property.contentHash = contentHash;

      await new Promise((resolve) => setTimeout(resolve, 1500));

      saveProperty(property);
      toast.success("Property uploaded successfully!");
      onSuccess(property.id);
    } catch (error) {
      toast.error("Failed to upload property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>

        <Card className="p-8 shadow-card animate-slide-up">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Upload Property</h1>
          <p className="text-muted-foreground mb-8">
            Add property details to prepare for tokenization
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Luxury Downtown Apartment"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="123 Main St, City, State"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  required
                  placeholder="40.7128"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  required
                  placeholder="-74.0060"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valuation">Valuation ($) *</Label>
                <Input
                  id="valuation"
                  type="number"
                  value={formData.valuation}
                  onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
                  required
                  placeholder="1000000"
                />
              </div>
              <div>
                <Label htmlFor="totalSupply">Total Token Supply *</Label>
                <Input
                  id="totalSupply"
                  type="number"
                  value={formData.totalSupply}
                  onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                  required
                  placeholder="10000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder="Detailed property description..."
              />
            </div>

            <div>
              <Label htmlFor="image">Property Image * (max 2MB)</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => setImagePreview("")}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      required
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Property
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
