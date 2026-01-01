interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// Pre-built FAQ data from the /start page troubleshooting section
export const startPageFAQData: FAQItem[] = [
  {
    question: 'Why is my device not detected during flashing?',
    answer:
      'Try a different USB cable (use data cable, not charge-only), install CH340 or CP210x drivers for your device, hold BOOT button while connecting USB, or try a different USB port (USB 2.0 often works better).',
  },
  {
    question: 'Why are no other nodes visible on the mesh network?',
    answer:
      'Make sure you configured the preset for USA/Canada in the app, verify antenna is properly connected before powering on, move to a location with better line of sight, and note that nodes do not auto-discover - you need to add contacts or join channels.',
  },
  {
    question: 'Why cannot I connect to my MeshCore device via Bluetooth?',
    answer:
      'Make sure you flashed the Companion BLE firmware, enable Bluetooth on your phone and grant permissions, try restarting both devices, or forget the device in Bluetooth settings and re-pair.',
  },
  {
    question: 'Why is GPS not working on my MeshCore device?',
    answer:
      'Not all devices have GPS - check your hardware specs. Move outdoors with clear sky view, wait up to 5 minutes for initial GPS lock, and note that GPS may not work well indoors or near buildings.',
  },
  {
    question: 'How can I improve range and connection quality?',
    answer:
      'Use a quality external antenna if your device supports it, elevate your device (higher is always better for LoRa), avoid indoor locations with metal structures, and remember that line of sight is critical for LoRa communications.',
  },
];
