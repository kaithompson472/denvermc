import type { Location } from '../data/locations';

interface LocalBusinessOptions {
  /** Business name (defaults to "Denver MeshCore") */
  name?: string;
  /** Business description */
  description?: string;
  /** Website URL */
  url?: string;
  /** Logo URL */
  logo?: string;
  /** Contact email */
  email?: string;
  /** Business type override (defaults to "Organization") */
  businessType?: string;
  /** Opening hours (for physical locations) */
  openingHours?: string;
  /** Price range ($ to $$$$) */
  priceRange?: string;
  /** Same-as links (social profiles) */
  sameAs?: string[];
  /** Area served description */
  areaServed?: string;
}

/**
 * Generate LocalBusiness/Organization schema for a specific location
 * Used for local SEO and Google Business Profile optimization
 */
export function generateLocalBusinessSchema(
  location: Location,
  options: LocalBusinessOptions = {}
) {
  const {
    name = 'Denver MeshCore',
    description = `${name} provides decentralized mesh networking infrastructure and community support in ${location.name}, ${location.state}. Join Colorado's growing off-grid communication network.`,
    url = 'https://denvermc.org',
    logo = 'https://denvermc.org/logo.png',
    email = 'hello@denvermc.org',
    businessType = 'Organization',
    sameAs = [
      'https://discord.gg/QpaW8FTTCE',
      'https://github.com/ryandonovan93',
    ],
    areaServed = `${location.name} and surrounding ${location.region} area`,
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': businessType,
    name: `${name} - ${location.name}`,
    description,
    url,
    logo,
    email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.name,
      addressRegion: location.stateCode,
      addressCountry: location.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
    },
    areaServed: {
      '@type': 'Place',
      name: areaServed,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
      },
    },
    sameAs,
    ...(options.openingHours && { openingHours: options.openingHours }),
    ...(options.priceRange && { priceRange: options.priceRange }),
  };
}

interface PlaceSchemaOptions {
  /** Additional description */
  description?: string;
  /** URL for more information */
  url?: string;
  /** Image URLs */
  images?: string[];
}

/**
 * Generate Place schema for location-based pages
 * Helps with geographic SEO and map integration
 */
export function generatePlaceSchema(
  location: Location,
  options: PlaceSchemaOptions = {}
) {
  const {
    description = location.description,
    url = `https://denvermc.org/locations/${location.slug}`,
    images = [],
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${location.name}, ${location.stateCode}`,
    description,
    url,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.name,
      addressRegion: location.stateCode,
      addressCountry: location.countryCode,
    },
    ...(images.length > 0 && { image: images }),
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: location.region,
    },
  };
}

interface ServiceAreaOptions {
  /** Service name */
  serviceName?: string;
  /** Service description */
  serviceDescription?: string;
  /** Provider name */
  providerName?: string;
}

/**
 * Generate ServiceArea schema for mesh network coverage
 * Useful for local service SEO
 */
export function generateServiceAreaSchema(
  locations: Location[],
  options: ServiceAreaOptions = {}
) {
  const {
    serviceName = 'MeshCore Network Coverage',
    serviceDescription = 'Decentralized off-grid mesh communication network using LoRa technology',
    providerName = 'Denver MeshCore',
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@type': 'Organization',
      name: providerName,
      url: 'https://denvermc.org',
    },
    areaServed: locations.map((location) => ({
      '@type': 'City',
      name: location.name,
      containedInPlace: {
        '@type': 'State',
        name: location.state,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
      },
    })),
    serviceType: 'Mesh Network Communication',
  };
}

/**
 * Generate GeoShape schema for service coverage area
 * Can be used to define polygon coverage areas
 */
export function generateGeoCircleSchema(
  location: Location,
  radiusMiles: number = 25
) {
  // Convert miles to meters (1 mile = 1609.34 meters)
  const radiusMeters = radiusMiles * 1609.34;

  return {
    '@context': 'https://schema.org',
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
    },
    geoRadius: radiusMeters,
  };
}
