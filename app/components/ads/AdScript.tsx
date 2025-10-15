// components/AdScript.jsx
import Script from 'next/script';

export default function AdScript() {
  return (
    <Script
      id="in-page-push-ad"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(s){
            s.dataset.zone='10038306',
            s.src='https://forfrogadiertor.com/tag.min.js'
          })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
        `
      }}
    />
  );
}