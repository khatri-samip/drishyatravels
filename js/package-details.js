document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const pkg = typeof getPackageById === "function" ? getPackageById(id) : null;
  const app = document.getElementById("packageApp");

  if (!app) return;

  if (!pkg) {
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

  document.title = `${pkg.title} — Himalaya`;

  const escapeHTML = value => String(value)
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

  app.innerHTML = `
    <section class="package-hero" style="background-image:url('${pkg.heroImage}')">
      <div class="container package-hero-content">
        <div class="kicker" style="color:#f1ad88">${escapeHTML(pkg.destination)}</div>
        <div class="package-title">
          <h1>${escapeHTML(pkg.title)}</h1>
          <p>${escapeHTML(pkg.description)}</p>
        </div>
        <div class="package-meta">
          <span class="package-pill">${escapeHTML(pkg.duration)}</span>
          <span class="package-pill">${escapeHTML(pkg.difficulty)}</span>
          <span class="package-pill">${escapeHTML(pkg.bestSeason)}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container package-layout">
        <article class="package-main">
          <div class="kicker">Your journey</div>
          <h2>Highlights</h2>
          <div class="highlight-grid">
            ${pkg.highlights.map(item => `<div class="highlight">${escapeHTML(item)}</div>`).join("")}
          </div>

          <div class="kicker">Day by day</div>
          <h2>Itinerary</h2>
          <div class="itinerary">
            ${pkg.itinerary.map(day => `
              <div class="day">
                <div class="day-number">${escapeHTML(day[0])}</div>
                <div><h3>${escapeHTML(day[1])}</h3><p>${escapeHTML(day[2])}</p></div>
              </div>
            `).join("")}
          </div>

          <div class="included-grid">
            <div class="service-box">
              <h3>Included</h3>
              <ul>${pkg.included.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
            </div>
            <div class="service-box">
              <h3>Not included</h3>
              <ul>${pkg.excluded.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
            </div>
          </div>

          <div class="kicker" style="margin-top:55px">Gallery</div>
          <div class="gallery">
            ${pkg.gallery.map((img, i) => `<img src="${img}" alt="${escapeHTML(pkg.title)} gallery ${i+1}" loading="lazy">`).join("")}
          </div>

          <div class="kicker">Questions</div>
          <h2>FAQs</h2>
          <div class="faqs">
            ${pkg.faqs.map((faq, i) => `
              <div class="faq ${i === 0 ? "open" : ""}">
                <button type="button" aria-expanded="${i === 0}">
                  <span>${escapeHTML(faq[0])}</span><span>+</span>
                </button>
                <p>${escapeHTML(faq[1])}</p>
              </div>
            `).join("")}
          </div>
        </article>

        <aside class="booking-card">
          <div class="kicker">Private / group trip</div>
          <div class="booking-price">${escapeHTML(pkg.price)}</div>
          <small>${escapeHTML(pkg.priceDetails || "per person · final price depends on customization")}</small>
          <div class="booking-divider"></div>
          <div class="booking-fact"><span>Destination</span><strong>${escapeHTML(pkg.destination)}</strong></div>
          <div class="booking-fact"><span>Duration</span><strong>${escapeHTML(pkg.duration)}</strong></div>
          <div class="booking-fact"><span>Difficulty</span><strong>${escapeHTML(pkg.difficulty)}</strong></div>
          <div class="booking-fact"><span>Best season</span><strong>${escapeHTML(pkg.bestSeason)}</strong></div>
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
});
