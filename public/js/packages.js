document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("packageGrid");
  if (!grid) return;

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
      grid.innerHTML = packages.map(pkg => `
        <article class="package-card">
          <a href="package.html?id=${encodeURIComponent(pkg.id)}" aria-label="Explore ${escapeHTML(pkg.title)}">
            <img src="${escapeHTML(pkg.hero_image_url || "")}" alt="${escapeHTML(pkg.title)}" loading="lazy">
            <div class="package-card-body">
              <div class="kicker">${escapeHTML(pkg.destination || "")}</div>
              <h3>${escapeHTML(pkg.title)}</h3>
              <p>${escapeHTML(pkg.short_description || pkg.description || "")}</p>
              <div class="package-info">
                <span>${escapeHTML(pkg.duration || "")}</span>
                <span>${escapeHTML(pkg.price || "")} ${escapeHTML(pkg.currency || "")}</span>
              </div>
              <span class="link">Explore →</span>
            </div>
          </a>
        </article>
      `).join("");
    })
    .catch((error) => {
      console.error("Error loading packages:", error);
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="color: #666; font-size: 18px;">Unable to load packages. Please try again later.</p>
        </div>
      `;
    });
});

