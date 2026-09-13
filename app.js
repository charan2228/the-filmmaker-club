const eventConfig = {
  movie: "MOVIE SCREENING",
  date: "Saturday, 18 October 2026",
  time: "6:30 PM",
  venue: "Venue to be announced",
  description: "Join The Filmmaker Club for a special movie screening followed by a space to connect, discuss and celebrate cinema.",
  price: 199,
  capacity: 100
};

let sold = Number(localStorage.getItem("tfc_sold") || 0);

function refresh(){
  const left = Math.max(0, eventConfig.capacity - sold);
  document.querySelector("#heroMovie").innerHTML = eventConfig.movie.replace(" ", "<br>") + (eventConfig.movie.includes(" ") ? "" : "");
  document.querySelector("#posterMovie").innerHTML = eventConfig.movie.split(" ").slice(0,3).join(" ") + "<br>POSTER";
  document.querySelector("#movieTitle").textContent = eventConfig.movie;
  document.querySelector("#eventDate").textContent = eventConfig.date;
  document.querySelector("#eventTime").textContent = eventConfig.time;
  document.querySelector("#eventVenue").textContent = eventConfig.venue;
  document.querySelector("#eventDescription").textContent = eventConfig.description;
  document.querySelector("#ticketPrice").textContent = "₹" + eventConfig.price;
  document.querySelector("#ticketsLeft").textContent = left;
  document.querySelector("#barFill").style.width = ((left / eventConfig.capacity) * 100) + "%";
}
function openBooking(){ document.querySelector("#bookingModal").classList.add("open"); }
function closeBooking(){ document.querySelector("#bookingModal").classList.remove("open"); }
function closeTicket(){ document.querySelector("#ticketModal").classList.remove("open"); }

document.querySelector("#bookingForm").addEventListener("submit", e => {
  e.preventDefault();
  const qty = Number(document.querySelector("#quantity").value);
  const left = eventConfig.capacity - sold;
  if(qty > left){ alert("Not enough seats remaining."); return; }

  sold += qty;
  localStorage.setItem("tfc_sold", sold);

  const code = "TFC-" + Math.floor(100000 + Math.random() * 900000);
  document.querySelector("#ticketCode").textContent = code;
  document.querySelector("#ticketName").textContent = document.querySelector("#name").value;
  document.querySelector("#ticketMovie").textContent = eventConfig.movie;
  document.querySelector("#ticketDate").textContent = eventConfig.date + " · " + eventConfig.time;
  document.querySelector("#ticketVenue").textContent = eventConfig.venue;
  document.querySelector("#ticketQty").textContent = qty + (qty === 1 ? " ticket" : " tickets");

  closeBooking();
  document.querySelector("#ticketModal").classList.add("open");
  refresh();
  e.target.reset();
});

refresh();
