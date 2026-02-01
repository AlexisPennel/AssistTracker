// components/seo/JsonLd.jsx

import Script from "next/script"

export default function JsonLd({ data }) {
    const payload = Array.isArray(data) ? data : [data]

    return (
        <Script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(payload),
            }}
            strategy="afterInteractive"
        />
    )
}
