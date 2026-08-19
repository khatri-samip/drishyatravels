const API_URL = "http://localhost:5000/api/packages";


document.addEventListener("DOMContentLoaded", () => {

  loadPackages();

  const form = document.getElementById("packageForm");

  if (form) {
    form.addEventListener("submit", savePackage);
  }


  const imageInput =
    document.getElementById("heroImage");

  if (imageInput) {

    imageInput.addEventListener("input", () => {

      const url = imageInput.value.trim();

      const preview =
        document.getElementById("imagePreview");

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

    const response =
      await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load packages");
    }

    const packages =
      await response.json();

    renderPackages(packages);

    updateStats(packages);

  }

  catch (error) {

    console.error(error);

    const list =
      document.getElementById("packageList");

    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          !
        </div>

        <h3>
          Could not connect to server
        </h3>

        <p>
          Make sure your Express backend is running.
        </p>

      </div>

    `;

  }

}


/* =========================
   RENDER PACKAGES
========================= */

function renderPackages(packages) {

  const list =
    document.getElementById("packageList");


  if (!packages.length) {

    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          +
        </div>

        <h3>
          No packages yet
        </h3>

        <p>
          Add your first package to get started.
        </p>

        <a
          href="#add-package"
          class="btn btn-primary"
        >
          Add Package
        </a>

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

          <strong>
            ${escapeHTML(pkg.title)}
          </strong>

          <small>
            ${escapeHTML(pkg.destination || "")}
          </small>

        </div>

      </div>


      <span>
        ${escapeHTML(pkg.category || "")}
      </span>


      <span>
        ${escapeHTML(pkg.duration || "")}
      </span>


      <span>
        ${escapeHTML(pkg.price || "")}
      </span>


      <span>

        <span
          class="status ${
            pkg.status === "published"
              ? "published"
              : "draft"
          }"
        >

          ${
            pkg.status === "published"
              ? "Published"
              : "Draft"
          }

        </span>

      </span>


      <span class="row-actions">

        <button
          class="action-btn"
          onclick="editPackage('${pkg._id}')"
        >
          Edit
        </button>

        <button
          class="action-btn delete"
          onclick="deletePackage('${pkg._id}')"
        >
          Delete
        </button>

      </span>

    </div>

  `).join("");

}


/* =========================
   SAVE PACKAGE
========================= */

async function savePackage(event) {

  event.preventDefault();


  const form =
    document.getElementById("packageForm");

  const message =
    document.getElementById("formMessage");


  const formData =
    new FormData(form);


  const packageData = {

    title:
      formData.get("title"),

    category:
      formData.get("category"),

    destination:
      formData.get("destination"),

    description:
      formData.get("description"),

    duration:
      formData.get("duration"),

    price:
      formData.get("price"),

    heroImage:
      formData.get("heroImage"),

    difficulty:
      formData.get("difficulty"),

    bestSeason:
      formData.get("bestSeason"),

    status:
      formData.get("status")

  };


  try {

    const response =
      await fetch(API_URL, {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify(packageData)

      });


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Could not save package"
      );

    }


    message.className =
      "form-message success";

    message.textContent =
      "Package saved successfully.";


    form.reset();


    document.getElementById(
      "imagePreview"
    ).style.display = "none";


    await loadPackages();


    window.location.hash =
      "packages";


  }

  catch (error) {

    console.error(error);

    message.className =
      "form-message error";

    message.textContent =
      error.message ||
      "Something went wrong.";

  }

}


/* =========================
   DELETE
========================= */

async function deletePackage(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this package?"
    );


  if (!confirmed) return;


  try {

    const response =
      await fetch(
        `${API_URL}/${id}`,
        {
          method:"DELETE"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Could not delete package"
      );

    }


    await loadPackages();

  }

  catch (error) {

    console.error(error);

    alert(
      "Could not delete package."
    );

  }

}


/* =========================
   EDIT
========================= */

async function editPackage(id) {

  /*
    This is intentionally kept simple for now.

    Once the PUT endpoint exists,
    this can populate the form with
    the selected package and change
    the Save button to Update.
  */

  alert(
    "Edit functionality will be connected to the PUT API next."
  );

}


/* =========================
   STATISTICS
========================= */

function updateStats(packages) {

  const total =
    packages.length;

  const published =
    packages.filter(
      pkg => pkg.status === "published"
    ).length;

  const drafts =
    packages.filter(
      pkg => pkg.status === "draft"
    ).length;


  document.getElementById(
    "totalPackages"
  ).textContent = total;


  document.getElementById(
    "publishedPackages"
  ).textContent = published;


  document.getElementById(
    "draftPackages"
  ).textContent = drafts;

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