ASSETS
======

wedding-music.mp3
-----------------
Put your wedding track in this folder and name it exactly:

    wedding-music.mp3

That is the only asset the site needs. The music starts the moment the
ribbon is tapped (mobile browsers block audio before a tap, so this is
deliberate), fades in over ~2.5 seconds, and loops.

If your file has a different name or format (.m4a, .ogg), keep it here
and change this line in js/config.js instead:

    musicSrc: "assets/wedding-music.mp3",

A YouTube or YouTube Music page link will NOT work as an audio source.
It has to be an actual audio file sitting in this folder.

Keep it under ~4 MB if you can, so the page stays quick on mobile data.

Everything else — the curtains, fabric folds, gold trim, embroidery,
ornaments, paper texture and icons — is drawn in CSS and SVG, so there
are no images to supply.
