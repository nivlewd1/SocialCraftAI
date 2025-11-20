import Typed from 'typed.js';
import anime from 'animejs';

export function initializeAnimations() {
    initTypewriter();
    initScrollAnimations();
    initPlatformSelection();
    initInteractiveElements();
    // initContentAnalysis and related functions are more tightly coupled with React state and will be handled within components
    // showNotification will be exposed globally or passed down as a prop if needed
    
    console.log('SocialCraft AI Animations initialized.');
}

// Typewriter effect for hero section
function initTypewriter() {
    const typedElement = document.getElementById('typed-text');
    if (typedElement) {
        new Typed('#typed-text', {
            strings: [
                'Transform academic papers into engaging social media content',
                'Generate platform-optimized posts from research articles',
                'Create viral content from complex technical papers',
                'Automate social media for research institutions and academics'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
}

// Scroll-triggered animations
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-element');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Platform selection functionality (simplified for general animation, actual logic in React component)
function initPlatformSelection() {
    const platformSelectors = document.querySelectorAll('.platform-selector');
    
    platformSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            // Animate selection
            anime({
                targets: this,
                scale: [0.95, 1],
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
}

// Interactive elements initialization
function initInteractiveElements() {
    // Button hover animations
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.02,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        button.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // Card hover effects
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                translateY: -4,
                boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                translateY: 0,
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // Navigation scroll effect
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                nav.style.background = 'rgba(254, 254, 254, 0.95)';
            } else {
                nav.style.background = 'rgba(254, 254, 254, 0.9)';
            }
        });
    }
}

// Global notification system (can be called from anywhere)
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-6 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-brand-primary text-white' :
        type === 'warning' ? 'bg-brand-glow text-white' :
        type === 'error' ? 'bg-status-error text-white' :
        'bg-soft-blue text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => notification.remove()
        });
    }, 5000);
}

// Expose showNotification globally
window.showNotification = showNotification;