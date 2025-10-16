// components/ads/InPagePushAd.js
"use client";
import { useEffect } from 'react';

export default function InPagePushAd() {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(s){s.dataset.zone='10038306',s.src='https://forfrogadiertor.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
    `;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="inpage-push-ad">
      {/* InPage Push ad will appear here */}
    </div>
  );
}