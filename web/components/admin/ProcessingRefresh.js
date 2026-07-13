'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessingRefresh({ active, intervalMs = 5000 }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return undefined;
    const timer = window.setInterval(() => router.refresh(), intervalMs);
    return () => window.clearInterval(timer);
  }, [active, intervalMs, router]);

  return null;
}
