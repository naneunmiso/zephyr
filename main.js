// ── Clover Preloader Animation ───────────────────────────────────────────────
window.addEventListener('load', () => {
    const preloader = document.getElementById('clover-preloader');
    if (preloader) {
        // Wait just a moment to let the user see the clover before scattering
        setTimeout(() => {
            // Trigger the scatter animation
            preloader.classList.add('scatter');
            // Trigger the background fade-out
            preloader.classList.add('hide');
        }, 800);
    }
});

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

window.lenis = lenis;

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// GSAP ScrollTrigger Integration
gsap.registerPlugin(ScrollTrigger);

// Connect Lenis to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Hero Animations — premium staggered entrance
const heroTl = gsap.timeline({ delay: 0.1 });

heroTl
    .fromTo('.hero-section .reveal-text', 
        { y: 60, opacity: 0, visibility: 'hidden' },
        { y: 0, opacity: 1, visibility: 'visible', duration: 1.1, stagger: 0.12, ease: "power4.out" }
    )
    .fromTo('.hero-section .reveal-item', 
        { y: 30, opacity: 0, visibility: 'hidden' },
        { y: 0, opacity: 1, visibility: 'visible', duration: 0.9, ease: "power3.out" }, 
        "-=0.6"
    );

// Optimized Scroll Reveal Animations
const sections = document.querySelectorAll('.content-section, .wishes-section');

sections.forEach((section) => {
    const revealText = section.querySelectorAll('.reveal-text');
    const revealItems = section.querySelectorAll('.reveal-item');
    const h2 = section.querySelector('.section-header h2');

    // Animate the decorative underline in
    if (h2) {
        ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            onEnter: () => h2.classList.add('line-revealed'),
            onLeaveBack: () => h2.classList.remove('line-revealed')
        });
    }

    gsap.fromTo([...revealText, ...revealItems],
        { y: 40, opacity: 0, visibility: 'hidden' },
        {
            scrollTrigger: {
                trigger: section,
                start: "top 82%",
                toggleActions: "play none none reverse",
            },
            y: 0,
            opacity: 1,
            visibility: 'visible',
            duration: 0.9,
            stagger: 0.06,
            ease: "power3.out",
            overwrite: true,
            clearProps: "transform"
        }
    );
});


// Parallax Gallery
gsap.to(".parallax-img", {
    scrollTrigger: {
        trigger: ".gallery-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true
    },
    y: "20%",
    ease: "none"
});

// Sticky Icon Rotation and Scale
gsap.to(".sticky-icon", {
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    },
    rotation: 360,
    scale: 1.5,
    ease: "none"
});

// ─── Enhanced Navbar Controller ───────────────────────────────────────────
(function initNavbar() {
    const wrapper   = document.getElementById('navbar-wrapper');
    const navLinks  = document.getElementById('nav-links');
    const pill      = document.getElementById('nav-active-pill');
    const hamburger = document.getElementById('nav-hamburger');
    const drawer    = document.getElementById('mobile-drawer');
    const drawerClose = document.getElementById('drawer-close');
    const links     = document.querySelectorAll('#nav-links a[data-section]');

    // ── 1. Scroll-shrink ─────────────────────────────────────────────────
    const shrinkThreshold = 80;
    let lastScrollY = 0;

    function onScroll() {
        const y = window.scrollY || document.documentElement.scrollTop;
        if (wrapper) {
            wrapper.classList.toggle('scrolled', y > shrinkThreshold);
        }
        lastScrollY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // ── 2. Active section tracker (IntersectionObserver) ─────────────────
    const sectionIds = ['hero', 'for-her', 'favorite-chapter', 'gallery', 'wishes'];
    const sectionEls = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    function setActiveLink(id) {
        links.forEach(a => {
            const isActive = a.dataset.section === id;
            a.classList.toggle('active', isActive);
        });
        movePill(id);
    }

    // Sliding pill position
    function movePill(id) {
        if (!pill || !navLinks) return;
        const activeLink = navLinks.querySelector(`a[data-section="${id}"]`);
        if (!activeLink) {
            pill.classList.remove('visible');
            return;
        }
        const linkRect    = activeLink.getBoundingClientRect();
        const linksRect   = navLinks.getBoundingClientRect();
        pill.style.left   = (linkRect.left - linksRect.left) + 'px';
        pill.style.width  = linkRect.width + 'px';
        pill.classList.add('visible');
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveLink(entry.target.id);
            }
        });
    }, { threshold: 0.35 });

    sectionEls.forEach(el => observer.observe(el));
    // Set initial active
    if (sectionEls.length) setActiveLink(sectionEls[0].id);

    // Recalculate pill on resize
    let pillTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(pillTimeout);
        pillTimeout = setTimeout(() => {
            const active = navLinks?.querySelector('a.active');
            if (active) movePill(active.dataset.section);
        }, 100);
    });

    // ── 3. Hamburger & Mobile Drawer ─────────────────────────────────────
    function openMobileDrawer() {
        if (!hamburger || !drawer) return;
        hamburger.classList.add('open');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    window.closeMobileDrawer = function() {
        if (!hamburger || !drawer) return;
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (hamburger) hamburger.addEventListener('click', openMobileDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeMobileDrawer);
    // Close on backdrop click
    if (drawer) {
        drawer.addEventListener('click', (e) => {
            if (e.target === drawer) closeMobileDrawer();
        });
    }
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileDrawer();
    });
})();


