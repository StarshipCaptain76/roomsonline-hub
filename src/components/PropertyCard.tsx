import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, BedDouble, Bath } from "lucide-react";

interface PropertyCardProps {
  id: string;
  name: string;
  location: string;
  propertyType: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  currency: string;
  images: string[];
  amenities: string[];
}

export const PropertyCard = ({
  name,
  location,
  propertyType,
  maxGuests,
  bedrooms,
  bathrooms,
  pricePerNight,
  currency,
  images,
  amenities,
}: PropertyCardProps) => {
  const imageUrl = images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945";

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm">
          {propertyType.replace("_", " ")}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground">{name}</h3>
        <div className="flex items-center text-muted-foreground mb-3 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{maxGuests}</span>
          </div>
          <div className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms}</span>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-muted-foreground text-sm">per night</span>
          <span className="text-2xl font-bold text-primary">
            {currency} {pricePerNight}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};