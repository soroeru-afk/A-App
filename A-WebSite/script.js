document.addEventListener("DOMContentLoaded", () => {
    // Scroll Reveal Animation Set up
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply observer to all elements with class 'slide-in'
    const slideElements = document.querySelectorAll('.slide-in');
    slideElements.forEach(el => observer.observe(el));

    // Simple typing effect for hero section (optional enhancement)
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const text = typingText.innerHTML;
        typingText.innerHTML = '';
        
        // This is a basic simulation of a typing effect. 
        // For actual typing of HTML, a customized function would be needed, 
        // but here we just restore the content quickly to show the cursor concept 
        // if needed, or we just rely on the CSS fade-in for smooth performance.
        setTimeout(() => {
            typingText.innerHTML = text;
        }, 100);
    }
});
