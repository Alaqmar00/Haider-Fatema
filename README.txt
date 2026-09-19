HAIDER WEDS FATEMA — wedding invitation website
===============================================

FILES
    index.html
    css/styles.css
    js/config.js      <- the only file you need to edit
    js/script.js
    assets/           <- drop wedding-music.mp3 here

TO USE
1. Open js/config.js and paste in the event dates, times, names,
   venue, address, RSVP and contact details from your original site.
   Anything left empty is hidden — nothing is invented.
2. Put your music file in assets/ as wedding-music.mp3
3. Open index.html in a browser to preview.

TO PUT IT ONLINE (free, takes two minutes)
   Netlify Drop  -> drag this whole folder onto https://app.netlify.com/drop
   or GitHub Pages / Vercel / any shared hosting — it is plain static HTML.
   Note: audio and Google Fonts need the site to be served over http(s),
   so test the music on the live link rather than a local file:// preview.

WHAT IS FIXED IN THE HTML (not in config)
   The names, parents, blessing wording, Bismillah, the Arabic line and
   the Special Request are written directly into index.html exactly as
   you supplied them. Edit them there if a spelling ever needs changing.
