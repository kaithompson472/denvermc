/**
 * Colorado location data for SEO and LocalBusiness schema generation
 */

export interface Location {
  name: string;
  slug: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  shortDescription: string;
  region: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  timezone: string;
  population?: number;
  elevation?: number; // in feet
  areaInfo?: string;
  meshCoverage?: 'excellent' | 'good' | 'growing' | 'planned';
}

export const COLORADO_LOCATIONS: Location[] = [
  {
    name: 'Denver',
    slug: 'denver',
    coordinates: {
      lat: 39.7392,
      lng: -104.9903,
    },
    description:
      'Denver is the capital and most populous city of Colorado, serving as the hub of the Denver MeshCore network. The Mile High City offers excellent mesh coverage with nodes across downtown, surrounding neighborhoods, and into the foothills.',
    shortDescription: 'Capital city and MeshCore network hub',
    region: 'Denver Metro',
    state: 'Colorado',
    stateCode: 'CO',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Denver',
    population: 715522,
    elevation: 5280,
    areaInfo: 'Denver Metro Area',
    meshCoverage: 'excellent',
  },
  {
    name: 'Boulder',
    slug: 'boulder',
    coordinates: {
      lat: 40.015,
      lng: -105.2705,
    },
    description:
      'Boulder is a vibrant city nestled against the foothills of the Rocky Mountains. Known for its tech-savvy community and outdoor lifestyle, Boulder is an ideal location for mesh network expansion with its mix of urban density and mountain terrain.',
    shortDescription: 'Tech hub at the base of the Rockies',
    region: 'Boulder County',
    state: 'Colorado',
    stateCode: 'CO',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Denver',
    population: 105485,
    elevation: 5430,
    areaInfo: 'Boulder-Denver Corridor',
    meshCoverage: 'good',
  },
  {
    name: 'Colorado Springs',
    slug: 'colorado-springs',
    coordinates: {
      lat: 38.8339,
      lng: -104.8214,
    },
    description:
      'Colorado Springs is the second-largest city in Colorado, located at the base of Pikes Peak. The city has a growing mesh network community with coverage expanding across the metropolitan area and excellent potential for mountain-top repeater nodes.',
    shortDescription: 'Gateway to Pikes Peak with growing mesh coverage',
    region: 'El Paso County',
    state: 'Colorado',
    stateCode: 'CO',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Denver',
    population: 478961,
    elevation: 6035,
    areaInfo: 'Pikes Peak Region',
    meshCoverage: 'growing',
  },
  {
    name: 'Fort Collins',
    slug: 'fort-collins',
    coordinates: {
      lat: 40.5853,
      lng: -105.0844,
    },
    description:
      'Fort Collins is a vibrant college town and craft beer capital of Colorado. Home to Colorado State University, the city has an active tech and maker community perfect for mesh network adoption and development.',
    shortDescription: 'College town with active maker community',
    region: 'Larimer County',
    state: 'Colorado',
    stateCode: 'CO',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Denver',
    population: 169810,
    elevation: 5003,
    areaInfo: 'Northern Colorado',
    meshCoverage: 'growing',
  },
  {
    name: 'Golden',
    slug: 'golden',
    coordinates: {
      lat: 39.7555,
      lng: -105.2211,
    },
    description:
      'Golden is a historic mountain town at the base of Lookout Mountain, home to the Colorado School of Mines and Coors Brewery. Its elevated position and proximity to Denver makes it an excellent location for mesh network repeaters and nodes.',
    shortDescription: 'Historic mountain town ideal for mesh repeaters',
    region: 'Jefferson County',
    state: 'Colorado',
    stateCode: 'CO',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Denver',
    population: 20399,
    elevation: 5675,
    areaInfo: 'Denver Foothills',
    meshCoverage: 'good',
  },
];

/**
 * Get a location by its slug
 */
export function getLocationBySlug(slug: string): Location | undefined {
  return COLORADO_LOCATIONS.find((loc) => loc.slug === slug);
}

/**
 * Get all location slugs for static path generation
 */
export function getAllLocationSlugs(): string[] {
  return COLORADO_LOCATIONS.map((loc) => loc.slug);
}

/**
 * Get the primary location (Denver)
 */
export function getPrimaryLocation(): Location {
  return COLORADO_LOCATIONS[0];
}

/**
 * Get locations by mesh coverage level
 */
export function getLocationsByCoverage(
  coverage: Location['meshCoverage']
): Location[] {
  return COLORADO_LOCATIONS.filter((loc) => loc.meshCoverage === coverage);
}
