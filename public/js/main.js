document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       MOBILE MENU
    ========================= */

    const menuBtn = document.getElementById("mobileMenuBtn");

    if (menuBtn) {

        menuBtn.addEventListener("click", () => {

            const links = document.querySelector(".links");

            if (!links) return;

            const open = links.style.display === "flex";

            links.style.display = open ? "none" : "flex";

            if (!open) {

                Object.assign(links.style, {
                    position: "absolute",
                    top: "72px",
                    left: "4%",
                    right: "4%",
                    padding: "20px",
                    borderRadius: "16px",
                    background: "rgba(12,27,24,.96)",
                    flexDirection: "column",
                    gap: "18px"
                });

            }

        });

    }


    /* =========================
       TRIP PLANNER
    ========================= */

    async function planTrip() {

        const style = document.getElementById("style")?.value;
        const days = document.getElementById("days")?.value;
        const month = document.getElementById("month")?.value;
        const people = document.getElementById("people")?.value;

        const result = document.getElementById("result");

        if (!result) return;

        result.innerHTML = "Planning your trip...";
        result.style.display = "block";

        try {

            const response = await fetch(
                "/DRISHYATRAVELS/backend/api/trip-planner/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        style: style,
                        days: days,
                        month: month,
                        people: people
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error || "Something went wrong."
                );

            }

            result.innerHTML = `
                <strong>Your starting route:</strong>
                ${data.route}
                <br>
                <small>
                    ${data.days}
                    ·
                    ${data.month}
                    ·
                    ${data.people} traveller(s)
                </small>
            `;

        } catch (error) {

            console.error(error);

            result.innerHTML = `
                <strong>Unable to plan your trip.</strong>
                <br>
                <small>Please try again.</small>
            `;

        }

    }


    /* =========================
       LOAD PACKAGES
    ========================= */

    const packagesContainer =
        document.getElementById("packages-container");

    if (packagesContainer) {

        loadHomepagePackages(packagesContainer);

        setupPackagesCarousel(packagesContainer);

    }

});


/* =========================
   LOAD HOMEPAGE PACKAGES
========================= */

