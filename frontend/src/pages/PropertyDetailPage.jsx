import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PropertyDetail } from '@/components/PropertyDetail';
import { getPropertyById } from '@/services/backendApi';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchProperty = async () => {
    try {
      const data = await getPropertyById(id);
      console.log('Property data in component:', data);
      setProperty(data); // ✅ FIXED — use data directly
    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchProperty();
  }
}, [id]);



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Changed condition to check for required property fields
if (!property || typeof property !== "object") {
  return (
    <div className="text-center text-muted-foreground p-4">
      <p>Property not found</p>
    </div>
  );
}

  return <PropertyDetail property={property} />;
};