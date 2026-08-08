import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PULSE Guest Lite',
    short_name: 'PULSE',
    description: 'Verified local discovery and stay assistance',
    start_url: '/guest',
    display: 'standalone',
    background_color: '#07090E',
    theme_color: '#C6A66B',
    orientation: 'portrait',
    categories: ['travel', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    screenshots: [],
  };
}
