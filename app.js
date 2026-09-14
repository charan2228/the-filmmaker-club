// ============================================
// THE FILMMAKER CLUB — LIVE FRONTEND
// Supabase-connected event + booking system
// ============================================

const SUPABASE_URL =
  "https://kzkxybzobqepuncprkds.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_tcZ7tjWlulDTyk8BWmRhLA_hUMMghoq";

// Your poster file in the same GitHub folder as index.html
const POSTER_URL = "./mirchi-poster.png";

const DEFAULT_EVENT = {
  movie_title: "Mirchi",
  event_eyebrow: "THE FILMMAKER CLUB PRESENTS",
  event_date: "16 September 2026",
  event_time: "12:00 PM",
  event_venue: "Purna Hall",
  event_description:
    "Join The Filmmaker Club for a special screening of Mirchi.",
  poster_image: POSTER_URL,
  poster_tag: "SPECIAL SCREENING",
  poster_year: "2013",
  hero_kicker: "THE FILMMAKER CLUB",
  hero_title: "MIRCHI",
  hero_subtitle: "A special movie screening experience.",
  hero_date: "16 SEPTEMBER 2026",
  hero_venue: "PURNA HALL",
  hero_background: "",
  marquee_text: "THE FILMMAKER CLUB • MIRCHI • SPECIAL SCREENING",
  about_title: "THE FILMMAKER CLUB",
  about_text:
    "A community built around cinema, storytelling and unforgettable screening experiences.",
  about_signature: "THE FILMMAKER CLUB",
  cta_kicker: "RESERVE YOUR SEAT",
  cta_title: "SEE YOU AT THE SCREENING.",
  footer_text: "The Filmmaker Club",
  footer_social: "@thefilmmakerclub",
  accent_color: "#d6b36a",
  background_color: "#090909",
  ticket_price: 0,
  ticket_capacity: 130,
  max_per_booking: 2,
  waitlist_limit: 25
};

let eventData = { ...DEFAULT_EVENT };
let availableSeats = DEFAULT_EVENT.ticket_capacity;

// ============================================
// SUPABASE HELPERS
// ============================================

