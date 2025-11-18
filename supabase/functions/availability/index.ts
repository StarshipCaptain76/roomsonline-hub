import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidGuests = (guests: number): boolean => {
  return Number.isInteger(guests) && guests >= 1 && guests <= 50;
};

// Mock properties data - in production, this would query actual APIs
const mockProperties = [
  {
    id: 'nb-franschhoek-1',
    system: 'nightsbridge' as const,
    name: 'Vineyard Escape Villa',
    location: 'Franschhoek, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    rateFrom: 2200,
    maxGuests: 8,
    description: 'Luxurious villa nestled in the heart of wine country with panoramic mountain views.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Wine Cellar']
  },
  {
    id: 'nb-franschhoek-2',
    system: 'nightsbridge' as const,
    name: 'Mountain View Manor',
    location: 'Franschhoek, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    rateFrom: 1800,
    maxGuests: 6,
    description: 'Elegant manor house with stunning mountain vistas and modern amenities.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Garden']
  },
  {
    id: 'nb-franschhoek-3',
    system: 'nightsbridge' as const,
    name: 'Valley Retreat Cottage',
    location: 'Franschhoek, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
    rateFrom: 1500,
    maxGuests: 4,
    description: 'Cozy cottage surrounded by vineyards, perfect for romantic getaways.',
    amenities: ['WiFi', 'Fireplace', 'Braai', 'Parking']
  },
  {
    id: 'nb-franschhoek-4',
    system: 'nightsbridge' as const,
    name: 'Estate House Deluxe',
    location: 'Franschhoek, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    rateFrom: 2100,
    maxGuests: 10,
    description: 'Grand estate house with luxury finishes and entertainment areas.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Tennis Court', 'Cinema']
  },
  {
    id: 'nb-sedgefield-1',
    system: 'nightsbridge' as const,
    name: 'Coastal Haven',
    location: 'Sedgefield, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    rateFrom: 1200,
    maxGuests: 4,
    description: 'Beach house with direct lagoon access and ocean views.',
    amenities: ['WiFi', 'Braai', 'Parking', 'Beach Access']
  },
  {
    id: 'nb-sedgefield-2',
    system: 'nightsbridge' as const,
    name: 'Lagoon Lodge',
    location: 'Sedgefield, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
    rateFrom: 1800,
    maxGuests: 8,
    description: 'Spacious lodge overlooking the tranquil lagoon waters.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Kayaks', 'Beach Access']
  },
  {
    id: 'cf-knysna-1',
    system: 'checkfront' as const,
    name: 'Forest Edge Estate',
    location: 'Knysna, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    rateFrom: 2500,
    maxGuests: 12,
    description: 'Luxury estate on the forest edge with spectacular lagoon views.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Jacuzzi', 'Game Room']
  },
  {
    id: 'cf-knysna-2',
    system: 'checkfront' as const,
    name: 'Waterfront Villa',
    location: 'Knysna, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    rateFrom: 2200,
    maxGuests: 8,
    description: 'Modern villa with private jetty and panoramic water views.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Boat Jetty']
  },
  {
    id: 'cf-plettenberg-1',
    system: 'checkfront' as const,
    name: 'Ocean View Retreat',
    location: 'Plettenberg Bay, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    rateFrom: 2400,
    maxGuests: 10,
    description: 'Stunning retreat with uninterrupted ocean views and private beach access.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Beach Access', 'Gym']
  },
  {
    id: 'cf-plettenberg-2',
    system: 'checkfront' as const,
    name: 'Bay House Luxury',
    location: 'Plettenberg Bay, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    rateFrom: 1900,
    maxGuests: 6,
    description: 'Contemporary beach house with designer interiors.',
    amenities: ['WiFi', 'Braai', 'Parking', 'Beach Access']
  },
  {
    id: 'cf-hermanus-1',
    system: 'checkfront' as const,
    name: 'Whale Watch Villa',
    location: 'Hermanus, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop',
    rateFrom: 2100,
    maxGuests: 8,
    description: 'Prime whale-watching location with cliff-top position.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Ocean Views']
  },
  {
    id: 'cf-hermanus-2',
    system: 'checkfront' as const,
    name: 'Cliff House Sanctuary',
    location: 'Hermanus, Western Cape',
    thumbnail: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&h=300&fit=crop',
    rateFrom: 2300,
    maxGuests: 10,
    description: 'Exclusive sanctuary perched on dramatic cliffs.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Spa', 'Wine Cellar']
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const checkIn = url.searchParams.get('checkIn');
    const checkOut = url.searchParams.get('checkOut');
    const guestsParam = url.searchParams.get('guests');
    const location = url.searchParams.get('location')?.toLowerCase();

    // Validate required parameters
    if (!checkIn || !checkOut) {
      console.error('Validation failed: Missing required parameters');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters: checkIn and checkOut' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date formats
    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      console.error('Validation failed: Invalid date format');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid date format. Use YYYY-MM-DD format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate dates
    if (checkInDate < today) {
      console.error('Validation failed: Check-in date must be in the future');
      return new Response(
        JSON.stringify({ success: false, error: 'Check-in date must be in the future' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (checkOutDate <= checkInDate) {
      console.error('Validation failed: Check-out date must be after check-in date');
      return new Response(
        JSON.stringify({ success: false, error: 'Check-out date must be after check-in date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate guests parameter
    const guests = parseInt(guestsParam || '2');
    if (!isValidGuests(guests)) {
      console.error('Validation failed: Invalid guests value');
      return new Response(
        JSON.stringify({ success: false, error: 'Guests must be an integer between 1 and 50' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Availability query: checkIn=${checkIn}, checkOut=${checkOut}, guests=${guests}, location=${location}`);

    // Simulate querying NightsBridge
    const nightsbridgeProperties = mockProperties.filter(p => {
      const matchesSystem = p.system === 'nightsbridge';
      const matchesGuests = p.maxGuests >= guests;
      const matchesLocation = !location || 
        p.name.toLowerCase().includes(location) || 
        p.location.toLowerCase().includes(location);
      const isAvailable = Math.random() > 0.3; // 70% availability simulation
      
      return matchesSystem && matchesGuests && matchesLocation && isAvailable;
    });

    console.log(`Mock: Fetched ${nightsbridgeProperties.length} from NightsBridge`);

    // Simulate querying Checkfront
    const checkfrontProperties = mockProperties.filter(p => {
      const matchesSystem = p.system === 'checkfront';
      const matchesGuests = p.maxGuests >= guests;
      const matchesLocation = !location || 
        p.name.toLowerCase().includes(location) || 
        p.location.toLowerCase().includes(location);
      const isAvailable = Math.random() > 0.3; // 70% availability simulation
      
      return matchesSystem && matchesGuests && matchesLocation && isAvailable;
    });

    console.log(`Mock: Fetched ${checkfrontProperties.length} from Checkfront`);

    // Merge and sort results
    const allProperties = [...nightsbridgeProperties, ...checkfrontProperties]
      .map(p => ({ ...p, available: true }))
      .sort((a, b) => a.rateFrom - b.rateFrom);

    return new Response(
      JSON.stringify({
        success: true,
        properties: allProperties,
        totalCount: allProperties.length,
        breakdown: {
          nightsbridge: nightsbridgeProperties.length,
          checkfront: checkfrontProperties.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in availability function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
