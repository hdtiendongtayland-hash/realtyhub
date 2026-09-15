import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EventService } from '@/modules/events/services/event.service';
import EventDetailPage from '@/modules/events/components/EventDetailPage';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Server component chi tiet su kien - doc data tu EventService roi
 * truyen xuong client de tranh hydration mismatch. generateMetadata SSR.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await EventService.detail(slug);
  if (!event) {
    return { title: 'Không tìm thấy sự kiện' };
  }
  return {
    title: event.title,
    description: event.excerpt,
    openGraph: {
      title: event.title,
      description: event.excerpt,
      images: event.coverImage ? [event.coverImage] : undefined,
    },
  };
}

export default async function SuKienDetailRoutePage({ params }: Props) {
  const { slug } = await params;
  const event = await EventService.detail(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailPage slug={slug} initialEvent={event} />;
}