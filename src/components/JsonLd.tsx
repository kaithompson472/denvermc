import { BASE_URL } from '@/lib/constants';

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Sanitizes JSON string for safe use in dangerouslySetInnerHTML.
 * Escapes <, >, and & characters to prevent XSS attacks.
 * This prevents injection of </script> tags or other HTML entities.
 */
function sanitizeJsonLd(json: string): string {
  return json
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

export default function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data);
  const sanitizedJson = sanitizeJsonLd(jsonString);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJson }}
    />
  );
}

// Organization Schema - Denver MeshCore identity
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Denver MeshCore Community',
  alternateName: 'Denver MeshCore',
  url: BASE_URL,
  logo: `${BASE_URL}/logo-512.png`,
  description:
    'A community-driven initiative building a decentralized mesh network across the Colorado Front Range using LoRa technology for off-grid communication.',
  foundingLocation: {
    '@type': 'Place',
    name: 'Denver, Colorado',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Denver',
      addressRegion: 'CO',
      addressCountry: 'US',
    },
  },
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 39.7392,
      longitude: -104.9903,
    },
    geoRadius: '150 mi',
  },
  sameAs: ['https://discord.gg/QpaW8FTTCE'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'community support',
    url: 'https://discord.gg/QpaW8FTTCE',
  },
  knowsAbout: [
    'Mesh Networking',
    'LoRa Technology',
    'Decentralized Communication',
    'Off-grid Communication',
    'Emergency Preparedness',
    'MeshCore Protocol',
  ],
};

// WebSite Schema with SearchAction for sitelinks
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'Denver MeshCore Community Platform',
  alternateName: 'Denver MeshCore',
  url: BASE_URL,
  description:
    "Building Colorado's decentralized mesh network community. Connect off-grid using LoRa technology across the Front Range.",
  publisher: {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
  },
  inLanguage: 'en-US',
};

// CommunityOrganization Schema - Local Denver focus
export const communityOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'CommunityOrganization',
  '@id': `${BASE_URL}/#community`,
  name: 'Denver MeshCore Community',
  alternateName: 'Denver MeshCore',
  url: BASE_URL,
  logo: `${BASE_URL}/logo-512.png`,
  image: `${BASE_URL}/logo-512.png`,
  description:
    'A grassroots community building a resilient, decentralized mesh network across the Colorado Front Range for off-grid and emergency communication.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Denver',
    addressRegion: 'Colorado',
    postalCode: '80202',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.7392,
    longitude: -104.9903,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Denver',
      '@id': 'https://www.wikidata.org/wiki/Q16554',
    },
    {
      '@type': 'State',
      name: 'Colorado',
      '@id': 'https://www.wikidata.org/wiki/Q1261',
    },
  ],
  priceRange: 'Free',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '00:00',
    closes: '23:59',
  },
};
