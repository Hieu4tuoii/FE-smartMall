import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dang-nhap", "/doi-mat-khau", "/dang-ky"],
    },
    // sitemap: DOMAIN_URL + "sitemap.xml",
  };
}
