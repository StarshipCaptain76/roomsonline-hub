import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { SearchForm } from "@/components/SearchForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hotel, CheckCircle, Search as SearchIcon, Users, AlertCircle } from "lucide-react";
import mockProperties, { Property } from "@/data/mockProperties";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"low-high" | "high-low">("low-high");

  const fallbackFilterProperties = () => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = parseInt(searchParams.get("guests") || "1");
    const location = searchParams.get("location")?.toLowerCase();
    const checkInDate = checkIn ? new Date(checkIn) : new Date();
    const checkOutDate = checkOut ? new Date(checkOut) : new Date();
    const now = new Date();
    let filtered = mockProperties.filter((property) => {
      if (property.maxGuests < guests) return false;
      if (location && !property.name.toLowerCase().includes(location) && !property.location.toLowerCase().includes(location)) return false;
      if (checkInDate > now && checkOutDate > checkInDate) return Math.random() > 0.3;
      return false;
    });
    setProperties(filtered);
  };

  useEffect(() => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    const location = searchParams.get("location");
    if (!checkIn || !checkOut || !guests) {
      toast.error("Please enter search criteria");
      navigate("/");
      return;
    }
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        if (import.meta.env.DEV) await new Promise(resolve => setTimeout(resolve, 300));
        const { data, error: functionError } = await supabase.functions.invoke('availability', {
          body: { checkIn, checkOut, guests: parseInt(guests), location: location || undefined }
        });
        if (functionError) throw functionError;
        if (data?.success) {
          console.log(`Loaded ${data.totalCount} properties (NightsBridge: ${data.breakdown.nightsbridge}, Checkfront: ${data.breakdown.checkfront})`);
          setProperties(data.properties);
        } else throw new Error(data?.error || 'Failed to fetch availability');
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Unable to fetch live availability. Using demo data.');
        fallbackFilterProperties();
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [searchParams, navigate]);

  useEffect(() => {
    if (properties.length > 0) {
      const sorted = [...properties].sort((a, b) => sortBy === "low-high" ? a.rateFrom - b.rateFrom : b.rateFrom - a.rateFrom);
      setProperties(sorted);
    }
  }, [sortBy]);

  const handleViewDetails = (propertyId: string) => {
    const params = new URLSearchParams(searchParams);
    navigate(`/property/${propertyId}?${params.toString()}`);
  };

  if (loading) {
    return (
      <Layout>
        <Helmet><title>Searching Properties... | RoomsOnline</title></Helmet>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8"><SearchForm /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Search Results – {properties.length} Properties | RoomsOnline</title>
        <meta name="description" content={`Browse ${properties.length} available properties in South Africa`} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8"><SearchForm /></div>
        {error && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground/70">{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{properties.length} {properties.length === 1 ? "property" : "properties"} found</h2>
          <Select value={sortBy} onValueChange={(value: "low-high" | "high-low") => setSortBy(value)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low-high">Price: Low to High</SelectItem>
              <SelectItem value="high-low">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {properties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">No properties found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
              <Link to="/"><Button className="bg-primary hover:bg-primary/90">Back to Search</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={property.thumbnail} alt={property.name} className="w-full h-48 object-cover" />
                  <Badge className="absolute top-2 right-2 text-white border-0" style={{ backgroundColor: property.system === 'nightsbridge' ? '#FF88D1' : '#10b981' }}>
                    {property.system === 'nightsbridge' ? <><Hotel className="h-3 w-3 mr-1" /> NightsBridge</> : <><CheckCircle className="h-3 w-3 mr-1" /> Checkfront</>}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-foreground">{property.name}</CardTitle>
                  <CardDescription className="text-foreground/70">{property.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary">R{property.rateFrom}</span>
                    <span className="text-sm text-foreground/70">per night</span>
                  </div>
                  <div className="flex items-center text-sm text-foreground/70">
                    <Users className="h-4 w-4 mr-1" />Up to {property.maxGuests} guests
                  </div>
                </CardContent>
                <CardFooter><Button className="w-full" onClick={() => handleViewDetails(property.id)}>View Details</Button></CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
