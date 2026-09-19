/* ══════════════════════════════════════════════════════════════
   EDIT ONLY THIS FILE.

   Every empty string below is a detail I did not have. Copy each
   one across from your original wedding website exactly as it is
   written there. Anything you leave empty is simply not shown —
   nothing is guessed or filled in for you.
   ══════════════════════════════════════════════════════════════ */

const WEDDING = {

  /* ── the wedding date the countdown runs to ──────────────────
     Format: "YYYY-MM-DDTHH:MM:SS+05:30"  (24-hour clock, IST)
     Example shape only — replace with your real first-event date:
     "2027-01-14T19:30:00+05:30"
     Leave as "" and the countdown block hides itself.            */
  countdownTo: "",
  countdownLabel: "",   // e.g. "until the Nikah" — optional


  /* ── the three days ──────────────────────────────────────────
     Fill each event from your existing site. Any field left empty
     is dropped from the card.

     start / end are only used by the "Add to calendar" button.
     Same format as countdownTo. If you leave start empty, the
     calendar button is not shown for that event.                 */
  events: [
    {
      day:     "",   // e.g. "Day One — Friday"
      name:    "",   // event name exactly as on the original site
      date:    "",   // e.g. "14 January 2027"
      time:    "",   // e.g. "7:30 PM onwards"
      venue:   "",
      address: "",
      start:   "",
      end:     ""
    },
    {
      day: "", name: "", date: "", time: "", venue: "", address: "", start: "", end: ""
    },
    {
      day: "", name: "", date: "", time: "", venue: "", address: "", start: "", end: ""
    }
  ],


  /* ── location section ───────────────────────────────────────
     mapEmbedUrl: on Google Maps → Share → Embed a map → copy the
     src="..." value out of the iframe and paste it here.
     mapLinkUrl : the plain Google Maps link for the directions button. */
  location: {
    venue:       "",
    address:     "",
    mapEmbedUrl: "",
    mapLinkUrl:  ""
  },


  /* ── RSVP ────────────────────────────────────────────────────
     note     : any wording from the original site.
     contacts : [{ name: "", phone: "" }] — phone may be a plain
                number or a wa.me link. Empty array shows nothing. */
  rsvp: {
    note:     "",
    contacts: []
  },


  /* ── contact section ─────────────────────────────────────── */
  contact: {
    note:     "",
    contacts: []
  },


  /* ── music ───────────────────────────────────────────────────
     Drop your track into the assets folder with this exact name,
     or change the path to match your file.                       */
  musicSrc: "assets/wedding-music.mp3",
  musicVolume: 0.55
};
