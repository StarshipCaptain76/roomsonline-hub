export interface Property {
  id: string;
  system: 'nightsbridge' | 'checkfront';
  name: string;
  location: string;
  thumbnail: string;
  rateFrom: number;
  maxGuests: number;
  description: string;
  amenities: string[];
}

const locations = {
  franschhoek: 'Franschhoek, Western Cape',
  sedgefield: 'Sedgefield, Garden Route',
  hermanus: 'Hermanus, Western Cape',
  plettenberg: 'Plettenberg Bay, Garden Route',
  knysna: 'Knysna, Garden Route',
  stellenbosch: 'Stellenbosch, Western Cape',
};

const mockProperties: Property[] = [
  // NightsBridge properties
  {
    id: 'nb-franschhoek-1',
    system: 'nightsbridge',
    name: 'Vineyard Escape Villa',
    location: locations.franschhoek,
    thumbnail: `https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop`,
    rateFrom: 1800,
    maxGuests: 6,
    description: 'Luxurious villa nestled among vineyards with breathtaking mountain views and modern amenities.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Air Con'],
  },
  {
    id: 'nb-franschhoek-2',
    system: 'nightsbridge',
    name: 'Mountain View Cottage',
    location: locations.franschhoek,
    thumbnail: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop`,
    rateFrom: 1500,
    maxGuests: 4,
    description: 'Cozy cottage with stunning views, perfect for a romantic getaway in the heart of wine country.',
    amenities: ['WiFi', 'Fireplace', 'Braai', 'Parking'],
  },
  {
    id: 'nb-franschhoek-3',
    system: 'nightsbridge',
    name: 'Winelands Luxury Estate',
    location: locations.franschhoek,
    thumbnail: `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop`,
    rateFrom: 2200,
    maxGuests: 8,
    description: 'Spacious estate with private pool, wine cellar, and panoramic views of the Franschhoek valley.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Wine Cellar', 'Air Con'],
  },
  {
    id: 'nb-franschhoek-4',
    system: 'nightsbridge',
    name: 'French Corner Retreat',
    location: locations.franschhoek,
    thumbnail: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop`,
    rateFrom: 1650,
    maxGuests: 5,
    description: 'Charming retreat with French-inspired design, close to top restaurants and wine estates.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Garden'],
  },
  {
    id: 'nb-sedgefield-1',
    system: 'nightsbridge',
    name: 'Coastal Haven',
    location: locations.sedgefield,
    thumbnail: `https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=400&h=300&fit=crop`,
    rateFrom: 1200,
    maxGuests: 6,
    description: 'Beach house steps from the ocean, ideal for families seeking sun, sand, and relaxation.',
    amenities: ['WiFi', 'Braai', 'Parking', 'Beach Access'],
  },
  {
    id: 'nb-sedgefield-2',
    system: 'nightsbridge',
    name: 'Lagoon View Lodge',
    location: locations.sedgefield,
    thumbnail: `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop`,
    rateFrom: 1400,
    maxGuests: 4,
    description: 'Peaceful lodge overlooking the lagoon, perfect for bird watching and water sports.',
    amenities: ['WiFi', 'Braai', 'Parking', 'Kayaks', 'Garden'],
  },
  // Checkfront properties
  {
    id: 'cf-hermanus-1',
    system: 'checkfront',
    name: 'Ocean View Retreat',
    location: locations.hermanus,
    thumbnail: `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop`,
    rateFrom: 2500,
    maxGuests: 8,
    description: 'Spectacular oceanfront property with whale watching from your balcony during season.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Sea View', 'Air Con'],
  },
  {
    id: 'cf-plettenberg-1',
    system: 'checkfront',
    name: 'Beachfront Paradise',
    location: locations.plettenberg,
    thumbnail: `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop`,
    rateFrom: 2200,
    maxGuests: 10,
    description: 'Luxury beach house with direct beach access, infinity pool, and modern entertainment areas.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Beach Access', 'Air Con', 'DSTV'],
  },
  {
    id: 'cf-knysna-1',
    system: 'checkfront',
    name: 'Forest Edge Manor',
    location: locations.knysna,
    thumbnail: `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop`,
    rateFrom: 1900,
    maxGuests: 6,
    description: 'Elegant manor surrounded by indigenous forest with views of the Knysna Heads.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Garden', 'Fireplace'],
  },
  {
    id: 'cf-stellenbosch-1',
    system: 'checkfront',
    name: 'Oak Tree Estate',
    location: locations.stellenbosch,
    thumbnail: `https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop`,
    rateFrom: 1850,
    maxGuests: 7,
    description: 'Historic estate on working wine farm, offering authentic winelands experience.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Wine Tasting', 'Air Con'],
  },
  {
    id: 'cf-hermanus-2',
    system: 'checkfront',
    name: 'Clifftop Sanctuary',
    location: locations.hermanus,
    thumbnail: `https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop`,
    rateFrom: 2100,
    maxGuests: 6,
    description: 'Contemporary home perched on cliffs with panoramic ocean views and private jacuzzi.',
    amenities: ['WiFi', 'Jacuzzi', 'Braai', 'Parking', 'Sea View', 'Air Con'],
  },
  {
    id: 'cf-plettenberg-2',
    system: 'checkfront',
    name: 'Dolphin Bay Villa',
    location: locations.plettenberg,
    thumbnail: `https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop`,
    rateFrom: 1950,
    maxGuests: 8,
    description: 'Stunning villa in Plett, famous for dolphin sightings and pristine beaches nearby.',
    amenities: ['WiFi', 'Pool', 'Braai', 'Parking', 'Beach Access', 'Garden', 'DSTV'],
  },
];

export default mockProperties;
