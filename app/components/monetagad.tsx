'use client';
import Script from 'next/script';

export default function MonetagPopunder() {
  return (
    <Script id="monetag-popunder" strategy="afterInteractive">
      {`
       <script>(function(s){s.dataset.zone='10038316',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
      `}
    </Script>
  );
}
