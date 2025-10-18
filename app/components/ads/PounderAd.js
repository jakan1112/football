// components/ads/PounderAd.js
"use client";
import { useEffect } from 'react';

export default function PounderAd() {
  // useEffect(() => {
  //   const script = document.createElement('script');
  //   script.innerHTML = `
  //     (function(s){s.dataset.zone='10038316',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
  //   `;
  //   document.head.appendChild(script);
    
  //   return () => {
  //     if (document.head.contains(script)) {
  //       document.head.removeChild(script);
  //     }
  //   };
  // }, []);

  return (
    <div className="pounder-ad" data-zone="YOUR_POUNDER_ZONE_ID">
      {/* Pounder ad will appear here */}
    </div>
  );
}