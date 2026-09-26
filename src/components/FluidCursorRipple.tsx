'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getDeviceTier } from '@/lib/deviceTier';

// The ripple is a full-viewport WebGL overlay; loading it (and three.js) lazily
// keeps it out of the initial bundle and off the critical path.
const FluidCursorRippleCanvas = dynamic(() => import('./FluidCursorRippleCanvas'), { ssr: false });

/**
 * Mounts the cursor ripple only on devices with a fine pointer (it reacts to
 * the mouse), and only after the first mouse move. Skipped on low-tier devices.
 */
export default function FluidCursorRipple() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || getDeviceTier() === 'low') return;

    const onFirstMove = () => setEnabled(true);
    window.addEventListener('mousemove', onFirstMove, { once: true, passive: true });
    return () => window.removeEventListener('mousemove', onFirstMove);
  }, []);

  return enabled ? <FluidCursorRippleCanvas /> : null;
}
