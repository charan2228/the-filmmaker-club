/* ============================================================
   THE FILMMAKER CLUB
   MIRCHI SCREENING — LIVE APP.JS
   ============================================================ */

const SUPABASE_URL =
  "https://kzkxybzobqepuncprkds.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_tcZ7tjWlulDTyk8BWmRhLA_hUMMghoq";

/* ============================================================
   POSTER
   Keep mirchi-poster.png in the same folder as index.html
   ============================================================ */

const POSTER_URL = "./mirchi-poster.png";


/* ============================================================
   DEFAULT EVENT
   ============================================================ */

const DEFAULT_EVENT = {
  movieTitle: "Mirchi",
  eventEyebrow: "THE FILMMAKER CLUB PRESENTS",

  eventDate: "16 September 2026",
  eventTime: "12:00 PM",
  eventVenue: "Purna Hall",

  eventDescription:
    "Join The Filmmaker Club for a special screening of Mirchi.",

  ticketPrice: 0,
  ticketCapacity: 130,
  maxPerBooking: 2,
  waitlistLimit: 25,

  heroKicker: "THE FILMMAKER CLUB",
  heroTitle: "MIRCHI",
  heroSubtitle:
    "A special movie screening experience.",

  heroDate: "16 SEPTEMBER 2026",
  heroVenue: "PURNA HALL",

  marqueeText:
    "THE FILMMAKER CLUB • MIRCHI • SPECIAL SCREENING",

  aboutTitle: "THE FILMMAKER CLUB",

  aboutText:
    "A community built around cinema, storytelling and unforgettable screening experiences.",

  aboutSignature:
    "THE FILMMAKER CLUB",

  ctaKicker:
    "RESERVE YOUR SEAT",

  ctaTitle:
    "SEE YOU AT THE SCREENING.",

  footerText:
    "The Filmmaker Club",

  footerSocial:
    "@thefilmmakerclub",

  accentColor:
    "#d6b36a",

  backgroundColor:
    "#090909"
};


/* ============================================================
   STATE
   ============================================================ */

let activeEvent = null;

let config = {
  ...DEFAULT_EVENT
};

let availableSeats =
  DEFAULT_EVENT.ticketCapacity;


/* ============================================================
   DOM HELPER
   ============================================================ */

function $(selector) {
  return document.querySelector(selector);
}


/* ============================================================
   TEXT HELPER
   ============================================================ */

function setText(selector, value) {

  const element = $(selector);

  if (!element) {
    return;
  }

  element.textContent =
    value ?? "";
}


/* ============================================================
   SUPABASE HEADERS
   ============================================================ */

