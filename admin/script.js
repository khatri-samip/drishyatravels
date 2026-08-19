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
});

/* =========================
   LOAD PACKAGES
========================= */

async function loadPackages() {
  try {
    // Note: The original code fetched from http://localhost:5000/api/packages.
    // Since there is no backend, we fall back to reading from the static data file.
    if (typeof getAllPackages !== "function") {
      throw new Error("Missing data/packages.js dependency");
    }

    const packages = getAllPackages();
    renderPackages(packages);
    updateStats(packages);
  } catch (error) {
    console.error(error);
    const list = document.getElementById("packageList");
    if (list) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">!</div>
          <h3>Static Data Missing</h3>
          <p>Could not load the static packages data.</p>
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
    <div class="package-row">
      <div class="package-name">
        <img
          class="package-thumb"
          src="${escapeHTML(pkg.heroImage || "")}"
          alt="${escapeHTML(pkg.title)}"
        >
        <div>
          <strong>${escapeHTML(pkg.title)}</strong>
          <small>${escapeHTML(pkg.destination || "")}</small>
        </div>
      </div>
      <span>${escapeHTML(pkg.category || "Trekking")}</span>
      <span>${escapeHTML(pkg.duration || "")}</span>
      <span>${escapeHTML(pkg.price || "")}</span>
      <span>
        <span class="status ${pkg.status === "draft" ? "draft" : "published"}">
          ${pkg.status === "draft" ? "Draft" : "Published"}
        </span>
      </span>
      <span class="row-actions">
        <button class="action-btn" onclick="editPackage('${pkg.id}')">Edit</button>
        <button class="action-btn delete" onclick="deletePackage('${pkg.id}')">Delete</button>
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
  if (message) {
    message.className = "form-message error";
    message.innerHTML = "<strong>Backend Required:</strong> Saving packages requires an active backend server, which is currently missing from this project.";
  }
}

/* =========================
   DELETE
========================= */

async function deletePackage(id) {
  alert("Backend Required: Deleting packages requires an active backend server.");
}

/* =========================
   EDIT
========================= */

async function editPackage(id) {
  alert("Backend Required: Editing packages requires an active backend server.");
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
   SECURITY
========================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}