// Cursor Interaction (Optional - Premium feel)
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
    });
});

// Add cursor styles dynamically
const style = document.createElement('style');
style.textContent = `
    .custom-cursor {
        position: fixed;
        width: 10px;
        height: 10px;
        background: var(--accent-color);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        mix-blend-mode: difference;
    }
`;
document.head.appendChild(style);

// Horizontal Gallery Scroll - Perfected with matchMedia for responsiveness
const galleryWrappers = document.querySelectorAll('.horizontal-gallery-wrapper');

let mm = gsap.matchMedia();

mm.add("(min-width: 800px)", () => {
    // Desktop: Premium GSAP Pinned Horizontal Scroll
    galleryWrappers.forEach((wrapper) => {
        if (wrapper.classList.contains('centered-gallery-wrapper')) return;
        const gallery = wrapper.querySelector('.horizontal-gallery');
        const photoFrames = gsap.utils.toArray(wrapper.querySelectorAll('.photo-frame'));

        if (gallery && photoFrames.length > 0) {
            const getScrollAmount = () => {
                const lastChild = gallery.lastElementChild;
                if (!lastChild) return 0;
                const rightEdge = lastChild.offsetLeft + lastChild.offsetWidth;
                const padding = window.innerWidth * 0.05; // 5vw padding on right
                const maxScroll = rightEdge + padding - window.innerWidth;
                return Math.max(0, maxScroll);
            };

            const scrollTween = gsap.to(gallery, {
                x: () => -getScrollAmount(),
                ease: "none",
                scrollTrigger: {
                    trigger: wrapper,
                    start: "center center",
                    end: () => `+=${getScrollAmount()}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });

            // Spotlight active class when photo is near the center of the screen
            photoFrames.forEach((frame) => {
                ScrollTrigger.create({
                    trigger: frame,
                    containerAnimation: scrollTween,
                    start: "center right-=25%",
                    end: "center left+=25%",
                    toggleClass: "active-frame"
                });
            });
        }
    });

    return () => {
        // cleanup if needed
    };
});

mm.add("(max-width: 799px)", () => {
    // Mobile: Native Horizontal Scroll (No pinning)
    // Animate the entire gallery wrapper instead of individual frames to avoid lag
    // inside the overflow-x container.
    const gallery = document.querySelector('.horizontal-gallery');
    if (gallery) {
        gsap.from(gallery, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: gallery,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }
});

// Hero Background Slideshow
const heroBg0 = document.getElementById('hero-slider-bg-0');
const heroBg1 = document.getElementById('hero-slider-bg-1');
const heroBgBlur0 = document.getElementById('hero-slider-blur-0');
const heroBgBlur1 = document.getElementById('hero-slider-blur-1');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (heroBg0 && heroBg1) {
    const sliderImages = [
        '/herosection.webp',
        '/memories/Screenshot 2026-05-02 at 10.13.57 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.14.01 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.14.15 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.14.19 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.14.37 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.14.41 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.14.55 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.15.05 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.15.32 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.15.35 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.15.45 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.15.48 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.15.55 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.16.05 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.16.12 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.16.20 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.16.27 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.16.37 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.16.52 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.00 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.03 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.06 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.10 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.13 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.25 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.27 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.29 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.34 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.36 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.17.42 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.03 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.10 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.27 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.30 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.36 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.43 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.53 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.18.57 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.19.24 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.19.32 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.19.37 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.20.03 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.20.10 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.20.14 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.20.19 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.20.24 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.20.27 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.20.54 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.21.01 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.21.19 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.21.33 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.22.01 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.22.08 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.22.13 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.22.28 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.22.39 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.22.57 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.23.01 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.23.13 PM.webp',
        '/memories/Screenshot 2026-05-02 at 10.23.23 PM.webp'
    ];
    
    const desktopImage = 'memories/Screenshot 2026-05-02 at 10.22.39 PM.webp';
    
    let currentSlide = 0;
    let activeLayer = 0; // 0 or 1
    let slideInterval;
    let isAnimating = false;
    
    function changeSlide(index) {
        if (isAnimating) return;
        isAnimating = true;
        
        currentSlide = index;
        if (currentSlide < 0) currentSlide = sliderImages.length - 1;
        if (currentSlide >= sliderImages.length) currentSlide = 0;
        
        const nextLayer = activeLayer === 0 ? 1 : 0;
        
        const nextSharp = nextLayer === 0 ? heroBg0 : heroBg1;
        const nextBlur = nextLayer === 0 ? heroBgBlur0 : heroBgBlur1;
        
        const oldSharp = activeLayer === 0 ? heroBg0 : heroBg1;
        const oldBlur = activeLayer === 0 ? heroBgBlur0 : heroBgBlur1;
        
        // Load new image
        nextSharp.style.backgroundImage = `url('${sliderImages[currentSlide]}')`;
        if (nextBlur) nextBlur.style.backgroundImage = `url('${sliderImages[currentSlide]}')`;
        
        // Reset classes
        oldSharp.classList.remove('active-slide');
        nextSharp.classList.add('active-slide');
        nextSharp.classList.add('animating');

        // Ensure new layer is structurally on top of the old layer
        nextSharp.style.zIndex = "2";
        if (nextBlur) nextBlur.style.zIndex = "1";
        oldSharp.style.zIndex = "1";
        if (oldBlur) oldBlur.style.zIndex = "0";
        
        // Start new layer hidden
        gsap.set([nextBlur, nextSharp], { opacity: 0 });
        
        // Lens Iris Animation + Fade IN
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set([oldBlur, oldSharp], { opacity: 0 });
                nextSharp.classList.remove('animating');
                isAnimating = false;
            }
        });

        tl.to([nextBlur, nextSharp], { 
            opacity: 1, 
            duration: 0.8, 
            ease: "power2.in"
        })
        .fromTo(nextSharp, 
            { clipPath: "circle(0% at 50% 50%)" },
            { clipPath: "circle(100% at 50% 50%)", duration: 1.5, ease: "power4.inOut" },
            0
        );
        
        activeLayer = nextLayer;
    }
    
    function nextSlide() { changeSlide(currentSlide + 1); }
    function prevSlide() { changeSlide(currentSlide - 1); }
    
    function startAutoSlide() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000); 
    }
    
    function stopAutoSlide() {
        clearInterval(slideInterval);
    }
    
    // Responsive handling for Hero Background
    mm.add({
        isDesktop: "(min-width: 800px)",
        isMobile: "(max-width: 799px)"
    }, (context) => {
        let { isDesktop, isMobile } = context.conditions;

        if (isDesktop) {
            stopAutoSlide();
            // Force Desktop Image
            heroBg0.style.backgroundImage = `url('${desktopImage}')`;
            
            // Force absolute coverage and sharpness
            gsap.set(heroBg0, { 
                opacity: 1, 
                zIndex: 10, 
                clipPath: "none", 
                filter: "none",
                width: "100%",
                height: "100%",
                left: "50%",
                top: "50%",
                xPercent: -50,
                yPercent: -50,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed" // Added for premium feel on desktop
            });
            
            if (heroBgBlur0) {
                gsap.set(heroBgBlur0, { 
                    opacity: 0, 
                    zIndex: 1,
                    visibility: "hidden"
                });
            }

            // Hide the dark vignette overlay on desktop for maximum image clarity
            const heroOverlay = document.querySelector('.hero-overlay');
            if (heroOverlay) heroOverlay.style.display = 'none';

            // Hide slider buttons if they exist
            const sliderBtns = document.querySelectorAll('.hero-slider-btn, .prev-btn, .next-btn');
            sliderBtns.forEach(btn => btn.style.display = 'none');
            
            // Hide second layer entirely
            gsap.set([heroBg1, heroBgBlur1], { opacity: 0, zIndex: 1, visibility: "hidden" });
            
            // Remove zoom animation
            heroBg0.classList.remove('active-slide');
        } else {
            // Mobile: Slideshow
            // Show overlay and buttons again if they were hidden
            const heroOverlay = document.querySelector('.hero-overlay');
            if (heroOverlay) heroOverlay.style.display = 'block';
            
            const sliderBtns = document.querySelectorAll('.hero-slider-btn, .prev-btn, .next-btn');
            sliderBtns.forEach(btn => btn.style.display = 'flex');

            // Reset to first slide if coming from desktop
            heroBg0.style.backgroundImage = `url('${sliderImages[0]}')`;
            if (heroBgBlur0) heroBgBlur0.style.backgroundImage = `url('${sliderImages[0]}')`;
            
            gsap.set(heroBg0, { 
                opacity: 1, 
                zIndex: 2, 
                clipPath: "circle(100% at 50% 50%)",
                backgroundAttachment: "scroll",
                xPercent: -50,
                yPercent: -50,
                left: "50%",
                top: "50%"
            });
            if (heroBgBlur0) gsap.set(heroBgBlur0, { opacity: 1, zIndex: 1 });
            gsap.set([heroBg1, heroBgBlur1], { opacity: 0, zIndex: 0, visibility: "visible" });
            
            heroBg0.classList.add('active-slide');
            
            currentSlide = 0;
            activeLayer = 0;
            startAutoSlide();
        }
    });

    // Preload next images lazily
    function preloadImages() {
        for(let i=1; i<3; i++) {
            if(sliderImages[i]) {
                const img = new Image();
                img.src = sliderImages[i];
            }
        }
    }
    
    preloadImages();
}

// Initialize Swiper for Letters
document.addEventListener("DOMContentLoaded", () => {
    if (typeof Swiper !== 'undefined') {
        new Swiper('.letters-swiper', {
            effect: 'cards',
            grabCursor: true,
            cardsEffect: {
                perSlideOffset: 8,
                perSlideRotate: 2,
                rotate: true,
                slideShadows: false,
            },
            loop: false,
        });

        // Enhanced BTS Swiper with Parallax
        const isMobileSwiper = window.innerWidth < 768;
        new Swiper('.bts-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            speed: isMobileSwiper ? 800 : 1200,
            parallax: true,
            mousewheel: {
                forceToAxis: true,
            },
            coverflowEffect: {
                rotate: isMobileSwiper ? 0 : 5,
                stretch: isMobileSwiper ? 0 : -10,
                depth: isMobileSwiper ? 100 : 200,
                modifier: 1,
                slideShadows: false,
            },
            on: {
                progress: function() {
                    const swiper = this;
                    for (let i = 0; i < swiper.slides.length; i++) {
                        const slideProgress = swiper.slides[i].progress;
                        const absProgress = Math.abs(slideProgress);
                        
                        // Enhanced Parallax for background image
                        const bg = swiper.slides[i].querySelector(".slide-bg");
                        if (bg) {
                            const translate = slideProgress * swiper.width * 0.15;
                            const scale = 1 + (absProgress * 0.1);
                            bg.style.transform = `translateX(${translate}px) scale(${scale})`;
                        }

                        // Content fade and lift
                        const content = swiper.slides[i].querySelector(".slide-content");
                        if (content) {
                            const opacity = 1 - Math.min(1, absProgress * 1.5);
                            const translateY = absProgress * 50;
                            content.style.opacity = opacity;
                            content.style.transform = `translateY(${translateY}px)`;
                        }
                    }
                },
                setTransition: function(speed) {
                    const swiper = this;
                    for (let i = 0; i < swiper.slides.length; i++) {
                        const bg = swiper.slides[i].querySelector(".slide-bg");
                        const content = swiper.slides[i].querySelector(".slide-content");
                        if (bg) bg.style.transition = `${speed}ms cubic-bezier(0.2, 0, 0.2, 1)`;
                        if (content) content.style.transition = `${speed}ms cubic-bezier(0.2, 0, 0.2, 1)`;
                    }
                }
            },
            pagination: {
                el: '.bts-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.bts-nav-next',
                prevEl: '.bts-nav-prev',
            }
        });
    }

    // Falling Sakura Petals Effect
    const isMobile = window.innerWidth < 800;
    let petalCount = 0;
    const maxPetalsMobile = 15;

    function createPetal() {
        if (isMobile && petalCount >= maxPetalsMobile) return;

        const petal = document.createElement('div');
        petal.classList.add('sakura-petal');
        
        // Randomize properties
        const size = Math.random() * 10 + 8; // 8px to 18px
        const left = Math.random() * 100; // 0vw to 100vw
        const duration = Math.random() * 5 + 5; // 5s to 10s
        const delay = Math.random() * 2; // 0s to 2s
        
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${left}vw`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${delay}s`;
        
        document.body.appendChild(petal);
        petalCount++;
        
        // Remove after animation to prevent DOM bloat
        setTimeout(() => {
            if(petal.parentNode) petal.remove();
            petalCount--;
        }, (duration + delay) * 1000);
    }

    // Create petals periodically, less frequently on mobile
    setInterval(createPetal, isMobile ? 800 : 400);

    // Navbar Quotes Logic
    const navLogo = document.getElementById('dynamic-nav-logo');
    if (navLogo) {
        const quotes = [
            "You are my serendipity.",
            "A flower blooming in the snow.",
            "My beautiful destiny.",
            "Written in the stars."
        ];
        let quoteIndex = 0;

        setInterval(() => {
            // Fade out
            navLogo.classList.add('fade-out');
            
            setTimeout(() => {
                // Change text and fade back in
                quoteIndex = (quoteIndex + 1) % quotes.length;
                navLogo.innerText = quotes[quoteIndex];
                navLogo.classList.remove('fade-out');
            }, 800); // Matches CSS transition duration
        }, 4000); // Change every 4 seconds
    }



    // ── Letter Passcode Gate ─────────────────────────────────────────────────
    (function initLetterPasscode() {
        const noteBtn       = document.getElementById('open-note-btn');
        const personalNote  = document.getElementById('personal-note');
        const closeNoteBtn  = document.getElementById('close-note-btn');
        const overlay       = document.getElementById('letter-passcode-overlay');
        const card          = document.getElementById('lpo-card');
        const digitEls      = Array.from(document.querySelectorAll('.lpo-digit'));
        const errorEl       = document.getElementById('lpo-error');
        const unlockBtn     = document.getElementById('lpo-btn');
        const cancelBtn     = document.getElementById('lpo-cancel');
        const successEl     = document.getElementById('lpo-success');
        const CORRECT       = '250604';

        if (!overlay || !noteBtn) return;

        // --- spawn pink sparkle particles once ---
        const sparkleColors = ['#ffb3c6','#ffd6e0','#ffafc7','#f9c9d4','#fce4ec','#ff8fab'];
        for (let i = 0; i < 30; i++) {
            const s = document.createElement('div');
            s.className = 'lpo-star';
            const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
            s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${2+Math.random()*4}s;animation-delay:${Math.random()*4}s;width:${Math.random()<.3?6:4}px;height:${Math.random()<.3?6:4}px;background:${color};`;
            overlay.appendChild(s);
        }

        // --- open overlay ---
        function openOverlay() {
            resetDigits();
            overlay.classList.add('lpo-show');
            overlay.classList.remove('lpo-exit');
            setTimeout(() => digitEls[0] && digitEls[0].focus(), 400);
        }

        // --- close overlay ---
        function closeOverlay() {
            overlay.classList.remove('lpo-show');
            resetDigits();
        }

        // --- reset state ---
        function resetDigits() {
            digitEls.forEach(d => { d.value = ''; d.classList.remove('filled','lpo-err'); });
            errorEl.classList.remove('show');
            unlockBtn.disabled = false;
            successEl.classList.remove('show');
        }

        // --- digit wire-up ---
        digitEls.forEach((el, i) => {
            el.addEventListener('input', () => {
                const v = el.value.replace(/\D/g, '');
                el.value = v.slice(-1);
                if (el.value) {
                    el.classList.add('filled');
                    if (i < 5) digitEls[i+1].focus();
                    else checkCode();
                } else {
                    el.classList.remove('filled');
                }
            });
            el.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !el.value && i > 0) {
                    digitEls[i-1].value = '';
                    digitEls[i-1].classList.remove('filled');
                    digitEls[i-1].focus();
                }
                if (e.key === 'Enter') checkCode();
                if (e.key === 'Escape') closeOverlay();
            });
            el.addEventListener('paste', e => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
                paste.split('').forEach((ch, idx) => {
                    if (digitEls[idx]) { digitEls[idx].value = ch; digitEls[idx].classList.add('filled'); }
                });
                digitEls[Math.min(paste.length, 5)].focus();
            });
        });

        // --- check ---
        function checkCode() {
            const entered = digitEls.map(d => d.value).join('');
            if (entered.length < 6) return;
            if (entered === CORRECT) {
                unlockSuccess();
            } else {
                wrongCode();
            }
        }

        function wrongCode() {
            card.classList.add('lpo-shake');
            digitEls.forEach(d => d.classList.add('lpo-err'));
            errorEl.classList.add('show');
            setTimeout(() => {
                card.classList.remove('lpo-shake');
                digitEls.forEach(d => { d.value=''; d.classList.remove('filled','lpo-err'); });
                digitEls[0].focus();
                setTimeout(() => errorEl.classList.remove('show'), 2000);
            }, 600);
        }

        function unlockSuccess() {
            unlockBtn.disabled = true;
            successEl.classList.add('show');
            overlay.classList.add('lpo-exit');
            setTimeout(() => {
                overlay.classList.remove('lpo-show','lpo-exit');
                resetDigits();
                // open the actual letter
                personalNote.classList.add('show');
                document.body.classList.add('letter-open');
                document.body.style.overflow = 'hidden';
                if (window.lenis) window.lenis.stop();
                gsap.fromTo('.note-modal-content',
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
                );
            }, 2100);
        }

        // --- button listeners ---
        if (noteBtn)    noteBtn.addEventListener('click', openOverlay);
        if (unlockBtn)  unlockBtn.addEventListener('click', checkCode);
        if (cancelBtn)  cancelBtn.addEventListener('click', closeOverlay);

        // close letter
        if (closeNoteBtn && personalNote) {
            closeNoteBtn.addEventListener('click', () => {
                personalNote.classList.remove('show');
                document.body.classList.remove('letter-open');
                document.body.style.overflow = '';
                if (window.lenis) window.lenis.start();
            });
        }
    })();

    // AI Magic Cake Blow Effect
    const magicCakeBtn = document.getElementById('magic-cake-btn');
    if (magicCakeBtn) {
        magicCakeBtn.addEventListener('click', (e) => {
            if (magicCakeBtn.classList.contains('blown')) return;
            
            magicCakeBtn.classList.add('blown');
            magicCakeBtn.innerText = '🍰'; // change to sliced cake
            
            // Generate confetti burst
            for(let i = 0; i < 40; i++) {
                const conf = document.createElement('div');
                conf.className = 'confetti-piece';
                conf.style.left = `calc(50% + ${(Math.random() - 0.5) * 100}px)`;
                conf.style.top = `calc(50% + ${(Math.random() - 0.5) * 100}px)`;
                conf.style.backgroundColor = ['#e88b9b', '#f9a8c9', '#c9a96e', '#a78bfa'][Math.floor(Math.random() * 4)];
                conf.style.animation = `confettiFall ${1 + Math.random()}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                
                // Explode outwards
                gsap.fromTo(conf, 
                    { x: 0, y: 0, scale: 0 },
                    { 
                        x: (Math.random() - 0.5) * 300, 
                        y: (Math.random() - 0.5) * 300 - 100,
                        scale: Math.random() * 1.5 + 0.5,
                        rotation: Math.random() * 360,
                        duration: 0.8, 
                        ease: "power2.out",
                        onComplete: () => {
                            gsap.to(conf, { y: "+=200", opacity: 0, duration: 1, ease: "power1.in" });
                        }
                    }
                );
                
                personalNote.querySelector('.note-modal-content').appendChild(conf);
                
                // Cleanup
                setTimeout(() => conf.remove(), 2000);
            }
        });
    }

    // Hero Background Confetti Generator
    const heroConfetti = document.getElementById('confetti-container');
    if (heroConfetti) {
        for(let i = 0; i < 30; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti-piece';
            conf.style.left = `${Math.random() * 100}%`;
            conf.style.animationDelay = `${Math.random() * 5}s`;
            conf.style.animationDuration = `${4 + Math.random() * 4}s`;
            conf.style.backgroundColor = ['#e88b9b', '#f9a8c9', '#c9a96e', '#a78bfa', '#ffffff'][Math.floor(Math.random() * 5)];
            heroConfetti.appendChild(conf);
        }
    }
});

// Magnetic Effect for Navbar Links — desktop only
if (window.innerWidth > 768) {
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(link, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    });
    link.addEventListener('mouseleave', () => {
        gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    });
});
}

// ─── Mobile-Safe Video Player ─────────────────────────────────────────────
// iOS/Android block programmatic unmuting without a direct user gesture.
// Strategy: always start muted, then offer a dedicated sound toggle button.
(function initVideoPlayer() {
    const card    = document.getElementById('main-video-card');
    const video   = document.getElementById('moment-video');
    const overlay = document.getElementById('video-play-overlay');
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (!card || !video) return;

    let isPlaying = false;

    // ── Helper: update sound button state ────────────────────────────────
    function updateSoundBtn() {
        if (!soundBtn) return;
        const icon  = soundBtn.querySelector('.sound-icon');
        const label = soundBtn.querySelector('.sound-label');
        if (video.muted) {
            icon.textContent  = '🔇';
            label.textContent = 'TAP FOR SOUND';
            soundBtn.classList.remove('unmuted');
        } else {
            icon.textContent  = '🔊';
            label.textContent = 'MUTE';
            soundBtn.classList.add('unmuted');
        }
    }

    // ── Play video (always muted to satisfy autoplay policy) ─────────────
    function startPlay() {
        video.muted = true; // Required for autoplay on mobile
        const p = video.play();
        if (p !== undefined) {
            p.then(() => {
                isPlaying = true;
                card.classList.add('playing');
                if (soundBtn) soundBtn.classList.add('visible');
                updateSoundBtn();
            }).catch(err => {
                console.warn('Video play failed:', err);
            });
        } else {
            isPlaying = true;
            card.classList.add('playing');
            if (soundBtn) soundBtn.classList.add('visible');
            updateSoundBtn();
        }
    }

    // ── Tap on card body → toggle play/pause ─────────────────────────────
    card.addEventListener('click', (e) => {
        // Don't toggle play when tapping the sound button
        if (soundBtn && soundBtn.contains(e.target)) return;

        if (!isPlaying || video.paused) {
            startPlay();
        } else {
            video.pause();
            isPlaying = false;
            card.classList.remove('playing');
            if (soundBtn) soundBtn.classList.remove('visible');
        }
    });

    // ── Sound toggle button (separate gesture = browser allows unmuting) ─
    if (soundBtn) {
        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            if (!isPlaying || video.paused) return;
            video.muted = !video.muted;
            updateSoundBtn();
        });
    }
})();





