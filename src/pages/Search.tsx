import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const location = searchParams.get("location");
      const guests = searchParams.get("guests");

      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_active", true);

      if (location) {
        query = query.or(`location.ilike.%${location}%,city.ilike.%${location}%,country.ilike.%${location}%`);
      }

      if (guests) {
        query = query.gte("max_guests", parseInt(guests));
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchForm />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {properties.length} {properties.length === 1 ? "Property" : "Properties"} Found
          </h2>
          <p className="text-muted-foreground">
            {searchParams.get("location") && `in ${searchParams.get("location")}`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                name={property.name}
                location={`${property.city}, ${property.country}`}
                propertyType={property.property_type}
                maxGuests={property.max_guests}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                pricePerNight={property.price_per_night}
                currency={property.currency}
                images={property.images}
                amenities={property.amenities}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;