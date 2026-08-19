function toggleMenu(){
  const links = document.querySelector(".links");
  if (!links) return;
  const open = links.style.display === "flex";
  links.style.display = open ? "none" : "flex";
  if (!open) {
    Object.assign(links.style, {
      position:"absolute", top:"72px", left:"4%", right:"4%", padding:"20px",
      borderRadius:"16px", background:"rgba(12,27,24,.96)",
      flexDirection:"column", gap:"18px"
    });
  }
}

function planTrip(){
  const style = document.getElementById("style")?.value;
  const days = document.getElementById("days")?.value;
  const month = document.getElementById("month")?.value;
  const people = document.getElementById("people")?.value;
  const result = document.getElementById("result");
  if (!result) return;

  let route = "Kathmandu → Pokhara → Chitwan";
  if(style === "Adventure") route = "Kathmandu → Pokhara → Annapurna region";
  if(style === "Culture") route = "Kathmandu → Bhaktapur → Patan → Bandipur";
  if(style === "Wildlife") route = "Kathmandu → Chitwan → Pokhara";
  if(style === "Relaxed") route = "Kathmandu → Pokhara → Bandipur";

  result.innerHTML = `<strong>Your starting route:</strong> ${route}<br><small>${days} · ${month} · ${people} traveller(s). This demo can later be connected to your backend itinerary engine.</small>`;
  result.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {

  const packagesContainer =
    document.getElementById("packages-container");

  if (!packagesContainer) return;

  loadHomepagePackages();

});


async function loadHomepagePackages() {

  const packagesContainer =
    document.getElementById("packages-container");

  try {

    const response =
      await fetch("http://localhost:5000/api/packages");

    if (!response.ok) {
      throw new Error("Failed to load packages");
    }

    const packages = await response.json();

    /*
      If MongoDB has no packages,
      don't display anything.
    */

    if (!packages || packages.length === 0) {

      packagesContainer.innerHTML = "";

      return;
    }


    packagesContainer.innerHTML = packages.map(pkg => `

      <article class="card">

        <a
          href="package.html?id=${encodeURIComponent(pkg._id)}"
          aria-label="Explore ${escapeHTML(pkg.title)}"
        >

          <div class="card-img">

            <div
              class="card-img-bg"
              style="background-image:url('${pkg.heroImage}')"
            >
            </div>

            <span class="tag">
              ${escapeHTML(pkg.category)}
            </span>

            <span class="explore-text">
              Explore Now →
            </span>

          </div>


          <div class="card-body">

            <h3>
              ${escapeHTML(pkg.title)}
            </h3>

            <p>
              ${escapeHTML(pkg.description || "")}
            </p>


            <div class="card-meta">

              <span>
                ${escapeHTML(pkg.duration || "")}
              </span>

              <span>
                → Explore
              </span>

            </div>

          </div>

        </a>

      </article>

    `).join("");


  } catch (error) {

    console.error(
      "Could not load packages:",
      error
    );

    /*
      If the backend isn't running or
      there are no packages, don't show
      any hardcoded cards.
    */

    packagesContainer.innerHTML = "";

  }

}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}