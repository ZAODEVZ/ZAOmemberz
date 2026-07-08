import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The self-service editor and API are not useful to crawlers.
      disallow: ["/me", "/profile/edit", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
