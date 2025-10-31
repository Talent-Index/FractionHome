import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const UploadForm = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    valuation: "",
    description: "",
  });

  const navigate = useNavigate(); // Initialize useNavigate
  const refreshPage = () => {
    window.location.reload(true)
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadPropertyDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.ok || !data.record?.id) {
        throw new Error('Invalid response from server');
      }

      return data.record.id;
    } catch (error) {
      console.error('Error uploading property:', error);
      throw error;
    }
  };

  const uploadPropertyImage = async (propertyId) => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE}/api/properties/${propertyId}/photo`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Upload property details
      const newPropertyId = await uploadPropertyDetails();

      // Step 2: Upload image if selected
      if (selectedFile) {
        await uploadPropertyImage(newPropertyId);
      }

      toast.success("Property created successfully!");
      refreshPage();
      // navigate(`/properties/${newPropertyId}`); // Navigate to the new property's detail page
    } catch (error) {
      toast.error(error.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="valuation">Valuation ($)</Label>
            <Input
              id="valuation"
              name="valuation"
              type="number"
              min="0"
              value={formData.valuation}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">Property Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            Back
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Property"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
