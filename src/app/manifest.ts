import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vault Dashboard",
    short_name: "Vault",
    description: "Dashboard keuangan mobile-first",
    start_url: "/",
    display: "standalone",
    background_color: "#060a10",
    theme_color: "#060a10",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
