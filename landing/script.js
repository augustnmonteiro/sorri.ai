// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navButtons = document.querySelector('.nav-buttons');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');

        // Create mobile menu if it doesn't exist
        let mobileMenu = document.querySelector('.mobile-menu');

        if (!mobileMenu) {
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';
            mobileMenu.innerHTML = `
                <div class="mobile-menu-content">
                    ${navLinks.innerHTML}
                    <div class="mobile-menu-buttons">
                        ${navButtons.innerHTML}
                    </div>
                </div>
            `;
            document.querySelector('.header').appendChild(mobileMenu);

            // Add styles for mobile menu
            const style = document.createElement('style');
            style.textContent = `
                .mobile-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                }
                .mobile-menu.active {
                    display: block;
                }
                .mobile-menu-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .mobile-menu ul {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .mobile-menu a {
                    display: block;
                    padding: 0.5rem 0;
                    font-size: 1rem;
                }
                .mobile-menu-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e5e7eb;
                }
                .mobile-menu-btn.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                .mobile-menu-btn.active span:nth-child(2) {
                    opacity: 0;
                }
                .mobile-menu-btn.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            `;
            document.head.appendChild(style);
        }

        mobileMenu.classList.toggle('active');
    });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        }
    });
});

// ===== Header Background on Scroll =====
const header = document.querySelector('.header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
        header.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScrollY = currentScrollY;
});

// ===== Animate Elements on Scroll =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            animateOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
    }
    .feature-card, .step, .pricing-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .feature-card.animated, .step.animated, .pricing-card.animated {
        opacity: 1;
        transform: translateY(0);
    }
    .pricing-card.popular.animated {
        transform: scale(1.05);
    }
`;
document.head.appendChild(animationStyles);

// Observe elements for animation
document.querySelectorAll('.feature-card, .step, .pricing-card').forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.1}s`;
    animateOnScroll.observe(el);
});

// ===== Typing Effect for Hero Mockup =====
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Add loaded class to body for any initial animations
    document.body.classList.add('loaded');

    // Trigger hero elements animation
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    if (heroVisual) {
        heroVisual.style.opacity = '0';
        heroVisual.style.transform = 'translateY(20px)';
        heroVisual.style.transition = 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s';

        setTimeout(() => {
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateY(0)';
        }, 100);
    }
});
