/* ==========================================================
   EDIT THIS FILE TO CUSTOMIZE YOUR ENTIRE WEBSITE.
   Replace the sample projects with your real projects.
   status: "live" | "development" | "upcoming"
   featured: true puts a project in the homepage spotlight.
   url: Add the full website URL (https://...) when available.
   releaseDate: Optional date in YYYY-MM-DD format. Leave blank if unknown.
   progress: Number from 0 to 100 (shown for development projects).
   color: Any CSS color, e.g. "#8d72ff".
   ========================================================== */
window.HUB_CONFIG = {
  siteName: "PROJECT//HUB",
  creator: "Your Name",
  heroStatus: "CREATING SOMETHING NEW",
  heroDescription: "One place for everything I'm building. Explore websites you can use right now, peek at what's in development, and see what's coming next.",
  about: "I'm an independent creator turning random ideas into real things on the internet. This is my home base—where you can explore my latest work and see what I'm cooking up next.",
  socials: [
    { label: "GitHub", url: "https://github.com/" },
    { label: "Contact", url: "mailto:hello@example.com" }
  ]
};

window.HUB_PROJECTS = [
  {
    id: "neon-requiem",
    title: "Neon Requiem: 2099",
    category: "Browser RPG",
    status: "development",
    description: "An atmospheric, futuristic browser RPG with an explorable city, stories, factions and cybernetic upgrades.",
    longDescription: "A futuristic open-world RPG experiment with character customization, city exploration, interactive stories, and layered progression systems.",
    tags: ["RPG", "Cyberpunk", "JavaScript"],
    color: "#b18aff", icon: "◈", progress: 55, featured: true,
    url: "", releaseDate: ""
  },
  {
    id: "phantom-arcade",
    title: "Phantom Arcade",
    category: "Mini-game Collection",
    status: "upcoming",
    description: "A glowing digital arcade packed with original bite-size games, secrets, and unlockable rewards.",
    longDescription: "An online arcade concept featuring multiple mini-games, challenges, personal scores, secret modes and retro-futuristic visuals.",
    tags: ["Games", "Arcade", "Fun"],
    color: "#fa77c4", icon: "✳", progress: 0, featured: false,
    url: "", releaseDate: ""
  },
  {
    id: "playlist-portal",
    title: "Playlist Portal",
    category: "Music Utility",
    status: "upcoming",
    description: "A simple place to move music playlists between streaming services without rebuilding them by hand.",
    longDescription: "A planned cross-platform playlist migration tool, designed around fast playlist matching and clean account connections.",
    tags: ["Music", "Tool", "Playlists"],
    color: "#5cdbd2", icon: "♫", progress: 0, featured: false,
    url: "", releaseDate: ""
  },
  {
    id: "project-hub",
    title: "Project Hub",
    category: "Portfolio & Updates",
    status: "live",
    description: "The central home for my released projects, work in progress, and everything coming soon. You're looking at it!",
    longDescription: "The official home base where I share active websites, development updates, and upcoming launches. Built for the web and hosted on GitHub Pages.",
    tags: ["Website", "Portfolio", "GitHub"],
    color: "#8af6bd", icon: "✦", progress: 100, featured: false,
    url: "./", releaseDate: ""
  }
];
