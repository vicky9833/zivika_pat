export default function manifest() {
  return {
    name: "Zivika Labs",
    short_name: "Zivika",
    description: "India's intelligent health OS",
    start_url: "/",
    display: "standalone",
    background_color: "#F0F7F4",
    theme_color: "#0D6E4F",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["health", "medical", "lifestyle"],
    lang: "en-IN",
    dir: "ltr",
  };
}