function loadHomepagePackages(container) {
  fetch("/DRISHYATRAVELS/backend/api/packages/?featured=1", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }
      return response.json();
    })

        .then((response) => {

            if (!response.ok) {
                throw new Error("Failed to fetch packages");
            }

            return response.json();

        })

        .then((result) => {

            const packages = result.data || [];

            if (!packages || packages.length === 0) {

                container.innerHTML = "";
                updatePackageArrows(container);

                return;

            }

            /*
             * Generate the cards using the classes
             * from your new carousel CSS.
             */

      container.innerHTML = packages.map(pkg => `
        <article class="card">
          <a href="package.html?id=${encodeURIComponent(pkg.id)}" aria-label="Explore ${escapeHTML(pkg.title)}">
            <div class="card-img">
              <div class="card-img-bg" style="background-image:url('${escapeHTML(pkg.hero_image_url || "")}')"></div>
              <span class="tag">${escapeHTML(pkg.destination || "Nepal")}</span>
              <span class="explore-text">Explore Now →</span>
            </div>
            <div class="card-body">
              <h3>${escapeHTML(pkg.title)}</h3>
              <p>${escapeHTML(pkg.short_description || pkg.description || "")}</p>
              <div class="card-meta">
                <span>${escapeHTML(pkg.duration || "")}</span>
                <span>→ Explore</span>
              </div>
            </div>
          </a>
        </article>
      `).join("");

      window.dispatchEvent(new Event("resize"));


            /*
             * Update arrows after cards
             * have been added to the DOM.
             */

            updatePackageArrows(container);

        })

    .catch((error) => {
      console.error("Could not load packages:", error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="color: #666; font-size: 18px;">Unable to load packages. Please try again later.</p>
        </div>
      `;

            updatePackageArrows(container);

        });

}


/* =========================
   PACKAGE CAROUSEL
========================= */

function setupPackagesCarousel(container) {

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pagination = document.getElementById("packagesPagination");

    if (!prevBtn || !nextBtn || !pagination) return;


    /* =========================
       CREATE PAGINATION
    ========================= */

    function createPagination() {

        pagination.innerHTML = "";

        const cards = [...container.querySelectorAll(".card")];

        if (cards.length === 0) {
            pagination.style.display = "none";
            return;
        }

        pagination.style.display = "flex";


        /*
         * Find how many cards can be shown
         * at the current screen size.
         */

        const cardWidth = cards[0].offsetWidth;

        const gap =
            parseFloat(
                window.getComputedStyle(container).gap
            ) || 18;

        const visibleCards =
            Math.max(
                1,
                Math.round(
                    container.clientWidth / (cardWidth + gap)
                )
            );


        /*
         * Number of pages.
         */

        const pageCount =
            Math.ceil(cards.length / visibleCards);


        for (let i = 0; i < pageCount; i++) {

            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "carousel-dot";

            dot.setAttribute(
                "aria-label",
                `Go to package page ${i + 1}`
            );

            dot.addEventListener("click", () => {

                const targetCard = cards[
                    Math.min(
                        i * visibleCards,
                        cards.length - 1
                    )
                ];

                container.scrollTo({
                    left: targetCard.offsetLeft,
                    behavior: "smooth"
                });

            });

            pagination.appendChild(dot);
        }

        updatePagination();

    }


    /* =========================
       UPDATE ACTIVE DOT
    ========================= */

    function updatePagination() {

        const dots =
            [...pagination.querySelectorAll(".carousel-dot")];

        if (dots.length === 0) return;

        const cards =
            [...container.querySelectorAll(".card")];

        if (cards.length === 0) return;


        let closestIndex = 0;
        let smallestDistance = Infinity;


        cards.forEach((card, index) => {

            const distance =
                Math.abs(
                    container.scrollLeft - card.offsetLeft
                );

            if (distance < smallestDistance) {

                smallestDistance = distance;
                closestIndex = index;

            }

        });


        const cardWidth = cards[0].offsetWidth;

        const gap =
            parseFloat(
                window.getComputedStyle(container).gap
            ) || 18;

        const visibleCards =
            Math.max(
                1,
                Math.round(
                    container.clientWidth / (cardWidth + gap)
                )
            );


        const pageIndex =
            Math.floor(closestIndex / visibleCards);


        dots.forEach((dot, index) => {

            dot.classList.toggle(
                "active",
                index === pageIndex
            );

        });

    }


    /* =========================
       UPDATE ARROWS
    ========================= */

    function updateArrows() {

        const cards =
            container.querySelectorAll(".card");


        /*
         * No cards
         */

        if (cards.length === 0) {

            prevBtn.style.display = "none";
            nextBtn.style.display = "none";

            return;
        }


        const maxScrollLeft =
            container.scrollWidth -
            container.clientWidth;


        const atStart =
            container.scrollLeft <= 2;


        const atEnd =
            container.scrollLeft >= maxScrollLeft - 2;


        prevBtn.style.display =
            atStart ? "none" : "flex";

        nextBtn.style.display =
            atEnd ? "none" : "flex";

    }


    /* =========================
       NEXT
    ========================= */

    nextBtn.addEventListener("click", () => {

        const cards =
            container.querySelectorAll(".card");

        if (!cards.length) return;

        const card = cards[0];

        const gap =
            parseFloat(
                window.getComputedStyle(container).gap
            ) || 18;


        container.scrollBy({
            left: card.offsetWidth + gap,
            behavior: "smooth"
        });

    });


    /* =========================
       PREVIOUS
    ========================= */

    prevBtn.addEventListener("click", () => {

        const cards =
            container.querySelectorAll(".card");

        if (!cards.length) return;

        const card = cards[0];

        const gap =
            parseFloat(
                window.getComputedStyle(container).gap
            ) || 18;


        container.scrollBy({
            left: -(card.offsetWidth + gap),
            behavior: "smooth"
        });

    });


    /* =========================
       SCROLL
    ========================= */

    container.addEventListener("scroll", () => {

        updateArrows();
        updatePagination();

    });


    /* =========================
       RESIZE
    ========================= */

    window.addEventListener("resize", () => {

        createPagination();
        updateArrows();

    });


    /* =========================
       INITIALIZE
    ========================= */

    createPagination();
    updateArrows();

}


/* =========================
   UPDATE ARROW VISIBILITY
========================= */

function updatePackageArrows(container) {

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!prevBtn || !nextBtn) return;


    /*
     * If there are no cards,
     * hide both arrows.
     */

    const card = container.querySelector(".card");

    if (!card) {

        prevBtn.style.display = "none";
        nextBtn.style.display = "none";

        return;

    }


    /*
     * Maximum amount we can scroll.
     */

    const maxScrollLeft =
        container.scrollWidth - container.clientWidth;


    /*
     * Are we at the beginning?
     */

    const atStart =
        container.scrollLeft <= 2;


    /*
     * Are we at the end?
     */

    const atEnd =
        container.scrollLeft >= maxScrollLeft - 2;


    /*
     * Hide / show buttons.
     */

    if (atStart) {
        prevBtn.style.display = "none";
    } else {
        prevBtn.style.display = "flex";
    }


    if (atEnd) {
        nextBtn.style.display = "none";
    } else {
        nextBtn.style.display = "flex";
    }

}


/* =========================
   GET CAROUSEL GAP
========================= */

function getCarouselGap(container) {

    const styles = window.getComputedStyle(container);

    return parseFloat(styles.columnGap || styles.gap) || 18;

}


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}