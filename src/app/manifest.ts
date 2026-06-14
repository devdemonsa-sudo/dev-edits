import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#050816",
    categories: ["business", "finance", "productivity", "tools"],
    description:
      "RepasseCheck organiza a conciliação de recebimentos para e-commerce com upload CSV, integrações e relatórios automáticos.",
    display: "standalone",
    icons: [
      { sizes: "192x192", src: "/icons/icon-192.png", type: "image/png" },
      { purpose: "maskable", sizes: "192x192", src: "/icons/maskable-192.png", type: "image/png" },
      { sizes: "512x512", src: "/icons/icon-512.png", type: "image/png" },
      { purpose: "maskable", sizes: "512x512", src: "/icons/maskable-512.png", type: "image/png" }
    ],
    id: "/",
    lang: "pt-BR",
    name: "RepasseCheck",
    orientation: "portrait-primary",
    scope: "/",
    screenshots: [
      {
        form_factor: "wide",
        label: "RepasseCheck dashboard",
        sizes: "1280x720",
        src: "/screenshots/dashboard-wide.svg",
        type: "image/svg+xml"
      },
      {
        form_factor: "narrow",
        label: "RepasseCheck mobile",
        sizes: "390x844",
        src: "/screenshots/dashboard-mobile.svg",
        type: "image/svg+xml"
      }
    ],
    short_name: "RepasseCheck",
    start_url: "/dashboard",
    theme_color: "#050816"
  };
}
