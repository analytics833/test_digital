'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import StartupJourneyCarousel from '@/components/StartupJourneyCarousel';
import GatewayVideoSection from '@/components/GatewayVideoSection';
import Hero from '@/components/hero/Hero';
import CreativeTransitionSection from '@/components/hero/CreativeTransitionSection';
import HeroSection from '@/components/HeroSection';
import MissionStatementSection from '@/components/MissionStatementSection';
import FourPillarsSection from '@/components/FourPillarsSection';
import StoryOverlays from '@/components/StoryOverlays';
import SkipIntroButton from '@/components/SkipIntroButton';
import ActionModal from '@/components/ActionModal';
import Footer from '@/components/Footer';
import ViewportBlur from '@/components/ViewportBlur';
import Preloader from '@/components/Preloader';

// One WebGL canvas for all 3D sections (hero, creative transition, spine).
const SharedStage = dynamic(() => import('@/components/stage/SharedStage'), { ssr: false });

export default function Home() {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const handleOpenAction = () => {
    setIsActionModalOpen(true);
  };

  const handleCloseAction = () => {
    setIsActionModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-purple-600 selection:text-white relative">
      {/* Loading screen: covers the page until the 3D stage has loaded and warmed up */}
      <Preloader />

      {/* Shared 3D canvas, fixed behind the sections' transparent stages */}
      <SharedStage />

      {/* Floating Navigation Bar */}
      <Navbar onOpenAction={handleOpenAction} />

      {/* Floating Skip Intro Button (Skips the opening intro sections, landing
          centered on the "Venturing Beyond Borders" gateway content) */}
      <SkipIntroButton targetId="hero-gateway-section" />

      {/* ─── 1. 3D EMBLEM HERO (our own build — first thing shown) ─── */}
      <div className="relative z-20 w-full">
        <Hero />
      </div>

      {/* ─── 2. CREATIVE TRANSITION: camera dives beneath the emblem into a glitch-text/glass-refraction scene ─── */}
      <div className="relative z-[25] w-full bg-transparent">
        <CreativeTransitionSection />
      </div>

      {/* ─── 3. 3D SPINAL CORD HELICAL JOURNEY CAROUSEL ─── */}
      <div className="relative z-30 w-full">
        <StartupJourneyCarousel />
      </div>

      {/* ─── 4. MAIN HOME PAGE SECTION (Hero Gateway over the scroll-scrubbed video) ─── */}
      <div id="main-content" className="scroll-mt-10">
        {/* clip-path: inset(0) confines the section's fixed card frame to the section box
            (painting and pointer hit-testing). The background stays transparent so the
            shared 3D world (the camera flying down to the video screen) shows through. */}
        <div className="relative z-30 w-full -mt-[6vw]" style={{ clipPath: 'inset(0)', paddingTop: '6.6vw' }}>
          <GatewayVideoSection containerHeight="h-[620vh]" onOpenAction={handleOpenAction}>
            {() => (
              <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-28 sm:space-y-40 pt-4 pb-64 sm:pb-96 pointer-events-auto mx-auto">
                <HeroSection onOpenAction={handleOpenAction} />
                <MissionStatementSection />
                <FourPillarsSection />
              </div>
            )}
          </GatewayVideoSection>
        </div>
      </div>

      {/* ─── 5. SOLID BLACK BACKGROUND SECTIONS (Proof of Growth & Final CTA) ─── */}
      <StoryOverlays onOpenAction={handleOpenAction} />

      {/* Footer Section */}
      <div className="relative z-20 bg-black">
        <Footer />
      </div>

      {/* Onboarding / Lead Capture Modal */}
      <ActionModal isOpen={isActionModalOpen} onClose={handleCloseAction} />

      {/* Progressive Viewport Blur from Frames Section to Footer */}
      <ViewportBlur />
    </main>
  );
}
