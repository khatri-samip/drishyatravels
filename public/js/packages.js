document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("packageGrid");
  const pagination = document.getElementById("pagination");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const categoryFilter = document.getElementById("categoryFilter");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const clearFiltersBtn = document.getElementById("clearFilters");

  if (!grid) return;

  // Pagination state
  let currentPage = 1;
  const limit = 6; // packages per page
  let totalPackages = 0;
  let totalPages = 0;

  // Filter state
  let currentCategory = "";
  let currentDifficulty = "";

  // Load packages with current filters and pagination
  async function loadPackages() {
    // Show loading state
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <p style="color: #666; font-size: 18px;">Loading packages...</p>
      </div>
    `;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((currentPage - 1) * limit).toString(),
    });

    if (currentCategory) params.append("category", currentCategory);
    if (currentDifficulty) params.append("difficulty", currentDifficulty);

    try {
      const response = await fetch(`/DRISHYATRAVELS/backend/api/packages/?${params.toString()}`, { // why: hardcoded project subdirectory; breaks if deployed to root or different subpath // why: hardcoded project subdirectory; breaks if deployed to root or different subpath
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const result = await response.json();
      const packages = result.data || [];
      totalPackages = result.meta?.total ?? packages.length;

      // Calculate total pages
      totalPages = Math.ceil(totalPackages / limit);

      // Render packages
      if (!packages || packages.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <p style="color: #666; font-size: 18px;">No packages found. Try adjusting your filters.</p>
          </div>
        `;
      } else {
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
      }

      // Update pagination UI
      updatePagination();

    } catch (error) {
      console.error("Error loading packages:", error);
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="color: #666; font-size: 18px;">Unable to load packages. Please try again later.</p>
        </div>
      `;
      // Reset pagination on error
      totalPackages = 0;
      totalPages = 0;
      updatePagination();
    }
  }

  function updatePagination() {
    if (!pagination) return;

    // Update page info
    if (pageInfo) {
      if (totalPages === 0) {
        pageInfo.textContent = "No packages found";
      } else {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      }
    }

    // Update prev/next buttons
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage <= 1;
    }
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage >= totalPages;
    }
  }

  // Pagination event handlers
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadPackages();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadPackages();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Filter event handlers
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      currentCategory = categoryFilter.value;
      currentPage = 1; // Reset to first page on filter change
      loadPackages();
    });
  }

  if (difficultyFilter) {
    difficultyFilter.addEventListener("change", () => {
      currentDifficulty = difficultyFilter.value;
      currentPage = 1; // Reset to first page on filter change
      loadPackages();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      currentCategory = "";
      currentDifficulty = "";
      currentPage = 1;
      if (categoryFilter) categoryFilter.value = "";
      if (difficultyFilter) difficultyFilter.value = "";
      loadPackages();
    });
  }

  // Initial load
  loadPackages();
});