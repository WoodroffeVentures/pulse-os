import type { Metadata } from 'next';
import { PulseHome } from '@/components/marketing/pulse-home';

export const metadata: Metadata = {
  title: 'PULSE OS — The Intelligence Layer Connecting Hospitality, Destinations & Opportunity',
  description:
    'PULSE OS transforms verified signals into measurable economic outcomes — connecting hospitality, guests, local businesses, destinations and opportunity into one intelligence layer.',
};

export default function HomePage() {
  return <PulseHome />;
}
