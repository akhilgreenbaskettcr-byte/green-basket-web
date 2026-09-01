import React from "react";

export function JsonLd() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "@id": "https://greenbaskettcr.com/#store",
    "name": "Green Basket TCR",
    "alternateName": ["Green Basket Thrissur", "GreenBasket TCR", "Green Basket Kerala"],
    "description":
      "Order fresh cold-cut vegetables, stone-ground curry powders, masala powders, and pure cold-pressed coconut oils in Thrissur, Kerala. Next-day doorstep delivery.",
    "url": "https://greenbaskettcr.com",
    "logo": "https://greenbaskettcr.com/images/logo/Green-basket-logo.png",
    "image": "https://greenbaskettcr.com/images/delivery-banner.png",
    "telephone": "+91 90481 78886",
    "email": "info@greenbaskettcr.com",
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash on Delivery, UPI, Razorpay, Credit Card, Debit Card, Net Banking",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Near Ayyanthole Ground",
      "addressLocality": "Thrissur",
      "addressRegion": "Kerala",
      "postalCode": "680003",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 10.5276,
      "longitude": 76.2144
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "07:00",
        "closes": "21:00"
      }
    ],
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Thrissur" },
      { "@type": "PostalCode", "postalCode": "680003" },
      { "@type": "PostalCode", "postalCode": "680001" },
      { "@type": "PostalCode", "postalCode": "680002" },
      { "@type": "PostalCode", "postalCode": "680004" },
      { "@type": "AdministrativeArea", "name": "Ayyanthole" },
      { "@type": "AdministrativeArea", "name": "Poonkunnam" },
      { "@type": "AdministrativeArea", "name": "Ollur" },
      { "@type": "AdministrativeArea", "name": "Kuriachira" },
      { "@type": "AdministrativeArea", "name": "West Fort" },
      { "@type": "AdministrativeArea", "name": "Kakkanad" },
      { "@type": "AdministrativeArea", "name": "Kerala" },
      { "@type": "Country", "name": "India" }
    ],
    "sameAs": [
      "https://www.facebook.com/share/1D6LKpc5Rx/",
      "https://www.instagram.com/greenbaskettcr?igsi=MWR2aGZja3Z0dXB6OA=="
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Green Basket Fresh Produce & Kerala Essentials",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Fresh Cut Vegetables",
          "description": "Hygienically washed, cut, and vacuum-packed ready-to-cook vegetables in Thrissur."
        },
        {
          "@type": "OfferCatalog",
          "name": "Traditional Curry Powders",
          "description": "Authentic stone-ground Kerala sambar, rasam, meat, and chicken masala powders."
        },
        {
          "@type": "OfferCatalog",
          "name": "Cold Pressed Kerala Oils",
          "description": "100% pure cold-pressed coconut oil, sesame oil, and mustard oil."
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://greenbaskettcr.com/#website",
    "url": "https://greenbaskettcr.com",
    "name": "Green Basket TCR",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://greenbaskettcr.com/categories?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where does Green Basket TCR deliver in Thrissur, Kerala?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Green Basket TCR delivers across Thrissur including Ayyanthole (PIN 680003), Round North, West Fort, Poonkunnam, Ollur, Kuriachira, Viyyoor, and surrounding areas with Next-Day fresh delivery."
        }
      },
      {
        "@type": "Question",
        "name": "What is the order cutoff time for next-day delivery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Orders placed before 1:00 PM are harvested, hygienically cut, freshly packed, and delivered to your doorstep the very next day morning."
        }
      },
      {
        "@type": "Question",
        "name": "Are the cut vegetables hygienically packed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, 100%. All Green Basket vegetables are sourced directly from Kerala farms, washed with ozonized food-grade water, precision cut, and packed in food-grade sealed pouches."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support 256-bit SSL encrypted online payment via Razorpay (UPI - Google Pay, PhonePe, Paytm, Credit/Debit Cards, Net Banking) as well as Cash on Delivery (COD)."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