async function supabaseRequest(endpoint, options = {}) {
  const response = await fetch(
    `${SUPABASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Supabase error ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ============================================
// LOAD EVENT
// ============================================

async function loadEvent() {
  try {
    const data = await supabaseRequest(
      "/rest/v1/events?select=*&is_active=eq.true&limit=1"
    );

    if (data && data.length > 0) {
      eventData = {
        ...DEFAULT_EVENT,
        ...data[0]
      };
    }

    renderEvent();
    await refreshAvailability();
  } catch (error) {
    console.error("Could not load event:", error);

    // Keep default Mirchi information if Supabase fails
    eventData = { ...DEFAULT_EVENT };

    renderEvent();
    await refreshAvailability();
  }
}

// ============================================
// FORMATTERS
// ============================================

function formatPrice(price) {
  const amount = Number(price || 0);

  if (amount === 0) {
    return "FREE";
  }

  return `₹${amount}`;
}

function formatDate(value) {
  if (!value) return "16 September 2026";

  // If already human-readable, use it
  if (/[A-Za-z]/.test(value)) {
    return value;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatDateUpper(value) {
  return formatDate(value).toUpperCase();
}

// ============================================
// SAFE TEXT HELPERS
// ============================================

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value ?? "";
  }
}

function setHTML(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.innerHTML = value ?? "";
  }
}

// ============================================
// RENDER EVENT
// ============================================

function renderEvent() {
  const e = eventData;

  // ------------------------------------------
  // General event information
  // ------------------------------------------

  setText(".event-eyebrow", e.event_eyebrow);
  setText(".event-title", e.movie_title);
  setText(".movie-title", e.movie_title);
  setText(".event-date", formatDate(e.event_date));
  setText(".event-time", e.event_time);
  setText(".event-venue", e.event_venue);
  setText(".event-description", e.event_description);

  // ------------------------------------------
  // Hero
  // ------------------------------------------

  setText(".hero-kicker", e.hero_kicker);
  setText(".hero-title", e.hero_title || e.movie_title);
  setText(".hero-subtitle", e.hero_subtitle);
  setText(".hero-date", e.hero_date || formatDateUpper(e.event_date));
  setText(".hero-venue", e.hero_venue || e.event_venue);

  // ------------------------------------------
  // Marquee
  // ------------------------------------------

  document.querySelectorAll(".marquee-text").forEach((el) => {
    el.textContent = e.marquee_text;
  });

  // ------------------------------------------
  // About
  // ------------------------------------------

  setText(".about-title", e.about_title);
  setText(".about-text", e.about_text);
  setText(".about-signature", e.about_signature);

  // ------------------------------------------
  // CTA
  // ------------------------------------------

  setText(".cta-kicker", e.cta_kicker);
  setText(".cta-title", e.cta_title);

  // ------------------------------------------
  // Footer
  // ------------------------------------------

  setText(".footer-text", e.footer_text);
  setText(".footer-social", e.footer_social);

  // ------------------------------------------
  // Ticket price
  // ------------------------------------------

  document.querySelectorAll(".ticket-price").forEach((el) => {
    el.textContent = formatPrice(e.ticket_price);
  });

  // ------------------------------------------
  // Poster
  // ------------------------------------------

  const poster =
    e.poster_image && e.poster_image.trim()
      ? e.poster_image
      : POSTER_URL;

  const posterImage = document.querySelector("#posterImage");

  if (posterImage) {
    posterImage.src = poster;
    posterImage.alt = `${e.movie_title} poster`;

    posterImage.onerror = () => {
      posterImage.src = POSTER_URL;
    };
  }

  // ------------------------------------------
  // Hero background
  // ------------------------------------------

  if (e.hero_background) {
    document.querySelectorAll(".hero").forEach((hero) => {
      hero.style.backgroundImage = `
        linear-gradient(
          rgba(0,0,0,.55),
          rgba(0,0,0,.85)
        ),
        url("${e.hero_background}")
      `;
    });
  }

  // ------------------------------------------
  // Theme colors
  // ------------------------------------------

  if (e.accent_color) {
    document.documentElement.style.setProperty(
      "--accent",
      e.accent_color
    );

    document.documentElement.style.setProperty(
      "--gold",
      e.accent_color
    );
  }

  if (e.background_color) {
    document.documentElement.style.setProperty(
      "--background",
      e.background_color
    );

    document.documentElement.style.setProperty(
      "--bg",
      e.background_color
    );
  }

  // ------------------------------------------
  // Quantity selector
  // ------------------------------------------

  updateQuantityOptions();
}

// ============================================
// AVAILABILITY
// ============================================

async function refreshAvailability() {
  try {
    const eventId = eventData.id;

    if (!eventId) {
      availableSeats = Number(eventData.ticket_capacity || 130);
      updateAvailabilityUI();
      return;
    }

    const bookings = await supabaseRequest(
      `/rest/v1/bookings?select=quantity&event_id=eq.${encodeURIComponent(
        eventId
      )}&status=eq.confirmed`
    );

    const booked = (bookings || []).reduce(
      (total, booking) =>
        total + Number(booking.quantity || 0),
      0
    );

    const capacity = Number(
      eventData.ticket_capacity || 130
    );

    availableSeats = Math.max(capacity - booked, 0);

    updateAvailabilityUI();
    updateQuantityOptions();
  } catch (error) {
    console.error("Availability error:", error);

    availableSeats = Number(
      eventData.ticket_capacity || 130
    );

    updateAvailabilityUI();
  }
}

function updateAvailabilityUI() {
  document.querySelectorAll(
    ".available-seats, [data-available-seats]"
  ).forEach((el) => {
    el.textContent = availableSeats;
  });

  document.querySelectorAll(
    ".capacity, [data-capacity]"
  ).forEach((el) => {
    el.textContent = eventData.ticket_capacity || 130;
  });

  document.querySelectorAll(
    ".availability"
  ).forEach((el) => {
    if (availableSeats <= 0) {
      el.textContent = "SOLD OUT";
    } else {
      el.textContent = `${availableSeats} SEATS AVAILABLE`;
    }
  });
}

// ============================================
// QUANTITY OPTIONS
// ============================================

function updateQuantityOptions() {
  const maxBooking = Number(
    eventData.max_per_booking || 2
  );

  const maximum = Math.min(
    maxBooking,
    Math.max(availableSeats, 0)
  );

  document.querySelectorAll(
    'select[name="quantity"], #quantity'
  ).forEach((select) => {
    const currentValue = Number(select.value || 1);

    select.innerHTML = "";

    if (maximum <= 0) {
      const option = document.createElement("option");
      option.value = "0";
      option.textContent = "Sold Out";
      select.appendChild(option);
      return;
    }

    for (let i = 1; i <= maximum; i++) {
      const option = document.createElement("option");

      option.value = String(i);
      option.textContent =
        i === 1 ? "1 Ticket" : `${i} Tickets`;

      if (i === currentValue) {
        option.selected = true;
      }

      select.appendChild(option);
    }
  });
}

// ============================================
// BOOKING MODAL
// ============================================

function getBookingModal() {
  return (
    document.querySelector("#bookingModal") ||
    document.querySelector(".booking-modal") ||
    document.querySelector('[data-booking-modal]')
  );
}

function openBookingModal() {
  const modal = getBookingModal();

  if (!modal) {
    console.warn("Booking modal not found.");
    return;
  }

  modal.classList.add("active");
  modal.classList.add("open");

  modal.style.display = "flex";

  document.body.classList.add("modal-open");
}

function closeBookingModal() {
  const modal = getBookingModal();

  if (!modal) return;

  modal.classList.remove("active");
  modal.classList.remove("open");

  modal.style.display = "";

  document.body.classList.remove("modal-open");
}

// ============================================
// BOOKING FORM
// ============================================

function getBookingForm() {
  return (
    document.querySelector("#bookingForm") ||
    document.querySelector('form[data-booking-form]') ||
    document.querySelector(".booking-form")
  );
}

async function submitBooking(form) {
  const formData = new FormData(form);

  const name =
    formData.get("name") ||
    formData.get("customer_name") ||
    "";

  const phone =
    formData.get("phone") ||
    formData.get("customer_phone") ||
    "";

  const email =
    formData.get("email") ||
    formData.get("customer_email") ||
    "";

  const quantity = Number(
    formData.get("quantity") || 1
  );

  if (!name.trim()) {
    alert("Please enter your name.");
    return;
  }

  if (!phone.trim()) {
    alert("Please enter your phone number.");
    return;
  }

  if (!eventData.id) {
    alert(
      "The screening is temporarily unavailable. Please try again."
    );
    return;
  }

  if (quantity < 1) {
    alert("Please select at least 1 ticket.");
    return;
  }

  if (
    quantity >
    Number(eventData.max_per_booking || 2)
  ) {
    alert(
      `Maximum ${eventData.max_per_booking || 2} tickets per booking.`
    );
    return;
  }

  if (quantity > availableSeats) {
    alert(
      `Only ${availableSeats} seat${
        availableSeats === 1 ? "" : "s"
      } remaining.`
    );

    await refreshAvailability();
    return;
  }

  const submitButton =
    form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

  const originalButtonText = submitButton
    ? submitButton.textContent
    : "";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "BOOKING...";
  }

  try {
    const bookingCode = createBookingCode();

    const booking = {
      event_id: eventData.id,
      booking_code: bookingCode,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim(),
      quantity,
      status: "pending"
    };

    await supabaseRequest(
      "/rest/v1/bookings",
      {
        method: "POST",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify(booking)
      }
    );

    showBookingSuccess({
      ...booking,
      movie_title: eventData.movie_title,
      event_date: formatDate(eventData.event_date),
      event_time: eventData.event_time,
      event_venue: eventData.event_venue,
      ticket_price: eventData.ticket_price
    });

    form.reset();

    await refreshAvailability();
  } catch (error) {
    console.error("Booking error:", error);

    alert(
      "We couldn't complete your booking right now. Please try again."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent =
        originalButtonText || "BOOK NOW";
    }
  }
}

// ============================================
// BOOKING CODE
// ============================================

function createBookingCode() {
  const timestamp = Date.now()
    .toString(36)
    .toUpperCase();

  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `TFC-${timestamp}-${random}`;
}

// ============================================
// SUCCESS MESSAGE
// ============================================

function showBookingSuccess(booking) {
  const modal = getBookingModal();

  if (!modal) {
    alert(
      `Booking submitted successfully!\n\nBooking Code: ${booking.booking_code}`
    );
    return;
  }

  const form = getBookingForm();

  if (form) {
    form.style.display = "none";
  }

  let success =
    modal.querySelector(".booking-success");

  if (!success) {
    success = document.createElement("div");
    success.className = "booking-success";

    modal.appendChild(success);
  }

  success.style.display = "block";

  success.innerHTML = `
    <div class="success-inner">
      <div class="success-kicker">
        BOOKING SUBMITTED
      </div>

      <h2>
        YOU'RE ON THE LIST.
      </h2>

      <p>
        Your booking request for
        <strong>${escapeHTML(
          booking.movie_title
        )}</strong>
        has been received.
      </p>

      <div class="booking-code">
        <span>BOOKING CODE</span>
        <strong>${escapeHTML(
          booking.booking_code
        )}</strong>
      </div>

      <div class="booking-details">
        <p>
          <strong>DATE</strong><br>
          ${escapeHTML(booking.event_date)}
        </p>

        <p>
          <strong>TIME</strong><br>
          ${escapeHTML(booking.event_time)}
        </p>

        <p>
          <strong>VENUE</strong><br>
          ${escapeHTML(booking.event_venue)}
        </p>

        <p>
          <strong>TICKETS</strong><br>
          ${booking.quantity}
        </p>

        <p>
          <strong>PRICE</strong><br>
          ${formatPrice(booking.ticket_price)}
        </p>
      </div>

      <p class="success-note">
        Please keep your booking code.
        Your final confirmation/ticket will be provided
        once the booking is confirmed.
      </p>

      <button
        type="button"
        class="close-success"
        onclick="closeBookingModal()"
      >
        CLOSE
      </button>
    </div>
  `;
}

// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================
// BUTTONS / EVENTS
// ============================================

function setupInteractions() {
  // Booking buttons
  document.querySelectorAll(
    '[data-booking], [data-action="booking"], .book-now, .booking-btn'
  ).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      if (availableSeats <= 0) {
        alert("This screening is currently sold out.");
        return;
      }

      openBookingModal();
    });
  });

  // Close buttons
  document.querySelectorAll(
    '[data-close-booking], .close-modal, .modal-close'
  ).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeBookingModal();
    });
  });

  // Click outside modal
  const modal = getBookingModal();

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeBookingModal();
      }
    });
  }

  // Booking form
  const form = getBookingForm();

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      await submitBooking(form);
    });
  }

  // ESC key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBookingModal();
    }
  });
}

// ============================================
// LOCAL FALLBACK
// ============================================

function applyLocalFallback() {
  try {
    const saved = localStorage.getItem(
      "filmmakerClubEvent"
    );

    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (parsed && typeof parsed === "object") {
      eventData = {
        ...eventData,
        ...parsed
      };

      renderEvent();
    }
  } catch (error) {
    console.warn(
      "Local event fallback unavailable:",
      error
    );
  }
}

// ============================================
// START APPLICATION
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  applyLocalFallback();

  setupInteractions();

  await loadEvent();

  // Refresh availability periodically
  setInterval(
    refreshAvailability,
    30000
  );
});
