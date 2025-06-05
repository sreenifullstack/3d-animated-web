"use client";
import { useEffect, useRef, useState } from "react";

// components
import CTASection from "@/features/home/components/cta-section";
import EchosystemSection from "@/features/home/components/echosystem-section";
import FAQSection from "@/features/home/components/faq-section";
import FeaturesSection from "@/features/home/components/features-section";
import FooterNewsletter from "@/features/home/components/footer";
import HeroSection from "@/features/home/components/hero-section";
import NewsSlider from "@/features/home/components/news-slider";
import PartnersSection from "@/features/home/components/partner-section";
import PlanetSection from "@/features/home/components/planet-section";
import RewardsSection from "@/features/home/components/rewards-section";
import ScrollSection from "@/components/scrollSection";
import AnimatedBackground from "@/components/animatedBackground";
import ScrollParticles from "@/features/home/components/ScrollParticles";

export default function Home() {
  const footerRef = useRef();
  const heroRef = useRef();
  const faqRef = useRef();

  const [showGlow, setShowGlow] = useState(true);
  const [startDissolve, setStartDissolve] = useState(false);
  const [hideParticles, setHideParticles] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartDissolve(true);
      setTimeout(() => setShowGlow(false), 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isInHero = true;
    let isInFAQ = false;

    const updateVisibility = () => {
      const shouldHide = !isInHero && !isInFAQ;
      setHideParticles(shouldHide);
    };

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        isInHero = entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0.2 }
    );

    const faqObserver = new IntersectionObserver(
      ([entry]) => {
        isInFAQ = entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0.2 }
    );

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (faqRef.current) faqObserver.observe(faqRef.current);

    return () => {
      if (heroRef.current) heroObserver.unobserve(heroRef.current);
      if (faqRef.current) faqObserver.unobserve(faqRef.current);
    };
  }, []);

  return (
    <div className="bg-black  min-h-screen">
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      {!showGlow && (
        <div
          className={`fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none`}
          style={{ opacity: hideParticles ? 0 : 1 }}
        >
          <ScrollParticles footerRef={footerRef} />
        </div>
      )}

      <div className=" z-10">
        <ScrollSection>
          <div ref={heroRef}>
            <HeroSection dissolve={startDissolve} hideGlow={!showGlow} />
          </div>
        </ScrollSection>

        <ScrollSection>
          <FeaturesSection />
        </ScrollSection>

        <ScrollSection>
          <PlanetSection />
        </ScrollSection>

        <ScrollSection>
          <EchosystemSection />
        </ScrollSection>

        <ScrollSection>
          <RewardsSection />
        </ScrollSection>

        <ScrollSection>
          <PartnersSection />
        </ScrollSection>

        <ScrollSection>
          <NewsSlider />
        </ScrollSection>

        <ScrollSection>
          <CTASection />
        </ScrollSection>

        <ScrollSection>
          <div ref={faqRef}>
            <FAQSection />
          </div>
        </ScrollSection>

        <ScrollSection>
          <div ref={footerRef}>
            <FooterNewsletter />
          </div>
        </ScrollSection>
      </div>
    </div>
  );
}
