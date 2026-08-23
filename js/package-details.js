document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const app = document.getElementById("packageApp");

  if (!app) return;

  if (!id) {
    document.title = "Package not found — Himalaya";
    app.innerHTML = `
      <section class="not-found">
        <div>
          <div class="kicker">Package not found</div>
          <h1 style="font-size:clamp(42px,6vw,72px);letter-spacing:-3px;margin-bottom:18px">That journey doesn't exist.</h1>
          <p style="color:var(--muted);margin-bottom:25px">The package link may be outdated or incomplete.</p>
          <a class="btn btn-primary" href="packages.html">Browse packages →</a>
        </div>
      </section>`;
    return;
  }

  // Show loading state
  app.innerHTML = `
    <section class="not-found">
      <div>
        <div class="kicker">Loading...</div>
        <p style="color:var(--muted);">Fetching package details...</p>
      </div>
    </section>`;

  fetch(
    // TODO: [High/Architecture] Hardcoded API path - fails when deployed to different base path
    `/backend/api/packages/${encodeURIComponent(id)}`,
    {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Package not found");
        }
        throw new Error("Failed to fetch package");
      }
      return response.json();
    })
    .then((result) => {
      const pkg = result.data;
      if (!pkg) {
        throw new Error("Package not found");
      }

      document.title = `${escapeHTML(pkg.title)} — Himalaya`;

      // Map API response to frontend format
      const highlights = (pkg.highlights || []).map(h => h.highlight);
      const itinerary = (pkg.itinerary || []).map(day => [day.day_number, day.title, day.description]);
      const included = (pkg.inclusions || []).map(i => i.inclusion);
      const excluded = (pkg.exclusions || []).map(e => e.exclusion);
      const gallery = (pkg.gallery || []).map(g => g.image_url);
      const faqs = (pkg.faqs || []).map(f => [f.question, f.answer]);

      app.innerHTML = `
        <section class="package-hero" style="background-image:url('${escapeHTML(pkg.hero_image_url || "")}')">
          <div class="container package-hero-content">
            <div class="kicker" style="color:#f1ad88">${escapeHTML(pkg.destination || "")}</div>
            <div class="package-title">
              <h1>${escapeHTML(pkg.title)}</h1>
              <p>${escapeHTML(pkg.short_description || pkg.description || "")}</p>
            </div>
            <div class="package-meta">
              <span class="package-pill">${escapeHTML(pkg.duration || "")}</span>
              <span class="package-pill">${escapeHTML(pkg.difficulty || "")}</span>
              <span class="package-pill">${escapeHTML(pkg.best_season || "")}</span>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container package-layout">
            <article class="package-main">
              <div class="kicker">Your journey</div>
              <h2>Highlights</h2>
              <div class="highlight-grid">
                ${highlights.map(item => `<div class="highlight">${escapeHTML(item)}</div>`).join("")}
              </div>

              <div class="kicker">Day by day</div>
              <h2>Itinerary</h2>
              <div class="itinerary">
                ${itinerary.map(day => `
                  <div class="day">
                    <div class="day-number">${escapeHTML(day[0])}</div>
                    <div><h3>${escapeHTML(day[1])}</h3><p>${escapeHTML(day[2] || "")}</p></div>
                  </div>
                `).join("")}
              </div>

              <div class="included-grid">
                <div class="service-box">
                  <h3>Included</h3>
                  <ul>${included.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
                </div>
                <div class="service-box">
                  <h3>Not included</h3>
                  <ul>${excluded.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
                </div>
              </div>

              <div class="kicker" style="margin-top:55px">Gallery</div>
              <div class="gallery">
                ${gallery.map((img, i) => `<img src="${escapeHTML(img)}" alt="${escapeHTML(pkg.title)} gallery ${i+1}" loading="lazy">`).join("")}
              </div>

              <div class="kicker">Questions</div>
              <h2>FAQs</h2>
              <div class="faqs">
                ${faqs.map((faq, i) => `
                  <div class="faq ${i === 0 ? "open" : ""}">
                    <button type="button" aria-expanded="${i === 0}">
                      <span>${escapeHTML(faq[0])}</span><span>+</span>
                    </button>
                    <p>${escapeHTML(faq[1] || "")}</p>
                  </div>
                `).join("")}
              </div>
            </article>

            <aside class="booking-card">
              <div class="kicker">Private / group trip</div>
              <div class="booking-price">${escapeHTML(pkg.price || "")} ${escapeHTML(pkg.currency || "")}</div>
              <small>${escapeHTML(pkg.price_details || "per person · final price depends on customization")}</small>
              <div class="booking-divider"></div>
              <div class="booking-fact"><span>Destination</span><strong>${escapeHTML(pkg.destination || "")}</strong></div>
              <div class="booking-fact"><span>Duration</span><strong>${escapeHTML(pkg.duration || "")}</strong></div>
              <div class="booking-fact"><span>Difficulty</span><strong>${escapeHTML(pkg.difficulty || "")}</strong></div>
              <div class="booking-fact"><span>Best season</span><strong>${escapeHTML(pkg.best_season || "")}</strong></div>
              <a class="btn btn-primary" href="mailto:hello@himalaya.example?subject=${encodeURIComponent("Enquiry: " + pkg.title)}">Enquire about this trip →</a>
              <a class="link" style="display:block;text-align:center;margin-top:15px" href="packages.html">← Browse all packages</a>
            </aside>
          </div>
        </section>
      `;

      app.querySelectorAll(".faq button").forEach(button => {
        button.addEventListener("click", () => {
          const faq = button.closest(".faq");
          const open = faq.classList.toggle("open");
          button.setAttribute("aria-expanded", String(open));
        });
      });
    })
    .catch((error) => {
      console.error("Error loading package:", error);
      document.title = "Package not found — Himalaya";
      app.innerHTML = `
        <section class="not-found">
          <div>
            <div class="kicker">Package not found</div>
            <h1 style="font-size:clamp(42px,6vw,72px);letter-spacing:-3px;margin-bottom:18px">That journey doesn't exist.</h1>
            <p style="color:var(--muted);margin-bottom:25px">${escapeHTML(error.message)}</p>
            <a class="btn btn-primary" href="packages.html">Browse packages →</a>
          </div>
        </section>`;
    });
});
