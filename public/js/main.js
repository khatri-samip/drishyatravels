document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuBtn = document.getElementById("mobileMenuBtn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const links = document.querySelector(".links");
      if (!links) return;
      const open = links.style.display === "flex";
      links.style.display = open ? "none" : "flex";
      if (!open) {
        Object.assign(links.style, {
          position: "absolute", top: "72px", left: "4%", right: "4%", padding: "20px",
          borderRadius: "16px", background: "rgba(12,27,24,.96)",
          flexDirection: "column", gap: "18px"
        });
      }
    });
  }

 async function planTrip() {

    const style = document.getElementById("style")?.value;
    const days = document.getElementById("days")?.value;
    const month = document.getElementById("month")?.value;
    const people = document.getElementById("people")?.value;

    const result = document.getElementById("result");

    if (!result) return;


    // Show loading state
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

  // Load packages
  const packagesContainer = document.getElementById("packages-container");
  if (packagesContainer) {
    loadHomepagePackages(packagesContainer);
  }
});

function loadHomepagePackages(container) {
  fetch("/DRISHYATRAVELS/backend/api/packages/", {
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
    .then((result) => {
      const packages = result.data || [];

      if (!packages || packages.length === 0) {
        container.innerHTML = "";
        return;
      }

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
    })
    .catch((error) => {
      console.error("Could not load packages:", error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="color: #666; font-size: 18px;">Unable to load packages. Please try again later.</p>
        </div>
      `;
    });
}