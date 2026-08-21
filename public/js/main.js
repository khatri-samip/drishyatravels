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

        // Build recommended packages HTML
        let recommendedHtml = '';
        if (data.recommended_packages && data.recommended_packages.length > 0) {
            recommendedHtml = `
                <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--line);">
                    <h4 style="margin-bottom: 16px; color: var(--ink);">Recommended Packages</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                        ${data.recommended_packages.map(pkg => `
                            <article style="background: var(--bg); border-radius: 16px; overflow: hidden; border: 1px solid var(--line);">
                                <a href="package.html?id=${encodeURIComponent(pkg.id)}" style="display: block; text-decoration: none; color: inherit;">
                                    <div style="height: 160px; background-image: url('${escapeHTML(pkg.hero_image_url || "")}'); background-size: cover; background-position: center;"></div>
                                    <div style="padding: 16px;">
                                        <div class="kicker" style="color: var(--accent);">${escapeHTML(pkg.destination || "")}</div>
                                        <h4 style="margin: 8px 0; font-size: 16px;">${escapeHTML(pkg.title)}</h4>
                                        <div style="display: flex; gap: 12px; font-size: 13px; color: var(--muted); margin-bottom: 12px;">
                                            <span>${escapeHTML(pkg.duration || "")}</span>
                                            <span>${escapeHTML(pkg.difficulty || "")}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <strong>${escapeHTML(pkg.price || "")} ${escapeHTML(pkg.currency || "")}</strong>
                                            <span style="font-size: 13px; color: var(--accent); font-weight: 600;">View Package →</span>
                                        </div>
                                    </div>
                                </a>
                            </article>
                        `).join("")}
                    </div>
                </div>
            `;
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
            ${recommendedHtml}
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