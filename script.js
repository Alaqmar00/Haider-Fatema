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

  /* ───────────── music (YouTube stream, or local file fallback) ───────────── */
  var muted = false;
  var target = typeof WEDDING.musicVolume === "number" ? WEDDING.musicVolume : 0.55;
  var wantsPlay = false;

  // Always surface the mute/sound control within a few seconds, even if the
  // YouTube embed never initialises (blocked script, offline API, etc.) —
  // that guarantees a manual way to start audio exists no matter what.
  setTimeout(function () { soundBtn.hidden = false; }, 3500);

  function youtubeId(url) {
    if (!has(url)) return null;
    var m = url.match(/[?&]v=([\w-]{11})/) || url.match(/youtu\.be\/([\w-]{11})/) || url.match(/\/embed\/([\w-]{11})/);
    return m ? m[1] : null;
  }
  var ytId = youtubeId(WEDDING.youtubeMusicUrl);

  function fadeTo(setVol, endValue, ms) {
    var t0 = Date.now();
    var start = muted ? 0 : 0;
    var iv = setInterval(function () {
      var k = Math.min((Date.now() - t0) / ms, 1);
      setVol(muted ? 0 : k * endValue);
      if (k === 1) clearInterval(iv);
    }, 60);
  }

  var yt = { player: null, ready: false };

  if (ytId) {
    window.onYouTubeIframeAPIReady = function () {
      yt.player = new YT.Player("ytHost", {
        height: "200", width: "200",
        videoId: ytId,
        playerVars: {
          autoplay: 0, controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, playsinline: 1, rel: 0,
          loop: 1, playlist: ytId
        },
        events: {
          onReady: function () {
            yt.ready = true;
            yt.player.setVolume(0);
            soundBtn.hidden = false;
            if (wantsPlay) {
              yt.player.playVideo();
              fadeTo(function (v) { yt.player.setVolume(Math.round(v * 100)); }, target, 2600);
            }
          },
          onError: function () {
            // embedding blocked for this video — fall back to a local file if one is configured
            yt.player = null;
            if (has(WEDDING.musicSrc)) startNativeAudio();
          }
        }
      });
    };
  }

  function startNativeAudio() {
    if (!has(WEDDING.musicSrc)) return;
    audio.src = WEDDING.musicSrc;
    audio.volume = 0;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* browser blocked it — the mute button still works */ });
    fadeTo(function (v) { audio.volume = v; }, target, 2600);
    soundBtn.hidden = false;
  }

  function startMusic() {
    wantsPlay = true;
    if (ytId) {
      if (yt.ready && yt.player) {
        yt.player.playVideo();
        fadeTo(function (v) { yt.player.setVolume(Math.round(v * 100)); }, target, 2600);
      }
      // if not ready yet, onReady above will start it as soon as the player loads
    } else {
      startNativeAudio();
    }
  }

  soundBtn.addEventListener("click", function () {
    muted = !muted;
    soundBtn.setAttribute("aria-pressed", muted ? "false" : "true");
    soundBtn.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
    wantsPlay = true;

    if (yt.player) {
      try {
        if (muted) {
          yt.player.mute();
        } else {
          yt.player.unMute();
          yt.player.setVolume(Math.round(target * 100));
          if (yt.player.getPlayerState() !== 1) yt.player.playVideo();
        }
      } catch (err) { /* player not fully ready yet — next click will work */ }
    } else {
      audio.muted = muted;
      if (!muted && audio.paused && audio.src) audio.play().catch(function () {});
    }
  });

  /* ───────────── the curtain reveal ───────────── */
  var opened = false;

  function openStage() {
    if (opened) return;
    opened = true;

    // Unlock scrolling and hand touch control to the page the INSTANT the
    // ribbon is tapped — not after the curtains finish animating. That gap
    // was the actual bug: the stage overlay was still catching the first
    // scroll/touch while it waited for the slide to finish.
    stage.style.pointerEvents = "none";
    document.body.classList.remove("is-closed");
    document.body.style.overflow = "";
    document.body.style.position = "";
    window.scrollTo(0, 0);
    observeReveals();

    // Some mobile browsers leave the scroll engine "asleep" right after a
    // position:fixed element is removed — the very first swipe gets
    // silently ignored even though nothing is blocking it anymore. Nudging
    // the scroll position by 1px and back wakes it up reliably.
    requestAnimationFrame(function () {
      window.scrollTo(0, 1);
      requestAnimationFrame(function () { window.scrollTo(0, 0); });
    });

    stage.classList.add("is-opening");
    startMusic();

    invite.hidden = false;
    // let the browser lay the page out before fading it in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { invite.classList.add("is-in"); });
    });

    // purely cosmetic from here — remove the (already-inert) stage from
    // the DOM once its slide animation has actually finished
    var curtainLeft = $("#curtainLeft");
    var settled = false;
    function onSettled(e) {
      if (e && e.propertyName !== "transform") return;
      if (settled) return;
      settled = true;
      curtainLeft.removeEventListener("transitionend", onSettled);
      stage.classList.add("is-gone");
      showScrollHint();
    }
    if (reduced) {
      setTimeout(onSettled, 250);
    } else {
      curtainLeft.addEventListener("transitionend", onSettled);
      setTimeout(onSettled, 2000); // fallback in case transitionend never fires
    }
  }

  ribbon.addEventListener("click", openStage);
  ribbon.addEventListener("touchend", function (e) { e.preventDefault(); openStage(); }, { passive: false });
  stage.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });

  /* ───────────── scroll-down hint ───────────── */
  function showScrollHint() {
    var hint = $("#scrollHint");
    if (!hint || reduced) return;
    hint.hidden = false;

    var hideTimer;
    function hide() {
      clearTimeout(hideTimer);
      window.removeEventListener("scroll", onScroll);
      hint.classList.remove("is-on");
      setTimeout(function () { hint.hidden = true; }, 650);
    }
    function onScroll() { hide(); }

    requestAnimationFrame(function () {
      hint.classList.add("is-on");
      hideTimer = setTimeout(hide, 3000);
      window.addEventListener("scroll", onScroll, { passive: true, once: true });
    });
  }

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
      if (has(e.time))    meta += "<li><b>Time</b><span>" + esc(e.time) + "</span></li>";
      if (has(e.venue))   meta += "<li><b>Venue</b><span>" + esc(e.venue) + "</span></li>";
      if (has(e.address)) meta += "<li><b>Address</b><span>" + esc(e.address) + "</span></li>";

      var cal = has(e.start)
        ? '<button class="btn" type="button" data-cal="' + i + '">Add to calendar</button>'
        : "";

      return '<li class="tl-item">' +
        '<article class="event">' +
          (has(e.day) ? '<span class="event__day">' + esc(e.day) + "</span>" : "") +
          (has(e.date) ? '<span class="event__date">' + esc(e.date) + "</span>" : "") +
          (has(e.session) ? '<span class="event__session">' + esc(e.session) + "</span>" : "") +
          (has(e.name) ? '<h3 class="event__name">' + esc(e.name) + (has(e.note) ? ' <span class="event__note">' + esc(e.note) + "</span>" : "") + "</h3>" : "") +
          '<span class="event__flourish"></span>' +
          (meta ? '<ul class="event__meta">' + meta + "</ul>" : "") +
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

  /* ───────────── back to top ───────────── */
  topBtn.hidden = false;
  window.addEventListener("scroll", function () {
    topBtn.classList.toggle("is-on", window.scrollY > 520);
  }, { passive: true });
  topBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });
})();
