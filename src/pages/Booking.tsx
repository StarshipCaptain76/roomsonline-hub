import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInDays, addDays } from "date-fns";
import { ArrowLeft, Hotel, CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import mockProperties from "@/data/mockProperties";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number is required")
    .regex(/^(\+27|0)[6-8][0-9]{8}$/, "Please enter a valid SA phone number"),
  specialRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const Booking = () => {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get search params with fallback defaults
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const guestsParam = searchParams.get("guests");

  const today = new Date();
  const defaultCheckIn = addDays(today, 7);
  const defaultCheckOut = addDays(today, 14);

  const checkIn = checkInParam ? new Date(checkInParam) : defaultCheckIn;
  const checkOut = checkOutParam ? new Date(checkOutParam) : defaultCheckOut;
  const guests = guestsParam ? parseInt(guestsParam, 10) : 2;

  // Calculate pricing
  const nights = differenceInDays(checkOut, checkIn);
  const subtotal = property ? property.price_per_night * nights : 0;
  const cleaningFee = 500;
  const serviceFee = subtotal * 0.075;
  const grandTotal = subtotal + cleaningFee + serviceFee;

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      specialRequests: "",
    },
  });

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("availability", {
          body: {
            checkIn: format(checkIn, "yyyy-MM-dd"),
            checkOut: format(checkOut, "yyyy-MM-dd"),
            guests,
          },
        });

        if (error) throw error;

        const foundProperty = data.properties?.find(
          (p: any) => p.id === propertyId
        );

        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          // Fallback to mockProperties
          const mockProperty = mockProperties.find((p) => p.id === propertyId);
          setProperty(
            mockProperty
              ? {
                  ...mockProperty,
                  price_per_night: mockProperty.rateFrom,
                  booking_system: mockProperty.system,
                }
              : null
          );
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        // Fallback to mockProperties
        const mockProperty = mockProperties.find((p) => p.id === propertyId);
        setProperty(
          mockProperty
            ? {
                ...mockProperty,
                price_per_night: mockProperty.rateFrom,
                booking_system: mockProperty.system,
              }
            : null
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, checkIn, checkOut, guests]);

  const onSubmit = (values: BookingFormValues) => {
    const bookingData = {
      property: {
        id: propertyId,
        name: property.name,
        location: property.location,
      },
      dates: {
        checkIn: format(checkIn, "yyyy-MM-dd"),
        checkOut: format(checkOut, "yyyy-MM-dd"),
        nights,
      },
      guests,
      guestDetails: values,
      pricing: {
        subtotal,
        cleaningFee,
        serviceFee,
        grandTotal,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Booking confirmed:", bookingData);

    toast.success("Booking confirmed! (demo mode)", {
      description: `Your booking for ${property.name} has been confirmed.`,
      duration: 5000,
    });
  };

  const handleBack = () => {
    navigate(
      `/property/${propertyId}?checkIn=${format(checkIn, "yyyy-MM-dd")}&checkOut=${format(checkOut, "yyyy-MM-dd")}&guests=${guests}`
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-foreground/80 mb-4">Property not found</p>
              <Button onClick={() => navigate("/search")} variant="default">
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to property
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Property summary card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={property.thumbnail || property.images?.[0]}
                    alt={property.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">
                          {property.name}
                        </h1>
                        <p className="text-sm text-foreground/70">
                          {property.location}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 ${
                          property.booking_system === "nightsbridge"
                            ? "bg-[hsl(318,100%,76%)]"
                            : "bg-emerald-500"
                        }`}
                      >
                        {property.booking_system === "nightsbridge" ? (
                          <Hotel className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {property.booking_system === "nightsbridge"
                          ? "NightsBridge"
                          : "Checkfront"}
                      </div>
                    </div>
                    <div className="text-sm text-foreground/70 mt-4">
                      <p>
                        {format(checkIn, "d MMM yyyy")} –{" "}
                        {format(checkOut, "d MMM yyyy")}
                      </p>
                      <p>
                        {guests} {guests === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest details form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Guest Details
                </h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              className="text-foreground"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Email *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                              className="text-foreground"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Phone Number *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="0821234567 or +27821234567"
                              {...field}
                              className="text-foreground"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Special Requests (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requests or requirements..."
                              className="min-h-[100px] text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mobile submit button */}
                    <div className="md:hidden pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-[hsl(318,100%,76%)] hover:bg-[hsl(318,100%,70%)] text-white"
                      >
                        Confirm & Pay – R{grandTotal.toFixed(2)}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Price breakdown sidebar (desktop) */}
          <div className="hidden md:block">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Price Breakdown
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-foreground/80">
                    <span>
                      R{property.price_per_night} × {nights}{" "}
                      {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-foreground/80">
                    <span>Cleaning fee</span>
                    <span>R{cleaningFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-foreground/80">
                    <span>Service fee (7.5%)</span>
                    <span>R{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-foreground">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-[hsl(318,100%,76%)]">
                        R{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  size="lg"
                  className="w-full mt-6 bg-[hsl(318,100%,76%)] hover:bg-[hsl(318,100%,70%)] text-white"
                >
                  Confirm & Pay – R{grandTotal.toFixed(2)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg safe-bottom">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-foreground/70">Total</p>
            <p className="text-xl font-bold text-[hsl(318,100%,76%)]">
              R{grandTotal.toFixed(2)}
            </p>
          </div>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            size="lg"
            className="bg-[hsl(318,100%,76%)] hover:bg-[hsl(318,100%,70%)] text-white"
          >
            Confirm & Pay
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Booking;
