/* ══════════════════════════════════════════════
   Haider weds Fatema — behaviour
   ══════════════════════════════════════════════ */
(function () {
  "use strict";

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var has = function (v) { return typeof v === "string" && v.trim() !== ""; };

  var stage   = $("#stage");
  var ribbon  = $("#ribbon");
  var invite  = $("#invite");
  var audio   = $("#music");
  var soundBtn = $("#soundBtn");
  var topBtn  = $("#topBtn");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───────────── floating dust & gold motes ───────────── */
  function motes(host, count) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var m = document.createElement("span");
      var size = (Math.random() * 3.4 + 1.2).toFixed(1);
      m.className = "mote";
      m.style.width = size + "px";
      m.style.height = size + "px";
      m.style.left = (Math.random() * 100).toFixed(2) + "%";
      m.style.animationDuration = (Math.random() * 14 + 13).toFixed(1) + "s";
      m.style.animationDelay = "-" + (Math.random() * 20).toFixed(1) + "s";
      m.style.setProperty("--drift", (Math.random() * 70 - 35).toFixed(0) + "px");
      m.style.opacity = (Math.random() * 0.5 + 0.35).toFixed(2);
      frag.appendChild(m);
    }
    host.appendChild(frag);
  }
  if (!reduced) motes($("#stageParticles"), 34);

  /* ───────────── music ───────────── */
  var muted = false;
  function startMusic() {
    if (!has(WEDDING.musicSrc)) return;
    audio.src = WEDDING.musicSrc;
    audio.volume = 0;
    var target = typeof WEDDING.musicVolume === "number" ? WEDDING.musicVolume : 0.55;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* browser blocked it — the mute button still works */ });

    var t0 = Date.now();
    var fade = setInterval(function () {
      var k = Math.min((Date.now() - t0) / 2600, 1);
      audio.volume = muted ? 0 : k * target;
      if (k === 1) clearInterval(fade);
    }, 60);

    soundBtn.hidden = false;
  }

  soundBtn.addEventListener("click", function () {
    muted = !muted;
    audio.muted = muted;
    soundBtn.setAttribute("aria-pressed", muted ? "false" : "true");
    soundBtn.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
    if (!muted && audio.paused) audio.play().catch(function () {});
  });

  /* ───────────── the curtain reveal ───────────── */
  var opened = false;
  function openStage() {
    if (opened) return;
    opened = true;

    stage.classList.add("is-opening");
    startMusic();

    invite.hidden = false;
    // let the browser lay the page out before fading it in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { invite.classList.add("is-in"); });
    });

    var wait = reduced ? 300 : 2200;
    setTimeout(function () {
      document.body.classList.remove("is-closed");
      window.scrollTo(0, 0);
      observeReveals();
    }, wait);

    setTimeout(function () { stage.classList.add("is-gone"); }, reduced ? 500 : 3400);
  }

  ribbon.addEventListener("click", openStage);
  ribbon.addEventListener("touchend", function (e) { e.preventDefault(); openStage(); }, { passive: false });
  stage.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });

  /* ───────────── scroll reveals ───────────── */
  function observeReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (n) { n.classList.add("is-seen"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-seen"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(items, function (n) { io.observe(n); });
  }

  /* ───────────── countdown ───────────── */
  (function countdown() {
    var box  = $("#countdown");
    var grid = $("#countdownGrid");
    var note = $("#countdownNote");
    var when = new Date(WEDDING.countdownTo);

    if (!has(WEDDING.countdownTo) || isNaN(when.getTime())) {
      box.closest(".sheet").hidden = true;
      return;
    }
    if (has(WEDDING.countdownLabel)) note.textContent = WEDDING.countdownLabel;

    var units = [["days", "Days"], ["hours", "Hours"], ["mins", "Minutes"], ["secs", "Seconds"]];
    grid.innerHTML = units.map(function (u) {
      return '<div class="unit"><span class="unit__n" data-u="' + u[0] + '">–</span><span class="unit__l">' + u[1] + "</span></div>";
    }).join("");

    function tick() {
      var diff = when - new Date();
      if (diff <= 0) {
        grid.hidden = true;
        note.textContent = "The celebration has begun.";
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      var v = {
        days:  Math.floor(s / 86400),
        hours: Math.floor(s % 86400 / 3600),
        mins:  Math.floor(s % 3600 / 60),
        secs:  s % 60
      };
      Object.keys(v).forEach(function (k) {
        var el = grid.querySelector('[data-u="' + k + '"]');
        if (el) el.textContent = k === "days" ? v[k] : ("0" + v[k]).slice(-2);
      });
    }
    tick();
    var timer = setInterval(tick, 1000);
  })();

  /* ───────────── events + timeline ───────────── */
  (function events() {
    var list = $("#timeline");
    var rows = (WEDDING.events || []).filter(function (e) {
      return has(e.name) || has(e.date) || has(e.time) || has(e.venue);
    });

    if (!rows.length) {
      list.outerHTML = '<p class="pending">Event details will appear here once they are added in js/config.js.</p>';
      return;
    }

    list.innerHTML = rows.map(function (e, i) {
      var meta = "";
      if (has(e.date))    meta += "<li><b>Date</b><span>" + esc(e.date) + "</span></li>";
      if (has(e.time))    meta += "<li><b>Time</b><span>" + esc(e.time) + "</span></li>";
      if (has(e.venue))   meta += "<li><b>Venue</b><span>" + esc(e.venue) + "</span></li>";
      if (has(e.address)) meta += "<li><b>Address</b><span>" + esc(e.address) + "</span></li>";

      var cal = has(e.start)
        ? '<button class="btn" type="button" data-cal="' + i + '">Add to calendar</button>'
        : "";

      return '<li class="tl-item">' +
        '<article class="event">' +
          (has(e.day) ? '<span class="event__day">' + esc(e.day) + "</span>" : "") +
          (has(e.name) ? '<h3 class="event__name">' + esc(e.name) + "</h3>" : "") +
          '<span class="event__flourish"></span>' +
          '<ul class="event__meta">' + meta + "</ul>" +
          cal +
        "</article></li>";
    }).join("");

    list.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-cal]");
      if (btn) addToCalendar(rows[+btn.getAttribute("data-cal")]);
    });
  })();

  function icsStamp(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function addToCalendar(e) {
    var start = icsStamp(e.start);
    if (!start) return;
    var end = icsStamp(e.end) || icsStamp(new Date(new Date(e.start).getTime() + 3 * 3600 * 1000).toISOString());
    var where = [e.venue, e.address].filter(has).join(", ");

    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Haider weds Fatema//EN",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@haider-fatema",
      "DTSTAMP:" + icsStamp(new Date().toISOString()),
      "DTSTART:" + start,
      "DTEND:" + end,
      "SUMMARY:" + (e.name || "Wedding celebration") + " — Haider weds Fatema",
      where ? "LOCATION:" + where : "",
      "END:VEVENT", "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");

    var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = (e.name || "wedding").replace(/[^\w]+/g, "-").toLowerCase() + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* ───────────── location / rsvp / contact ───────────── */
  function lines(parts) {
    return parts.filter(has).map(function (t) { return '<p class="info">' + esc(t) + "</p>"; }).join("");
  }
  function people(arr) {
    if (!arr || !arr.length) return "";
    return arr.filter(function (c) { return has(c.name) || has(c.phone); }).map(function (c) {
      var tel = has(c.phone)
        ? ' — <a href="' + (/^https?:/.test(c.phone) ? esc(c.phone) : "tel:" + esc(c.phone.replace(/\s+/g, ""))) + '">' + esc(c.phone) + "</a>"
        : "";
      return '<p class="info">' + esc(c.name || "") + tel + "</p>";
    }).join("");
  }
  function fill(id, html, fallback) {
    var el = $(id);
    el.innerHTML = html || '<p class="pending">' + fallback + "</p>";
  }

  var L = WEDDING.location || {};
  var locHtml = lines([L.venue, L.address]);
  if (has(L.mapEmbedUrl)) {
    locHtml += '<div class="map-frame"><iframe src="' + esc(L.mapEmbedUrl) +
      '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe></div>';
  }
  if (has(L.mapLinkUrl)) {
    locHtml += '<p class="info"><a class="btn" href="' + esc(L.mapLinkUrl) + '" target="_blank" rel="noopener">Open directions</a></p>';
  }
  fill("#locationBody", locHtml, "Add the venue and map link in js/config.js.");

  var R = WEDDING.rsvp || {};
  fill("#rsvpBody", lines([R.note]) + people(R.contacts), "Add your RSVP wording in js/config.js.");

  var C = WEDDING.contact || {};
  fill("#contactBody", lines([C.note]) + people(C.contacts), "Add contact details in js/config.js.");

  /* ───────────── back to top ───────────── */
  topBtn.hidden = false;
  window.addEventListener("scroll", function () {
    topBtn.classList.toggle("is-on", window.scrollY > 520);
  }, { passive: true });
  topBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });
})();
