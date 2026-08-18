document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("packageGrid");
  if (!grid || typeof getAllPackages !== "function") return;

  grid.innerHTML = getAllPackages().map(pkg => `
    <article class="package-card">
      <a href="package.html?id=${encodeURIComponent(pkg.id)}" aria-label="Explore ${pkg.title}">
        <img src="${pkg.heroImage}" alt="${pkg.title}" loading="lazy">
        <div class="package-card-body">
          <div class="kicker">${pkg.destination}</div>
          <h3>${pkg.title}</h3>
          <p>${pkg.description}</p>
          <div class="package-info">
            <span>${pkg.duration}</span>
            <span>${pkg.price}</span>
          </div>
          <span class="link">Explore →</span>
        </div>
      </a>
    </article>
  `).join("");
});
