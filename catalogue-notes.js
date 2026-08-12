(() => {
  const site = window.AL_ADAMS_SITE;
  if (!site || !Array.isArray(site.artworks)) return;

  const kenny = site.artworks.find(art => art.id === 'AL-01');
  if (kenny) {
    kenny.note = "Started as a broken porcelain figurine recovered from a dumpster. While I was looking at him, the name Kenny Loggins just popped into my head. I knew the name, but had to ask my husband what he actually sang. He said Footloose and Danger Zone, and that settled it. The old Hyperbole and a Half Kenny Loggins bit was rattling around in my head too. Hence the sign: Kenny Loggins in the Danger Zone. He wandered into the danger zone, but don't worry. He's all right. Just a little bit footloose.";
  }
})();