function supabaseHeaders(extra = {}) {

  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,

    Authorization:
      `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,

    "Content-Type":
      "application/json",

    ...extra
  };
}


/* ============================================================
   SUPABASE FETCH
   ============================================================ */

async function supabaseFetch(
  path,
  options = {}
) {

  const response = await fetch(
    `${SUPABASE_URL}${path}`,
    {
      ...options,

      headers:
        supabaseHeaders(
          options.headers || {}
        )
    }
  );


  if (!response.ok) {

    const body =
      await response.text();

    throw new Error(
      `Supabase ${response.status}: ${body}`
    );
  }


  const text =
    await response.text();


  return text
    ? JSON.parse(text)
    : null;
}


/* ============================================================
   LOAD EVENT FROM SUPABASE
   ============================================================ */

async function loadEvent() {

  try {

    const rows =
      await supabaseFetch(
        "/rest/v1/events" +
        "?select=*" +
        "&is_active=eq.true" +
        "&limit=1"
      );


    if (
      Array.isArray(rows) &&
      rows.length > 0
    ) {

      activeEvent =
        rows[0];


      config = {

        ...DEFAULT_EVENT,

        movieTitle:
          activeEvent.movie_title ||
          DEFAULT_EVENT.movieTitle,

        eventEyebrow:
          activeEvent.event_eyebrow ||
          DEFAULT_EVENT.eventEyebrow,

        eventDate:
          activeEvent.event_date ||
          DEFAULT_EVENT.eventDate,

        eventTime:
          activeEvent.event_time ||
          DEFAULT_EVENT.eventTime,

        eventVenue:
          activeEvent.event_venue ||
          DEFAULT_EVENT.eventVenue,

        eventDescription:
          activeEvent.event_description ||
          DEFAULT_EVENT.eventDescription,

        ticketPrice:
          Number(
            activeEvent.ticket_price ??
            DEFAULT_EVENT.ticketPrice
          ),

        ticketCapacity:
          Number(
            activeEvent.ticket_capacity ??
            DEFAULT_EVENT.ticketCapacity
          ),

        maxPerBooking:
          Number(
            activeEvent.max_per_booking ??
            DEFAULT_EVENT.maxPerBooking
          ),

        waitlistLimit:
          Number(
            activeEvent.waitlist_limit ??
            DEFAULT_EVENT.waitlistLimit
          ),

        heroKicker:
          activeEvent.hero_kicker ||
          DEFAULT_EVENT.heroKicker,

        heroTitle:
          activeEvent.hero_title ||
          DEFAULT_EVENT.heroTitle,

        heroSubtitle:
          activeEvent.hero_subtitle ||
          DEFAULT_EVENT.heroSubtitle,

        heroDate:
          activeEvent.hero_date ||
          DEFAULT_EVENT.heroDate,

        heroVenue:
          activeEvent.hero_venue ||
          DEFAULT_EVENT.heroVenue,

        marqueeText:
          activeEvent.marquee_text ||
          DEFAULT_EVENT.marqueeText,

        aboutTitle:
          activeEvent.about_title ||
          DEFAULT_EVENT.aboutTitle,

        aboutText:
          activeEvent.about_text ||
          DEFAULT_EVENT.aboutText,

        aboutSignature:
          activeEvent.about_signature ||
          DEFAULT_EVENT.aboutSignature,

        ctaKicker:
          activeEvent.cta_kicker ||
          DEFAULT_EVENT.ctaKicker,

        ctaTitle:
          activeEvent.cta_title ||
          DEFAULT_EVENT.ctaTitle,

        footerText:
          activeEvent.footer_text ||
          DEFAULT_EVENT.footerText,

        footerSocial:
          activeEvent.footer_social ||
          DEFAULT_EVENT.footerSocial,

        accentColor:
          activeEvent.accent_color ||
          DEFAULT_EVENT.accentColor,

        backgroundColor:
          activeEvent.background_color ||
          DEFAULT_EVENT.backgroundColor
      };

    }

    else {

      activeEvent = null;

      config = {
        ...DEFAULT_EVENT
      };

    }

  }

  catch (error) {

    console.error(
      "Supabase event loading failed:",
      error
    );

    config = {
      ...DEFAULT_EVENT
    };

  }


  renderEvent();

  setupPoster();

  await refreshAvailability();

}


/* ============================================================
   FORMAT PRICE
   ============================================================ */

function formatPrice(price) {

  const amount =
    Number(price || 0);


  if (amount === 0) {

    return "FREE";

  }


  return `₹${amount}`;

}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(value) {

  if (!value) {

    return DEFAULT_EVENT.eventDate;

  }


  if (
    typeof value === "string" &&
    /[A-Za-z]/.test(value)
  ) {

    return value;

  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;

  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


/* ============================================================
   FORMAT UPPERCASE DATE
   ============================================================ */

function formatUpperDate(value) {

  return formatDate(value)
    .toUpperCase();

}


/* ============================================================
   RENDER EVENT
   ============================================================ */

function renderEvent() {

  setText(
    "#heroMovie",
    config.movieTitle
  );

  setText(
    "#posterMovie",
    config.movieTitle
  );

  setText(
    "#movieTitle",
    config.movieTitle
  );

  setText(
    ".movie-title",
    config.movieTitle
  );

  setText(
    ".event-title",
    config.movieTitle
  );

  setText(
    ".event-eyebrow",
    config.eventEyebrow
  );

  setText(
    "#eventDate",
    formatDate(config.eventDate)
  );

  setText(
    ".event-date",
    formatDate(config.eventDate)
  );

  setText(
    "#eventTime",
    config.eventTime
  );

  setText(
    ".event-time",
    config.eventTime
  );

  setText(
    "#eventVenue",
    config.eventVenue
  );

  setText(
    ".event-venue",
    config.eventVenue
  );

  setText(
    "#eventDescription",
    config.eventDescription
  );

  setText(
    ".event-description",
    config.eventDescription
  );


  /* HERO */

  setText(
    ".hero-kicker",
    config.heroKicker
  );

  setText(
    ".hero-title",
    config.heroTitle
  );

  setText(
    ".hero-subtitle",
    config.heroSubtitle
  );

  setText(
    ".hero-date",
    config.heroDate ||
    formatUpperDate(
      config.eventDate
    )
  );

  setText(
    ".hero-venue",
    config.heroVenue ||
    config.eventVenue
  );


  /* MARQUEE */

  document
    .querySelectorAll(
      ".marquee-text"
    )
    .forEach(
      element => {

        element.textContent =
          config.marqueeText;

      }
    );


  /* ABOUT */

  setText(
    ".about-title",
    config.aboutTitle
  );

  setText(
    ".about-text",
    config.aboutText
  );

  setText(
    ".about-signature",
    config.aboutSignature
  );


  /* CTA */

  setText(
    ".cta-kicker",
    config.ctaKicker
  );

  setText(
    ".cta-title",
    config.ctaTitle
  );


  /* FOOTER */

  setText(
    ".footer-text",
    config.footerText
  );

  setText(
    ".footer-social",
    config.footerSocial
  );


  /* PRICE */

  document
    .querySelectorAll(
      ".ticket-price"
    )
    .forEach(
      element => {

        element.textContent =
          formatPrice(
            config.ticketPrice
          );

      }
    );


  /* AVAILABILITY */

  setText(
    "#ticketsLeft",
    availableSeats
  );

  setText(
    ".available-seats",
    availableSeats
  );

  setText(
    ".capacity",
    config.ticketCapacity
  );


  /* COLORS */

  document.documentElement.style
    .setProperty(
      "--accent",
      config.accentColor
    );

  document.documentElement.style
    .setProperty(
      "--gold",
      config.accentColor
    );

  document.documentElement.style
    .setProperty(
      "--background",
      config.backgroundColor
    );

  document.documentElement.style
    .setProperty(
      "--bg",
      config.backgroundColor
    );


  /* HERO BACKGROUND */

  if (
    activeEvent &&
    activeEvent.hero_background
  ) {

    document
      .querySelectorAll(
        ".hero"
      )
      .forEach(
        hero => {

          hero.style.backgroundImage =
            `linear-gradient(
              90deg,
              rgba(0,0,0,.85),
              rgba(0,0,0,.35),
              rgba(0,0,0,.15)
            ),
            linear-gradient(
              0deg,
              rgba(0,0,0,.9),
              transparent 60%
            ),
            url("${activeEvent.hero_background}")`;

          hero.style.backgroundSize =
            "cover";

          hero.style.backgroundPosition =
            "center";

        }
      );

  }


  setupQuantityOptions();

}


/* ============================================================
   POSTER SETUP
   ============================================================ */

function setupPoster() {

  /* Normal poster */

  const posterImages =
    document.querySelectorAll(
      "#posterImage, .poster-image, [data-poster]"
    );


  posterImages.forEach(
    image => {

      image.src =
        POSTER_URL;

      image.style.display =
        "block";

      image.alt =
        `${config.movieTitle} poster`;


      image.onerror =
        () => {

          console.warn(
            "Poster could not be loaded:",
            POSTER_URL
          );

        };

    }
  );


  /* Background poster elements */

  const backgroundElements =
    document.querySelectorAll(
      "[data-poster-background]"
    );


  backgroundElements.forEach(
    element => {

      element.style.backgroundImage =
        `url("${POSTER_URL}")`;

      element.style.backgroundSize =
        "cover";

      element.style.backgroundPosition =
        "center";

    }
  );


  /* Hero poster background */

  document
    .querySelectorAll(
      ".hero"
    )
    .forEach(
      hero => {

        if (
          !activeEvent ||
          !activeEvent.hero_background
        ) {

          hero.style.backgroundImage =
            `linear-gradient(
              90deg,
              rgba(0,0,0,.85),
              rgba(0,0,0,.35),
              rgba(0,0,0,.15)
            ),
            linear-gradient(
              0deg,
              rgba(0,0,0,.9),
              transparent 60%
            ),
            url("${POSTER_URL}")`;

          hero.style.backgroundSize =
            "cover";

          hero.style.backgroundPosition =
            "center";

        }

      }
    );

}


/* ============================================================
   AVAILABILITY
   ============================================================ */

async function refreshAvailability() {

  let sold = 0;


  try {

    if (activeEvent) {

      const rows =
        await supabaseFetch(
          "/rest/v1/bookings" +
          "?select=quantity" +
          "&event_id=eq." +
          encodeURIComponent(
            activeEvent.id
          ) +
          "&status=eq.confirmed"
        );


      if (
        Array.isArray(rows)
      ) {

        sold =
          rows.reduce(
            (
              total,
              row
            ) => {

              return (
                total +
                Number(
                  row.quantity || 0
                )
              );

            },
            0
          );

      }

    }

  }

  catch (error) {

    console.warn(
      "Availability fallback:",
      error
    );

  }


  availableSeats =
    Math.max(
      0,
      Number(
        config.ticketCapacity
      ) - sold
    );


  updateAvailabilityUI();

  setupQuantityOptions();

}


/* ============================================================
   UPDATE AVAILABILITY UI
   ============================================================ */

function updateAvailabilityUI() {

  setText(
    "#ticketsLeft",
    availableSeats
  );

  setText(
    ".available-seats",
    availableSeats
  );

  setText(
    ".capacity",
    config.ticketCapacity
  );


  document
    .querySelectorAll(
      ".availability"
    )
    .forEach(
      element => {

        if (
          availableSeats <= 0
        ) {

          element.textContent =
            "SOLD OUT";

        }

        else {

          element.textContent =
            `${availableSeats} SEATS AVAILABLE`;

        }

      }
    );


  const percentage =
    config.ticketCapacity > 0
      ? Math.min(
          100,
          (
            (
              config.ticketCapacity -
              availableSeats
            ) /
            config.ticketCapacity
          ) * 100
        )
      : 0;


  const bar =
    $("#barFill");


  if (bar) {

    bar.style.width =
      `${percentage}%`;

  }


  const stockFill =
    $("#stockFill");


  if (stockFill) {

    stockFill.style.width =
      `${percentage}%`;

  }


  const adminRemaining =
    $("#adminRemaining");


  if (adminRemaining) {

    adminRemaining.textContent =
      availableSeats;

  }

}


/* ============================================================
   QUANTITY OPTIONS
   ============================================================ */

function setupQuantityOptions() {

  const quantity =
    $("#quantity") ||
    $("#bookingQty");


  if (!quantity) {

    return;

  }


  const currentValue =
    Number(
      quantity.value || 1
    );


  quantity.innerHTML =
    "";


  const max =
    Math.min(
      Number(
        config.maxPerBooking || 2
      ),
      Math.max(
        availableSeats,
        0
      )
    );


  if (max <= 0) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      "0";

    option.textContent =
      "Sold Out";

    quantity.appendChild(
      option
    );

    return;

  }


  for (
    let i = 1;
    i <= max;
    i++
  ) {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      String(i);


    option.textContent =
      `${i} ${
        i === 1
          ? "ticket"
          : "tickets"
      }`;


    if (
      i === currentValue
    ) {

      option.selected =
        true;

    }


    quantity.appendChild(
      option
    );

  }

}


/* ============================================================
   BOOKING MODAL
   ============================================================ */

function openBooking() {

  if (
    availableSeats <= 0
  ) {

    alert(
      "This screening is currently sold out."
    );

    return;

  }


  const modal =
    $("#bookingModal");


  if (!modal) {

    console.warn(
      "bookingModal not found."
    );

    return;

  }


  modal.classList.add(
    "open"
  );

  modal.classList.add(
    "show"
  );

  modal.style.display =
    "flex";

  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-open"
  );


  setupQuantityOptions();

}


function closeBooking() {

  const modal =
    $("#bookingModal");


  if (!modal) {

    return;

  }


  modal.classList.remove(
    "open"
  );

  modal.classList.remove(
    "show"
  );

  modal.style.display =
    "";

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-open"
  );

}


/* ============================================================
   TICKET MODAL
   ============================================================ */

function closeTicket() {

  const modal =
    $("#ticketModal");


  if (!modal) {

    return;

  }


  modal.classList.remove(
    "open"
  );

  modal.classList.remove(
    "show"
  );

}


/* ============================================================
   WAITLIST MODAL
   ============================================================ */

function openWaitlist() {

  const modal =
    $("#waitlistModal");


  if (!modal) {

    return;

  }


  modal.classList.add(
    "open"
  );

  modal.classList.add(
    "show"
  );

  modal.style.display =
    "flex";

}


/* ============================================================
   CLOSE ALL MODALS
   ============================================================ */

function closeModals() {

  document
    .querySelectorAll(
      ".modal"
    )
    .forEach(
      modal => {

        modal.classList.remove(
          "open"
        );

        modal.classList.remove(
          "show"
        );

      }
    );


  document.body.classList.remove(
    "modal-open"
  );

}


/* ============================================================
   MAKE FUNCTIONS AVAILABLE TO HTML
   ============================================================ */

window.openBooking =
  openBooking;

window.closeBooking =
  closeBooking;

window.closeTicket =
  closeTicket;

window.closeModals =
  closeModals;

window.openWaitlist =
  openWaitlist;


/* ============================================================
   CREATE BOOKING CODE
   ============================================================ */

function createBookingCode() {

  const timePart =
    Date.now()
      .toString(36)
      .slice(-6)
      .toUpperCase();


  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();


  return `TFC-${timePart}-${randomPart}`;

}


/* ============================================================
   CREATE BOOKING
   ============================================================ */

async function createBooking(
  customer
) {

  if (!activeEvent) {

    throw new Error(
      "No active event."
    );

  }


  const bookingCode =
    createBookingCode();


  const payload = {

    event_id:
      activeEvent.id,

    booking_code:
      bookingCode,

    customer_name:
      customer.name,

    customer_phone:
      customer.phone,

    customer_email:
      customer.email,

    quantity:
      customer.quantity,

    status:
      "pending"

  };


  const result =
    await supabaseFetch(
      "/rest/v1/bookings",
      {
        method: "POST",

        headers: {
          Prefer:
            "return=representation"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );


  return {
    booking:
      result &&
      result[0]
        ? result[0]
        : payload,

    bookingCode
  };

}


/* ============================================================
   SHOW BOOKING SUCCESS
   ============================================================ */

function showBookingSuccess(
  booking
) {

  const form =
    $("#bookingForm");


  if (form) {

    form.style.display =
      "none";

  }


  const modal =
    $("#bookingModal");


  if (!modal) {

    alert(
      `Booking submitted successfully!\n\nBooking Code: ${booking.bookingCode}`
    );

    return;

  }


  let success =
    modal.querySelector(
      ".booking-success"
    );


  if (!success) {

    success =
      document.createElement(
        "div"
      );

    success.className =
      "booking-success";

    modal
      .querySelector(
        ".modal-content"
      )
      ?.appendChild(
        success
      );

  }


  success.style.display =
    "block";


  success.innerHTML = `

    <div
      style="
        text-align:center;
        padding:30px 10px;
      "
    >

      <p
        style="
          letter-spacing:3px;
          font-size:12px;
        "
      >
        BOOKING SUBMITTED
      </p>


      <h2>
        YOU'RE ON THE LIST.
      </h2>


      <p>
        Your booking request for
        <strong>
          ${escapeHTML(
            config.movieTitle
          )}
        </strong>
        has been received.
      </p>


      <div
        style="
          margin:25px 0;
          padding:20px;
          border:1px solid rgba(255,255,255,.15);
        "
      >

        <small>
          BOOKING CODE
        </small>

        <br>

        <strong
          style="
            font-size:24px;
            letter-spacing:2px;
          "
        >
          ${escapeHTML(
            booking.bookingCode
          )}
        </strong>

      </div>


      <p>
        <strong>DATE</strong><br>
        ${escapeHTML(
          formatDate(
            config.eventDate
          )
        )}
      </p>


      <p>
        <strong>TIME</strong><br>
        ${escapeHTML(
          config.eventTime
        )}
      </p>


      <p>
        <strong>VENUE</strong><br>
        ${escapeHTML(
          config.eventVenue
        )}
      </p>


      <p>
        <strong>TICKETS</strong><br>
        ${booking.quantity}
      </p>


      <p>
        <strong>PRICE</strong><br>
        ${formatPrice(
          config.ticketPrice
        )}
      </p>


      <p
        style="
          opacity:.7;
          margin-top:25px;
        "
      >
        Please keep your booking code.
        Your booking confirmation will be
        provided once the booking is confirmed.
      </p>


      <button
        type="button"
        onclick="closeBooking()"
        class="close-success"
      >
        CLOSE
      </button>

    </div>

  `;

}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* ============================================================
   BOOKING FORM
   ============================================================ */

function setupBookingForm() {

  const form =
    $("#bookingForm");


  if (!form) {

    console.warn(
      "bookingForm not found."
    );

    return;

  }


  form.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const nameInput =
        form.querySelector(
          '[name="name"], [name="customer_name"]'
        );


      const phoneInput =
        form.querySelector(
          '[name="phone"], [name="customer_phone"]'
        );


      const emailInput =
        form.querySelector(
          '[name="email"], [name="customer_email"]'
        );


      const quantityInput =
        form.querySelector(
          '[name="quantity"]'
        ) ||
        $("#quantity") ||
        $("#bookingQty");


      const name =
        nameInput
          ? nameInput.value.trim()
          : "";


      const phone =
        phoneInput
          ? phoneInput.value.trim()
          : "";


      const email =
        emailInput
          ? emailInput.value.trim()
          : "";


      const quantity =
        Number(
          quantityInput
            ? quantityInput.value
            : 1
        );


      /* VALIDATION */

      if (!name) {

        alert(
          "Please enter your name."
        );

        return;

      }


      if (!phone) {

        alert(
          "Please enter your phone number."
        );

        return;

      }


      if (!activeEvent) {

        alert(
          "The screening is temporarily unavailable. Please try again."
        );

        return;

      }


      if (
        quantity < 1
      ) {

        alert(
          "Please select at least 1 ticket."
        );

        return;

      }


      if (
        quantity >
        Number(
          config.maxPerBooking
        )
      ) {

        alert(
          `Maximum ${config.maxPerBooking} tickets per booking.`
        );

        return;

      }


      if (
        quantity >
        availableSeats
      ) {

        alert(
          `Only ${availableSeats} seat${
            availableSeats === 1
              ? ""
              : "s"
          } remaining.`
        );


        await refreshAvailability();

        return;

      }


      /* BUTTON */

      const button =
        form.querySelector(
          'button[type="submit"], input[type="submit"]'
        );


      const originalText =
        button
          ? button.textContent
          : "";


      if (button) {

        button.disabled =
          true;

        button.textContent =
          "BOOKING...";

      }


      try {

        const result =
          await createBooking(
            {
              name,
              phone,
              email,
              quantity
            }
          );


        showBookingSuccess(
          result
        );


        await refreshAvailability();

      }

      catch (error) {

        console.error(
          "Booking error:",
          error
        );


        alert(
          "We couldn't complete your booking right now. Please try again."
        );

      }

      finally {

        if (button) {

          button.disabled =
            false;

          button.textContent =
            originalText ||
            "CONFIRM BOOKING";

        }

      }

    }
  );

}


/* ============================================================
   BUTTON INTERACTIONS
   ============================================================ */

function setupInteractions() {

  /* BOOK BUTTONS */

  document
    .querySelectorAll(
      "[data-booking], .book-now, .booking-btn"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function(event) {

            event.preventDefault();

            openBooking();

          }
        );

      }
    );


  /* CLOSE MODAL BUTTONS */

  document
    .querySelectorAll(
      "[data-close-booking], .modal-close, .close-modal"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function(event) {

            event.preventDefault();

            closeBooking();

          }
        );

      }
    );


  /* CLICK OUTSIDE MODAL */

  document
    .querySelectorAll(
      ".modal"
    )
    .forEach(
      modal => {

        modal.addEventListener(
          "click",
          function(event) {

            if (
              event.target === modal
            ) {

              closeBooking();

            }

          }
        );

      }
    );


  /* ESC KEY */

  document.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key === "Escape"
      ) {

        closeModals();

      }

    }
  );

}


/* ============================================================
   LOCAL STORAGE FALLBACK
   ============================================================ */

function loadLocalConfig() {

  try {

    const saved =
      localStorage.getItem(
        "tfc_local_sold_v5"
      );


    if (!saved) {

      return;

    }

  }

  catch (error) {

    console.warn(
      "Local storage unavailable.",
      error
    );

  }

}


/* ============================================================
   AUTO REFRESH AVAILABILITY
   ============================================================ */

function startAvailabilityRefresh() {

  setInterval(
    function() {

      refreshAvailability();

    },
    30000
  );

}


/* ============================================================
   INITIALIZE APP
   ============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    console.log(
      "The Filmmaker Club app starting..."
    );


    /* Load event */

    await loadEvent();


    /* Setup poster */

    setupPoster();


    /* Setup booking */

    setupBookingForm();


    /* Setup buttons */

    setupInteractions();


    /* Availability */

    await refreshAvailability();


    /* Automatic refresh */

    startAvailabilityRefresh();


    console.log(
      "The Filmmaker Club app ready."
    );

  }
);
