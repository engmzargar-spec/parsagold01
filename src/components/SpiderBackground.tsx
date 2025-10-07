'use client';

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function SpiderBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: { value: '#000000' } },
        particles: {
          number: { value: 80 },
          color: { value: '#ffffff' },
          links: {
            enable: true,
            color: '#ffffff',
            distance: 150,
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            outModes: { default: 'bounce' },
          },
          size: { value: 3 },
          opacity: { value: 0.5 },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
            onClick: { enable: true, mode: 'push' },
          },
          modes: {
            grab: { distance: 200, links: { opacity: 0.6 } },
            push: { quantity: 4 },
          },
        },
      }}
    />
  );
}
