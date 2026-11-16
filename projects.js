/* PROJECT//HUB — edit this file to publish your projects.
   Start empty. Each project is a JavaScript object inside HUB_PROJECTS.

   Example (remove the surrounding comment to use):
   {
     id: "my-first-site",
     title: "My First Site",
     category: "Interactive Website",
     status: "live", // live | development | upcoming
     description: "A short description of this website.",
     longDescription: "Optional longer explanation.",
     tags: ["Website", "Interactive"],
     color: "#b18aff",
     icon: "✦",
     progress: 100,
     url: "https://username.github.io/my-first-site/",
     releaseDate: "2026-11-15", // YYYY-MM-DD; used to select newest live release
     thumbnail: "images/my-first-site.png" // screenshot, ideally 1600x900
   }
   Publish a screenshot under images/ and enter its relative path in thumbnail.
   Live projects with the most recent releaseDate are spotlighted automatically.
   No date? The newest live project is the LAST live entry in the array.
*/
window.HUB_CONFIG = {
  siteName: "PROJECT//HUB",
  creator: "Huskyganster",
  heroStatus: "WELCOME TO HUSKYGANSTER'S DIGITAL SPACE",
  heroDescription: "I'm Huskyganster, an independent creator building interactive websites, browser games, digital tools, and experimental projects. Explore what I've released, what I'm developing, and what's coming next.",
  about: "I make interactive websites, browser games, digital tools, and experiments. This is where I share finished releases, works in progress, and what's still on the drawing board.",
  socials: [{ label: "Contact", url: "https://discord.com/users/527464902399623186", mobileApp: true }]
};
window.HUB_PROJECTS = [];
