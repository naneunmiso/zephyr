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

// Navbar background on scroll
gsap.to(".navbar", {
    scrollTrigger: {
        trigger: "body",
        start: "100px top",
        toggleActions: "play none none reverse"
    },
    backgroundColor: "rgba(6, 3, 5, 0.95)",
    backdropFilter: "blur(20px)",
    padding: "0.8rem 1.5rem",
    duration: 0.3
});

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
    const allPhotoFrames = gsap.utils.toArray('.horizontal-gallery .photo-frame');
    allPhotoFrames.forEach((frame) => {
        gsap.from(frame, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: frame,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });
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
    
    let currentSlide = 0;
    let activeLayer = 0; // 0 or 1
    let slideInterval;
    let isAnimating = false;
    
    // Init first slide
    heroBg0.style.backgroundImage = `url('${sliderImages[0]}')`;
    heroBg0.classList.add('active-slide');
    if (heroBgBlur0) heroBgBlur0.style.backgroundImage = `url('${sliderImages[0]}')`;
    
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
        slideInterval = setInterval(nextSlide, 5000); // 3 second interval
    }
    
    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }
    

    
    // Preload next images lazily
    function preloadImages() {
        for(let i=1; i<3; i++) {
            if(sliderImages[i]) {
                const img = new Image();
                img.src = sliderImages[i];
            }
        }
    }
    
    startAutoSlide();
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

        // Restore BTS Swiper
        new Swiper('.bts-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            speed: 800,
            parallax: true,
            coverflowEffect: {
                rotate: 5,
                stretch: 0,
                depth: 100,
                modifier: 1.5,
                slideShadows: false,
            },
            pagination: {
                el: '.bts-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.bts-nav-next',
                prevEl: '.bts-nav-prev',
            }
        });
    }

    // Falling Sakura Petals Effect
    function createPetal() {
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
        
        // Remove after animation to prevent DOM bloat
        setTimeout(() => {
            if(petal.parentNode) petal.remove();
        }, (duration + delay) * 1000);
    }

    // Create petals periodically
    setInterval(createPetal, 400);

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

    // ═══ THE MAGIC SHOP LOGIC ═══
    const orbs = document.querySelectorAll('.magic-orb');
    const messageContainer = document.getElementById('magic-message');

    if (orbs.length > 0 && messageContainer) {
        orbs.forEach(orb => {
            orb.addEventListener('click', () => {
                orbs.forEach(o => o.classList.remove('active'));
                orb.classList.add('active');
                const message = orb.getAttribute('data-wish');
                
                messageContainer.style.opacity = '0';
                messageContainer.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    messageContainer.innerHTML = `<p>${message}</p>`;
                    messageContainer.style.opacity = '1';
                    messageContainer.style.transform = 'translateY(0)';
                }, 400);
            });
        });
    }
});

// Magnetic Effect for Navbar Links
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(link, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out"
        });
    });
    
    link.addEventListener('mouseleave', () => {
        gsap.to(link, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    });
});


