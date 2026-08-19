document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("packageGrid");
  if (!grid || typeof getAllPackages !== "function") return;

  grid.innerHTML = getAllPackages().map(pkg => `
    <article class="package-card">
      <a href="package.html?id=${encodeURIComponent(pkg.id)}" aria-label="Explore ${escapeHTML(pkg.title)}">
        <img src="${escapeHTML(pkg.heroImage)}" alt="${escapeHTML(pkg.title)}" loading="lazy">
        <div class="package-card-body">
          <div class="kicker">${escapeHTML(pkg.destination)}</div>
          <h3>${escapeHTML(pkg.title)}</h3>
          <p>${escapeHTML(pkg.description)}</p>
          <div class="package-info">
            <span>${escapeHTML(pkg.duration)}</span>
            <span>${escapeHTML(pkg.price)}</span>
          </div>
          <span class="link">Explore →</span>
        </div>
      </a>
    </article>
  `).join("");
});
