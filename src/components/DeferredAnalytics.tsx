"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const DEFER_MS = 3000;

export function DeferredAnalytics() {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setArmed(true), DEFER_MS);
    const onInteract = () => setArmed(true);
    window.addEventListener("scroll", onInteract, { once: true, passive: true });
    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, []);

  if (!armed) return null;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      <Script id="gtm-init" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W82QVGZL');`}
      </Script>

      {gaId ? (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="lazyOnload"
        />
      ) : null}
      {gaId ? (
        <Script id="gtag-init" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');${adsId ? `gtag('config','${adsId}');` : ""}gtag('get','${gaId}','client_id',function(id){if(id){try{localStorage.setItem('unc-ga-client-id',id);}catch(e){}}});`}
        </Script>
      ) : null}

      {/* Meta Pixel: window.fbq + window._fbq.queue are pre-stubbed in
          layout.tsx so calls made before this script loads are buffered,
          not dropped. We skip the snippet's `if(f.fbq)return` self-guard
          and just inject the network script + init + PageView; fbevents.js
          will flush the queue when it loads. */}
      <Script id="fb-pixel" strategy="lazyOnload">
        {`!function(b,e,v){var t=b.createElement(e);t.async=!0;t.src=v;var s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2276705169443313');fbq('track','PageView');`}
      </Script>

      {clarityId ? (
        <Script id="ms-clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      ) : null}
    </>
  );
}
