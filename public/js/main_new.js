/* =========================
   AUTO-SWIPING CAROUSEL (Places Worth the Journey)
========================= */

function setupAutoCarousel(container) {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pagination = document.getElementById("packagesPagination");

    if (!prevBtn || !nextBtn || !pagination) return;

    let autoScrollInterval = null;
    let isUserInteracting = false;
    let interactionTimeout = null;

    // Get card width + gap for scrolling calculations
    function getCardScrollAmount() {
        const cards = container.querySelectorAll(".card");
        if (!cards.length) return 0;
        const card = cards[0];
        const gap = parseFloat(window.getComputedStyle(container).gap) || 18;
        return card.offsetWidth + gap;
    }

    // Update arrow visibility
    function updateArrows() {
        const cards = container.querySelectorAll(".card");
        if (cards.length === 0) {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
            return;
        }

        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const atStart = container.scrollLeft <= 2;
        const atEnd = container.scrollLeft >= maxScrollLeft - 2;

        prevBtn.style.display = atStart ? "none" : "flex";
        nextBtn.style.display = atEnd ? "none" : "flex";
    }

    // Create pagination dots
    function createPagination() {
        pagination.innerHTML = "";
        const cards = [...container.querySelectorAll(".card")];

        if (cards.length === 0) {
            pagination.style.display = "none";
            return;
        }

        pagination.style.display = "flex";

        // Calculate visible cards
        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(container).gap) || 18;
        const visibleCards = Math.max(1, Math.round(container.clientWidth / (cardWidth + gap)));
        const pageCount = Math.ceil(cards.length / visibleCards);

        for (let i = 0; i < pageCount; i++) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "carousel-dot";
            dot.setAttribute("aria-label", `Go to package page ${i + 1}`);

            dot.addEventListener("click", () => {
                // User interaction - pause auto-scroll temporarily
                pauseAutoScroll();
                const targetCard = cards[Math.min(i * visibleCards, cards.length - 1)];
                container.scrollTo({
                    left: targetCard.offsetLeft,
                    behavior: "smooth"
                });
            });

            pagination.appendChild(dot);
        }
        updatePagination();
    }

    // Update active pagination dot
    function updatePagination() {
        const dots = [...pagination.querySelectorAll(".carousel-dot")];
        if (dots.length === 0) return;

        const cards = [...container.querySelectorAll(".card")];
        if (cards.length === 0) return;

        let closestIndex = 0;
        let smallestDistance = Infinity;

        cards.forEach((card, index) => {
            const distance = Math.abs(container.scrollLeft - card.offsetLeft);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestIndex = index;
            }
        });

        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(container).gap) || 18;
        const visibleCards = Math.max(1, Math.round(container.clientWidth / (cardWidth + gap)));
        const pageIndex = Math.floor(closestIndex / visibleCards);

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === pageIndex);
        });
    }

    // Auto-scroll to next card
    function autoScroll() {
        if (isUserInteracting) return;

        const scrollAmount = getCardScrollAmount();
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const atEnd = container.scrollLeft >= maxScrollLeft - 2;

        if (atEnd) {
            // Loop back to start
            container.scrollTo({
                left: 0,
                behavior: "smooth"
            });
        } else {
            container.scrollBy({
                left: scrollAmount,
                behavior: "smooth"
            });
        }
    }

    // Start auto-scroll
    function startAutoScroll() {
        if (autoScrollInterval) return;
        autoScrollInterval = setInterval(autoScroll, 6000); // 6 seconds
    }

    // Pause auto-scroll (on user interaction)
    function pauseAutoScroll() {
        isUserInteracting = true;
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
        // Resume after 3 seconds of no interaction
        clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(() => {
            isUserInteracting = false;
            startAutoScroll();
        }, 3000);
    }

    // Arrow click handlers
    nextBtn.addEventListener("click", () => {
        pauseAutoScroll();
        const scrollAmount = getCardScrollAmount();
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const atEnd = container.scrollLeft >= maxScrollLeft - 2;

        if (atEnd) {
            container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    });

    prevBtn.addEventListener("click", () => {
        pauseAutoScroll();
        const scrollAmount = getCardScrollAmount();
        const atStart = container.scrollLeft <= 2;

        if (atStart) {
            // Loop to end
            container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
        } else {
            container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
    });

    // Scroll event - update arrows and pagination
    container.addEventListener("scroll", () => {
        updateArrows();
        updatePagination();
    });

    // Resize event - recreate pagination
    window.addEventListener("resize", () => {
        createPagination();
        updateArrows();
    });

    // Pause on hover/focus for accessibility
    container.addEventListener("mouseenter", pauseAutoScroll);
    container.addEventListener("focusin", pauseAutoScroll);

    // Initialize
    createPagination();
    updateArrows();
    startAutoScroll();
}