document.addEventListener("DOMContentLoaded", () => {
  loadPackages();

  const form = document.getElementById("packageForm");
  if (form) {
    form.addEventListener("submit", savePackage);
  }

  const imageInput = document.getElementById("heroImage");
  if (imageInput) {
    imageInput.addEventListener("input", () => {
      const url = imageInput.value.trim();
      const preview = document.getElementById("imagePreview");
      if (!url) {
        preview.style.display = "none";
        preview.innerHTML = "";
        return;
      }
      preview.style.display = "block";
      preview.innerHTML = `
        <img
          src="${escapeHTML(url)}"
          alt="Package preview"
          onerror="this.parentElement.style.display='none'"
        >
      `;
    });
  }

  // Add Day button
  const addDayBtn = document.getElementById("addDayBtn");
  if (addDayBtn) {
    addDayBtn.addEventListener("click", () => addDayField());
  }

  // Event delegation for edit/delete buttons in package table
  const packageList = document.getElementById("packageList");
  if (packageList) {
    packageList.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-btn");
      const deleteBtn = e.target.closest(".delete-btn");

      if (editBtn) {
        const id = editBtn.dataset.id;
        if (id) editPackage(id);
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (id) deletePackage(id);
      }
    });
  }

  // Itinerary list delegation (remove day)
  const itineraryList = document.getElementById("itineraryList");
  if (itineraryList) {
    itineraryList.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".remove-day-btn");
      if (removeBtn) {
        removeBtn.closest(".itinerary-day").remove();
        updateItineraryEmptyState();
      }
    });
  }
});

/* =========================
   LOAD PACKAGES
========================= */

async function loadPackages() {
  try {
    const response = await fetch("/DRISHYATRAVELS/backend/api/packages/", {
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

    renderPackages(packages);
    updateStats(packages);
  } catch (error) {
    console.error(error);
    const list = document.getElementById("packageList");
    if (list) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">!</div>
          <h3>Unable to Load Packages</h3>
          <p>Could not connect to the backend API. Please check your connection.</p>
        </div>
      `;
    }
  }
}

/* =========================
   RENDER PACKAGES
========================= */

function renderPackages(packages) {
  const list = document.getElementById("packageList");
  if (!list) return;

  if (!packages.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">+</div>
        <h3>No packages yet</h3>
        <p>Add your first package to get started.</p>
        <a href="#add-package" class="btn btn-primary">Add Package</a>
      </div>
    `;
    return;
  }

  list.innerHTML = packages.map(pkg => `
    <div class="package-row" data-id="${escapeHTML(pkg.id)}">
      <div class="package-name">
        <img
          class="package-thumb"
          src="${escapeHTML(pkg.hero_image_url || "")}"
          alt="${escapeHTML(pkg.title)}"
        >
        <div>
          <strong>${escapeHTML(pkg.title)}</strong>
          <small>${escapeHTML(pkg.destination || "")}</small>
        </div>
      </div>
      <span>${escapeHTML(pkg.category || "Trekking")}</span>
      <span>${escapeHTML(pkg.duration || "")}</span>
      <span>${escapeHTML(pkg.price || "")} ${escapeHTML(pkg.currency || "")}</span>
      <span>
        <span class="status ${pkg.status === "draft" ? "draft" : "published"}">
          ${pkg.status === "draft" ? "Draft" : "Published"}
        </span>
      </span>
      <span class="row-actions">
        <button class="action-btn edit-btn" data-id="${escapeHTML(pkg.id)}">Edit</button>
        <button class="action-btn delete delete-btn" data-id="${escapeHTML(pkg.id)}">Delete</button>
      </span>
    </div>
  `).join("");
}

/* =========================
   SAVE PACKAGE
========================= */

async function savePackage(event) {
  event.preventDefault();

  const message = document.getElementById("formMessage");
  const form = event.target;

  // Collect form data
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Map frontend field names to backend snake_case
  const payload = {
    id: data.id || slugify(data.title || ''),
    title: data.title,
    category: data.category,
    destination: data.destination,
    duration: data.duration,
    price: parseFloat(data.price) || 0,
    currency: data.currency || 'USD',
    price_details: data.priceDetails || null,
    difficulty: data.difficulty || null,
    best_season: data.bestSeason || null,
    maximum_altitude: data.maxAltitude || null,
    starting_point: data.startPoint || null,
    ending_point: data.endPoint || null,
    package_type: data.packageType || null,
    short_description: data.description,
    description: data.fullDescription || data.description,
    hero_image_url: data.heroImage,
    status: data.status || 'draft',
    itinerary: collectItinerary(),
    highlights: collectHighlights(),
    inclusions: collectInclusions(),
    exclusions: collectExclusions(),
    gallery: collectGallery(),
    faqs: collectFaqs(),
  };

  const isEdit = form.dataset.editId || false;

  try {
    const url = isEdit
      ? `/DRISHYATRAVELS/backend/api/packages/${encodeURIComponent(isEdit)}`
      : "/DRISHYATRAVELS/backend/api/packages/";

    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `Failed to ${isEdit ? 'update' : 'create'} package`);
    }

    // Success
    if (message) {
      message.className = "form-message success";
      message.innerHTML = `<strong>Success!</strong> Package ${isEdit ? 'updated' : 'created'} successfully.`;
    }

    // Reset form for new package
    if (!isEdit) {
      form.reset();
      clearItinerary();
    }

    // Clear edit mode
    form.dataset.editId = "";
    form.querySelector('button[type="submit"]').textContent = "Save Package →";

    // Reload packages
    loadPackages();

    // Scroll to packages section
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error(error);
    if (message) {
      message.className = "form-message error";
      message.innerHTML = `<strong>Error:</strong> ${escapeHTML(error.message)}`;
    }
  }
}

