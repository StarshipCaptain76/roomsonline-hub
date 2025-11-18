import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SearchForm } from "@/components/SearchForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Hotel, CheckCircle, Search as SearchIcon, Users } from "lucide-react";
import mockProperties, { Property } from "@/data/mockProperties";
import { toast } from "sonner";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"low-high" | "high-low">("low-high");

  useEffect(() => {
    // Check if search params exist
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");

    if (!checkIn || !checkOut || !guests) {
      toast.error("Please enter search criteria");
      navigate("/");
      return;
    }

    // Simulate loading
    setTimeout(() => {
      filterProperties();
      setLoading(false);
    }, 500);
  }, [searchParams, navigate]);

  const filterProperties = () => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = parseInt(searchParams.get("guests") || "1");
    const location = searchParams.get("location")?.toLowerCase();

    const checkInDate = checkIn ? new Date(checkIn) : new Date();
    const checkOutDate = checkOut ? new Date(checkOut) : new Date();
    const now = new Date();

    let filtered = mockProperties.filter((property) => {
      // Filter by guest capacity
      if (property.maxGuests < guests) return false;

      // Filter by location if provided
      if (location && !property.name.toLowerCase().includes(location) && !property.location.toLowerCase().includes(location)) {
        return false;
      }

      // Simulate availability (70% chance available if dates are valid)
      if (checkInDate > now && checkOutDate > checkInDate) {
        return Math.random() > 0.3;
      }

      return false;
    });

    setProperties(filtered);
  };

  useEffect(() => {
    if (properties.length > 0) {
      const sorted = [...properties].sort((a, b) => {
        if (sortBy === "low-high") {
          return a.rateFrom - b.rateFrom;
        } else {
          return b.rateFrom - a.rateFrom;
        }
      });
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
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <SearchForm />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchForm />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {properties.length} {properties.length === 1 ? "Property" : "Properties"} Found
            </h2>
            <p className="text-muted-foreground">
              {searchParams.get("guests") && `For ${searchParams.get("guests")} guests`}
              {searchParams.get("location") && ` in ${searchParams.get("location")}`}
            </p>
          </div>
          
          {properties.length > 0 && (
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={(value: "low-high" | "high-low") => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low-high">Price: Low to High</SelectItem>
                  <SelectItem value="high-low">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {properties.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="pt-6">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No properties match your search</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your dates, number of guests, or location.
              </p>
              <Link to="/">
                <Button variant="default">Back to Search</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={property.thumbnail} 
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge 
                    className="absolute top-2 right-2"
                    variant={property.system === 'nightsbridge' ? 'default' : 'secondary'}
                  >
                    {property.system === 'nightsbridge' ? (
                      <><Hotel className="h-3 w-3 mr-1" /> NightsBridge</>
                    ) : (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Checkfront</>
                    )}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{property.name}</CardTitle>
                  <CardDescription className="text-sm">{property.location}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{property.maxGuests} guests max</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-2xl font-bold text-primary">
                        From R{property.rateFrom}
                        <span className="text-sm font-normal text-muted-foreground">/night</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleViewDetails(property.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;