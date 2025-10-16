// components/ads/NativeBannerAd.js
"use client";
import { useEffect } from 'react';

export default function NativeBannerAd() {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
    (function(s){s.dataset.zone='10038314',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
    `;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="native-banner-ad" style={{ width: '100%', minHeight: '100px' }}>
      {/* Native banner will be injected here */}
    </div>
  );
}