/* =========================
   DELETE
========================= */

async function deletePackage(id) {
  if (!confirm(`Are you sure you want to delete this package? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`/DRISHYATRAVELS/backend/api/packages/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete package");
    }

    loadPackages();
  } catch (error) {
    console.error(error);
    alert("Failed to delete package. Please try again.");
  }
}

/* =========================
   EDIT
========================= */

async function editPackage(id) {
  try {
    const response = await fetch(`/DRISHYATRAVELS/backend/api/packages/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch package");
    }

    const result = await response.json();
    const pkg = result.data;

    if (!pkg) {
      throw new Error("Package not found");
    }

    // Populate form
    const form = document.getElementById("packageForm");

    form.querySelector("#title").value = pkg.title || "";
    form.querySelector("#category").value = pkg.category || "";
    form.querySelector("#destination").value = pkg.destination || "";
    form.querySelector("#duration").value = pkg.duration || "";
    form.querySelector("#price").value = pkg.price || "";
    form.querySelector("#difficulty").value = pkg.difficulty || "";
    form.querySelector("#bestSeason").value = pkg.best_season || "";
    form.querySelector("#maxAltitude").value = pkg.maximum_altitude || "";
    form.querySelector("#startPoint").value = pkg.starting_point || "";
    form.querySelector("#endPoint").value = pkg.ending_point || "";
    form.querySelector("#packageType").value = pkg.package_type || "";
    form.querySelector("#description").value = pkg.short_description || "";
    form.querySelector("#fullDescription").value = pkg.description || "";
    form.querySelector("#heroImage").value = pkg.hero_image_url || "";
    form.querySelector("#status").value = pkg.status || "draft";

    // Trigger image preview
    form.querySelector("#heroImage").dispatchEvent(new Event("input"));

    // Populate relations
    populateItinerary(pkg.itinerary || []);
    populateHighlights(pkg.highlights || []);
    populateInclusions(pkg.inclusions || []);
    populateExclusions(pkg.exclusions || []);
    populateGallery(pkg.gallery || []);
    populateFaqs(pkg.faqs || []);

    // Set edit mode
    form.dataset.editId = pkg.id;

    // Change submit button text
    form.querySelector('button[type="submit"]').textContent = "Update Package →";

    // Scroll to form
    document.getElementById("add-package")?.scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error(error);
    alert("Failed to load package for editing. Please try again.");
  }
}

/* =========================
   ITINERARY MANAGEMENT
========================= */

function addDayField(day = null) {
  const list = document.getElementById("itineraryList");
  const empty = document.getElementById("itineraryEmpty");

  if (empty) empty.style.display = "none";

  const dayNum = day?.day_number || (list.children.length + 1);
  const dayId = `day-${Date.now()}-${dayNum}`;

  const dayEl = document.createElement("div");
  dayEl.className = "itinerary-day";
  dayEl.dataset.id = dayId;
  dayEl.innerHTML = `
    <div class="itinerary-day-header">
      <span class="day-num">Day ${dayNum}</span>
      <button type="button" class="remove-day-btn" title="Remove day">×</button>
    </div>
    <div class="itinerary-day-fields">
      <input type="hidden" class="day-number" value="${dayNum}">
      <div class="field">
        <label>Title</label>
        <input type="text" class="day-title" placeholder="e.g. Kathmandu to Pokhara" value="${escapeHTML(day?.title || "")}">
      </div>
      <div class="field field-full">
        <label>Description</label>
        <textarea class="day-description" rows="3" placeholder="Describe the day's activities...">${escapeHTML(day?.description || "")}</textarea>
      </div>
    </div>
  `;

  list.appendChild(dayEl);
}

function populateItinerary(days) {
  clearItinerary();
  if (days.length === 0) {
    updateItineraryEmptyState();
    return;
  }
  days.forEach(day => addDayField(day));
}

function clearItinerary() {
  const list = document.getElementById("itineraryList");
  if (list) list.innerHTML = "";
  updateItineraryEmptyState();
}

function updateItineraryEmptyState() {
  const list = document.getElementById("itineraryList");
  const empty = document.getElementById("itineraryEmpty");
  if (list && empty) {
    empty.style.display = list.children.length === 0 ? "block" : "none";
  }
}

function collectItinerary() {
  const list = document.getElementById("itineraryList");
  if (!list) return [];
  return Array.from(list.querySelectorAll(".itinerary-day")).map(dayEl => ({
    day_number: parseInt(dayEl.querySelector(".day-number").value, 10) || 0,
    title: dayEl.querySelector(".day-title").value.trim(),
    description: dayEl.querySelector(".day-description").value.trim(),
  })).filter(d => d.title || d.description);
}

/* =========================
   HIGHLIGHTS / INCLUSIONS / EXCLUSIONS / GALLERY / FAQS
   (simplified: comma or newline separated in single textarea)
========================= */

function populateSimpleList(items, containerId, fieldName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const values = items.map(item => item[fieldName] ?? '').filter(Boolean);
  container.value = values.join("\n");
}

function populateHighlights(items) {
  const container = document.getElementById("highlightsInput");
  if (!container) return;
  container.value = items.map(h => h.highlight).join("\n");
}

function populateInclusions(items) {
  const container = document.getElementById("inclusionsInput");
  if (!container) return;
  container.value = items.map(i => i.inclusion).join("\n");
}

function populateExclusions(items) {
  const container = document.getElementById("exclusionsInput");
  if (!container) return;
  container.value = items.map(e => e.exclusion).join("\n");
}

function populateGallery(items) {
  const container = document.getElementById("galleryInput");
  if (!container) return;
  container.value = items.map(g => g.image_url).join("\n");
}

function populateFaqs(items) {
  const container = document.getElementById("faqsInput");
  if (!container) return;
  container.value = items.map(f => `${f.question}::${f.answer}`).join("\n");
}

function collectSimpleList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return container.value
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function collectHighlights() {
  return collectSimpleList("highlightsInput");
}

function collectInclusions() {
  return collectSimpleList("inclusionsInput");
}

function collectExclusions() {
  return collectSimpleList("exclusionsInput");
}

function collectGallery() {
  return collectSimpleList("galleryInput");
}

function collectFaqs() {
  const container = document.getElementById("faqsInput");
  if (!container) return [];
  return container.value
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [q, a] = line.split("::").map(s => s.trim());
      return { question: q || "", answer: a || "" };
    })
    .filter(f => f.question);
}

/* =========================
   STATISTICS
========================= */

function updateStats(packages) {
  const total = packages.length;
  // Fallback assuming everything is published unless explicitly draft
  const published = packages.filter(pkg => pkg.status !== "draft").length;
  const drafts = packages.filter(pkg => pkg.status === "draft").length;

  const totalEl = document.getElementById("totalPackages");
  if (totalEl) totalEl.textContent = total;

  const pubEl = document.getElementById("publishedPackages");
  if (pubEl) pubEl.textContent = published;

  const draftEl = document.getElementById("draftPackages");
  if (draftEl) draftEl.textContent = drafts;
}

/* =========================
   UTILITIES
========================= */

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'pkg-' + Date.now();
}
