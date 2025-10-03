"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge: "Empowering Students",
    title: "Excel in Your High School Journey",
    subtitle: "Grades 8-12",
    description: "Join Isinamuva, South Africa's premier digital learning platform. Access subject-specific content, expert tutors, and real-time progress tracking—all in one place.",
    primaryCTA: { text: "Get Started", link: "/register" },
    secondaryCTA: { text: "Learn More", link: "/about" }
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge: "Personalized Learning",
    title: "Your Path to University Success",
    subtitle: "Study Smarter, Not Harder",
    description: "Access instructional videos, practice problems, and personalized support anytime, anywhere. Track your progress and collaborate with peers on your journey to academic excellence.",
    primaryCTA: { text: "Start Learning", link: "/register" },
    secondaryCTA: { text: "View Subjects", link: "/about" }
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge: "Expert Support",
    title: "Learn From Qualified Tutors",
    subtitle: "Professional Guidance",
    description: "Book sessions with experienced tutors, submit assignments online, and receive detailed feedback. Get the support you need to overcome academic challenges and achieve your goals.",
    primaryCTA: { text: "Join Now", link: "/register" },
    secondaryCTA: { text: "Contact Us", link: "/contact" }
  }
];

export const Carousel = () => {
  const [stats, setStats] = useState({
    students: 0,
    tutors: 0,
    subjects: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();

    // Initialize Owl Carousel with loading detection and retry mechanism
    let retryCount = 0;
    const maxRetries = 20; // Try for 2 seconds (20 * 100ms)

    const initializeCarousel = () => {
      if (typeof window === 'undefined') return;

      const $ = (window as any).$;

      // Check if jQuery and Owl Carousel are loaded
      if ($ && typeof $.fn.owlCarousel === 'function') {
        try {
          const $carousel = $('.header-carousel');

          // Destroy existing carousel if it exists
          if ($carousel.data('owl.carousel')) {
            $carousel.data('owl.carousel').destroy();
          }

          // Initialize new carousel
          $carousel.owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            items: 1,
            dots: true,
            loop: true,
            nav: true,
            navText: [
              '<i class="bi bi-chevron-left"></i>',
              '<i class="bi bi-chevron-right"></i>'
            ]
          });

          console.log('Owl Carousel initialized successfully');
        } catch (error) {
          console.error('Error initializing Owl Carousel:', error);
        }
      } else if (retryCount < maxRetries) {
        // Retry after 100ms
        retryCount++;
        setTimeout(initializeCarousel, 100);
      } else {
        console.warn('Owl Carousel failed to load after maximum retries');
      }
    };

    // Start initialization
    initializeCarousel();

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && (window as any).$) {
        const $ = (window as any).$;
        const $carousel = $('.header-carousel');
        if ($carousel.data('owl.carousel')) {
          $carousel.data('owl.carousel').destroy();
        }
      }
    };
  }, []);

  return (
    <div className="container-fluid p-0 mb-5">
      <div className="owl-carousel header-carousel position-relative">
        {slides.map((slide) => (
          <div key={slide.id} className="owl-carousel-item position-relative">
            <div style={{ position: 'relative', width: '100%', height: '600px' }}>
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                style={{ objectFit: 'cover' }}
                priority={slide.id === 1}
                quality={90}
              />
            </div>
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center"
              style={{ background: "rgba(24, 29, 56, 0.75)" }}
            >
              <div className="container">
                <div className="row justify-content-start">
                  <div className="col-sm-10 col-lg-8">
                    <span className="badge bg-primary text-uppercase mb-3 animated slideInDown px-3 py-2" style={{ fontSize: '0.9rem' }}>
                      {slide.badge}
                    </span>
                    <h1 className="display-2 text-white fw-bold animated slideInDown mb-2">
                      {slide.title}
                    </h1>
                    <h4 className="text-primary animated slideInDown mb-3">
                      {slide.subtitle}
                    </h4>
                    <p className="fs-5 text-white mb-4 pb-2 animated slideInDown" style={{ maxWidth: '600px' }}>
                      {slide.description}
                    </p>
                    <div className="d-flex gap-3 flex-wrap">
                      <a
                        href={slide.primaryCTA.link}
                        className="btn btn-primary py-3 px-5 animated slideInLeft"
                        style={{ borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {slide.primaryCTA.text} <i className="fas fa-arrow-right ms-2"></i>
                      </a>
                      <a
                        href={slide.secondaryCTA.link}
                        className="btn btn-outline-light py-3 px-5 animated slideInRight"
                        style={{ borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {slide.secondaryCTA.text}
                      </a>
                    </div>

                    {/* Stats Section */}
                    <div className="row mt-5 animated fadeInUp">
                      <div className="col-md-4 col-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle p-3 me-3" style={{ minWidth: '60px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-users fa-2x text-white"></i>
                          </div>
                          <div>
                            <h3 className="text-white mb-0">{stats.students > 0 ? `${stats.students}+` : '...'}</h3>
                            <small className="text-white-50">Active Students</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 col-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle p-3 me-3" style={{ minWidth: '60px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-chalkboard-teacher fa-2x text-white"></i>
                          </div>
                          <div>
                            <h3 className="text-white mb-0">{stats.tutors > 0 ? `${stats.tutors}+` : '...'}</h3>
                            <small className="text-white-50">Expert Tutors</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 col-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle p-3 me-3" style={{ minWidth: '60px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-book fa-2x text-white"></i>
                          </div>
                          <div>
                            <h3 className="text-white mb-0">{stats.subjects > 0 ? `${stats.subjects}+` : '...'}</h3>
                            <small className="text-white-50">Subjects</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
