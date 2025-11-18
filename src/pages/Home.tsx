import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  checkIn: z.date({
    required_error: "Check-in date is required",
  }).refine((date) => date > new Date(), {
    message: "Check-in must be in the future",
  }),
  checkOut: z.date({
    required_error: "Check-out date is required",
  }),
  guests: z.number({
    required_error: "Guests required",
  }).min(1, "At least 1 guest required").max(12, "Maximum 12 guests"),
  location: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Check-out must be after check-in",
  path: ["checkOut"],
});

type FormValues = z.infer<typeof formSchema>;

const Home = () => {
  const navigate = useNavigate();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: addDays(new Date(), 1),
      checkOut: addDays(new Date(), 8),
      guests: 2,
      location: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const params = new URLSearchParams({
      checkIn: format(data.checkIn, "yyyy-MM-dd"),
      checkOut: format(data.checkOut, "yyyy-MM-dd"),
      guests: data.guests.toString(),
      ...(data.location && { location: data.location }),
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <>
      <Helmet>
        <title>RoomsOnline - Find Your Perfect Stay in South Africa</title>
        <meta name="description" content="Book your perfect vacation rental in South Africa. Unified booking across NightsBridge, Checkfront, and more." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            Find Your Perfect Stay in South Africa
          </h1>

          <div className="bg-card border border-border rounded-lg shadow-xl p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-in Date</FormLabel>
                      <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setCheckInOpen(false);
                            }}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-out Date</FormLabel>
                      <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setCheckOutOpen(false);
                            }}
                            disabled={(date) =>
                              date < (form.getValues("checkIn") || new Date())
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guests</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of guests" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Cape Town, Franschhoek, Stellenbosch"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Availability
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Home;
