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
