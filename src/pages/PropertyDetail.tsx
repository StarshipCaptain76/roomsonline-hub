import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { 
  Hotel, 
  CheckCircle, 
  Users, 
  Wifi, 
  Waves,
  Flame,
  Car,
  Wind,
  Home,
  MapPin,
  Star,
  ArrowLeft
} from "lucide-react";
import mockProperties from "@/data/mockProperties";
import { differenceInDays, addDays, parse } from "date-fns";
import { DateRange } from "react-day-picker";

const PropertyDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const property = mockProperties.find(p => p.id === id);

  // Parse search params with fallbacks
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const guestsParam = searchParams.get("guests");

  const checkIn = checkInParam ? parse(checkInParam, "yyyy-MM-dd", new Date()) : new Date();
  const checkOut = checkOutParam ? parse(checkOutParam, "yyyy-MM-dd", new Date()) : addDays(new Date(), 7);
  const guests = guestsParam ? parseInt(guestsParam) : 2;

  // Calculate pricing
  const nights = differenceInDays(checkOut, checkIn);
  const subtotal = property ? property.rateFrom * nights : 0;
  const cleaningFee = 500;
  const serviceFee = subtotal * 0.075;
  const total = subtotal + cleaningFee + serviceFee;

  const dateRange: DateRange = {
    from: checkIn,
    to: checkOut,
  };

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Pool': Waves,
    'Braai': Flame,
    'Parking': Car,
    'Air Con': Wind,
    'Garden': Home,
  };

  const handleBookNow = () => {
    const params = new URLSearchParams(searchParams);
    navigate(`/booking/${id}?${params.toString()}`);
  };

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Property not found</h2>
              <p className="text-muted-foreground mb-6">
                Sorry, we couldn't find the property you're looking for.
              </p>
              <Link to="/search">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{property.name} | RoomsOnline Booking</title>
        <meta name="description" content={`Book ${property.name} in ${property.location}. From R${property.rateFrom}/night. ${property.description.substring(0, 120)}...`} />
      </Helmet>
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        {/* Hero Section */}
        <div className="relative w-full h-64 md:h-96">
          <img 
            src={property.thumbnail} 
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* System Badge */}
          <Badge 
            className="absolute top-4 right-4 text-white border-0"
            style={{ 
              backgroundColor: property.system === 'nightsbridge' ? '#FF88D1' : '#10b981' 
            }}
          >
            {property.system === 'nightsbridge' ? (
              <><Hotel className="h-3 w-3 mr-1" /> NightsBridge</>
            ) : (
              <><CheckCircle className="h-3 w-3 mr-1" /> Checkfront</>
            )}
          </Badge>

          {/* Rate Badge */}
          <div 
            className="absolute bottom-4 left-4 px-4 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: 'rgba(255, 136, 209, 0.9)' }}
          >
            From R{property.rateFrom} / night
          </div>

          {/* Property Info Overlay */}
          <div className="absolute bottom-4 right-4 text-right">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {property.name}
            </h1>
            <p className="text-lg text-white/90 drop-shadow flex items-center justify-end gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {property.location}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>About this property</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p style={{ color: '#545454' }}>
                        {property.description}
                      </p>
                      
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span style={{ color: '#545454' }}>Up to {property.maxGuests} guests</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <h3 className="font-semibold text-lg mb-3" style={{ color: '#545454' }}>
                          Pricing Breakdown
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between" style={{ color: '#545454' }}>
                            <span>R{property.rateFrom} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                            <span>R{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between" style={{ color: '#545454' }}>
                            <span>Cleaning fee</span>
                            <span>R{cleaningFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between" style={{ color: '#545454' }}>
                            <span>Service fee (7.5%)</span>
                            <span>R{serviceFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold pt-3 border-t">
                            <span style={{ color: '#FF88D1' }}>Total</span>
                            <span style={{ color: '#FF88D1' }}>R{total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="amenities">
                  <Card>
                    <CardHeader>
                      <CardTitle>What this place offers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map((amenity) => {
                          const Icon = amenityIcons[amenity] || Home;
                          return (
                            <Badge 
                              key={amenity} 
                              variant="outline" 
                              className="flex items-center gap-2 p-3 justify-start"
                              style={{ borderColor: '#FF88D1', color: '#545454' }}
                            >
                              <Icon className="h-4 w-4" style={{ color: '#FF88D1' }} />
                              {amenity}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location">
                  <Card>
                    <CardHeader>
                      <CardTitle>Where you'll be</CardTitle>
                      <CardDescription>{property.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(property.location)}&zoom=12`}
                          allowFullScreen
                        />
                      </div>
                      <p className="mt-4" style={{ color: '#545454' }}>
                        Located in the heart of {property.location.split(',')[0]}, this property offers easy access to local attractions, restaurants, and natural beauty.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle>Guest Reviews</CardTitle>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className="h-5 w-5 fill-current" 
                              style={{ color: '#FF88D1' }}
                            />
                          ))}
                          <span className="ml-2 font-semibold" style={{ color: '#545454' }}>4.8</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: "Sarah M.", date: "March 2024", review: "Absolutely stunning property! The views were breathtaking and the amenities exceeded our expectations. Would definitely return." },
                        { name: "John D.", date: "February 2024", review: "Perfect location and beautifully maintained. The host was responsive and helpful. Great experience overall." },
                        { name: "Lisa K.", date: "January 2024", review: "Wonderful stay! The property was exactly as described. Clean, comfortable, and in a fantastic area. Highly recommend!" }
                      ].map((review, idx) => (
                        <div key={idx} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold" style={{ color: '#545454' }}>{review.name}</span>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p style={{ color: '#545454' }}>{review.review}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Stay</CardTitle>
                    <CardDescription style={{ color: '#545454' }}>
                      {guests} {guests === 1 ? 'guest' : 'guests'} · {nights} {nights === 1 ? 'night' : 'nights'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      className="rounded-md border pointer-events-none"
                      disabled
                    />
                  </CardContent>
                </Card>

                {/* Desktop Book Now Button */}
                <Button 
                  size="lg" 
                  className="w-full text-lg hidden md:flex"
                  onClick={handleBookNow}
                  style={{ backgroundColor: '#FF88D1', color: 'white' }}
                >
                  Book Now – R{total.toFixed(0)}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden z-50 safe-area-bottom">
          <Button 
            size="lg" 
            className="w-full text-lg"
            onClick={handleBookNow}
            style={{ backgroundColor: '#FF88D1', color: 'white' }}
          >
            Book Now – R{total.toFixed(0)}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetail;
