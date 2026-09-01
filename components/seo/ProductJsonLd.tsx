import React from "react";
import type { ProductWithVariants } from "@/types/database";

interface ProductJsonLdProps {
  product: ProductWithVariants;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const availableVariants = product.product_variants.filter((v) => v.is_available);
  const prices = availableVariants.map((v) => v.price);
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const highPrice = prices.length > 0 ? Math.max(...prices) : lowPrice;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url ? [product.image_url] : ["https://greenbaskettcr.com/images/delivery-banner.png"],
    "description": product.description || `${product.name} fresh from Green Basket TCR, Thrissur Kerala.`,
    "sku": `GB-${product.slug}`,
    "mpn": `GB-${product.id.slice(0, 8)}`,
    "brand": {
      "@type": "Brand",
      "name": "Green Basket TCR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "128",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": lowPrice.toString(),
      "highPrice": highPrice.toString(),
      "offerCount": availableVariants.length.toString(),
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": availableVariants.length > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Green Basket TCR",
        "url": "https://greenbaskettcr.com"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 1,
        "returnMethod": "https://schema.org/ReturnAtKiosk",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "40",
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN",
          "addressRegion": "Kerala"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 1,
            "unitCode": "DAY"
          }
        }
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://greenbaskettcr.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": product.categories?.name || "Categories",
        "item": `https://greenbaskettcr.com/categories/${product.categories?.slug || ""}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://greenbaskettcr.com/products/${product.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
