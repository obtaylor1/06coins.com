import { useEffect } from "react";
import { getAbsoluteUrl, SEO_CONFIG } from "@/../../shared/seo-config";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object[];
  keywords?: string;
}

export function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage,
  structuredData = [],
  keywords 
}: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SEO_CONFIG.siteName}`;
    const absoluteCanonical = canonical || (typeof window !== "undefined" ? window.location.href : "");
    const absoluteOgImage = ogImage ? getAbsoluteUrl(ogImage) : getAbsoluteUrl(SEO_CONFIG.defaultImage);
    
    document.title = fullTitle;
    
    updateMetaTag("name", "description", description);
    if (keywords) {
      updateMetaTag("name", "keywords", keywords);
    }
    
    updateMetaTag("property", "og:title", fullTitle);
    updateMetaTag("property", "og:description", description);
    updateMetaTag("property", "og:type", "website");
    updateMetaTag("property", "og:url", absoluteCanonical);
    updateMetaTag("property", "og:image", absoluteOgImage);
    updateMetaTag("property", "og:site_name", SEO_CONFIG.siteName);
    
    updateMetaTag("property", "twitter:card", "summary_large_image");
    updateMetaTag("property", "twitter:title", fullTitle);
    updateMetaTag("property", "twitter:description", description);
    updateMetaTag("property", "twitter:image", absoluteOgImage);
    
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (absoluteCanonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", absoluteCanonical);
    } else if (canonicalLink) {
      canonicalLink.remove();
    }
    
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.hasAttribute('data-seo-component')) {
        script.remove();
      }
    });
    
    structuredData.forEach((data) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute('data-seo-component', 'true');
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }, [title, description, canonical, ogImage, structuredData, keywords]);

  return null;
}

function updateMetaTag(attribute: string, key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}
