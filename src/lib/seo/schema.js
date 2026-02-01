// lib/seo/schema.js

// —————————————————————————————————————————————
// Base type JS
// —————————————————————————————————————————————
export const createJsonLd = (type, data = {}) => ({
  "@context": "https://schema.org",
  "@type": type,
  ...data,
})

// —————————————————————————————————————————————
// ORGANIZATION — Global (layout)
// —————————————————————————————————————————————
export const generateOrganizationJsonLd = () =>
  createJsonLd("Organization", {
    name: "Nom de ton entreprise",
    url: "https://www.exemple.com",
    logo: "https://www.exemple.com/logo.png",
    description: "Description courte de ton entreprise.",
    sameAs: [
      "https://www.facebook.com/tonentreprise",
      "https://www.instagram.com/tonentreprise",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+33 6 00 00 00 00",
        contactType: "customer service",
        email: "contact@exemple.com",
      },
    ],
  })


// —————————————————————————————————————————————
// WEBSITE — Global (layout)
// —————————————————————————————————————————————
export const generateWebsiteJsonLd = () =>
  createJsonLd("WebSite", {
    name: "Nom du site",
    url: "https://www.exemple.com",
  })


// —————————————————————————————————————————————
// WEBPAGE — Pour chaque page
// —————————————————————————————————————————————
export const generateWebPageJsonLd = ({ title, description, url }) =>
  createJsonLd("WebPage", {
    name: title,
    description,
    url,
  })


// —————————————————————————————————————————————
// BREADCRUMB — pages internes
// —————————————————————————————————————————————
export const generateBreadcrumbJsonLd = (items) =>
  createJsonLd("BreadcrumbList", {
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  })


// —————————————————————————————————————————————
// FAQ — pages riches
// —————————————————————————————————————————————
export const generateFaqJsonLd = (faq) =>
  createJsonLd("FAQPage", {
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  })


// —————————————————————————————————————————————
// SERVICE — pages services
// —————————————————————————————————————————————
export const generateServiceJsonLd = ({ name, description, url, providerName }) =>
  createJsonLd("Service", {
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: providerName,
    },
  })


// —————————————————————————————————————————————
// ARTICLE — blog
// —————————————————————————————————————————————
export const generateArticleJsonLd = ({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
}) =>
  createJsonLd("Article", {
    headline: title,
    description,
    url,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author,
    },
  })
