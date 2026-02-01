import Script from 'next/script'

export function AnalyticsScripts({ consent }) {
  return (
    <>
      {consent && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="lazyOnload"
          />
          <Script id="gtag-init" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}
    </>
  )
}
