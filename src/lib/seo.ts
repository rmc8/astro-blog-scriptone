import type { SEOProps } from "./types";
import { BASE_URL, SITE_NAME } from "./constants";

export type { SEOProps };

export function generateSEOProps({
  title,
  description,
  url,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  locale = 'ja',
  alternateLocales = []
}: SEOProps) {
  const siteTitle = SITE_NAME;
  const siteName = SITE_NAME;
  const baseUrl = BASE_URL;
  
  const fullTitle = title.includes(siteTitle) ? title : `${title} - ${siteTitle}`;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const ogImage = image || `${baseUrl}/api/og?title=${encodeURIComponent(title)}&locale=${locale}`;
  
  // Canonical URLの正規化（最後のスラッシュを削除、ただしルートパスは除く）
  const canonicalUrl = fullUrl.endsWith('/') && fullUrl !== `${baseUrl}/` 
    ? fullUrl.slice(0, -1) 
    : fullUrl;
  
  return {
    title: fullTitle,
    description,
    canonical: canonicalUrl,
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: fullUrl,
      image: ogImage,
      siteName,
      locale: locale === 'ja' ? 'ja_JP' : locale === 'ko' ? 'ko_KR' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      image: ogImage
    },
    article: type === 'article' ? {
      publishedTime: publishedTime?.toISOString(),
      modifiedTime: modifiedTime?.toISOString(),
      author,
      section,
      tags
    } : undefined,
    alternateLocales
  };
}

export function generateHreflangLinks(alternateLocales: { locale: string; url: string }[]) {
  return alternateLocales.map(({ locale, url }) => ({
    rel: 'alternate',
    hreflang: locale,
    href: url.startsWith('http') ? url : `${BASE_URL}${url}`
  }));
}