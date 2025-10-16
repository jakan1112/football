// components/AdManager.js
"use client";
import { useEffect } from 'react';

export default function AdManager({ adType, zoneId, position = 'default' }) {
  useEffect(() => {
    // Only load if all required props are provided
    if (!adType || !zoneId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(s){
        s.dataset.zone='${zoneId}',
        s.src='https://al5sm.com/tag.min.js'
      })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
    `;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [adType, zoneId]);

  const getAdClass = () => {
    switch(adType) {
      case 'pounder': return 'pounder-ad';
      case 'native-banner': return 'native-banner-ad';
      case 'inpage-push': return 'inpage-push-ad';
      default: return 'monetag-ad';
    }
  };

  return (
    <div className={`${getAdClass()} ad-position-${position}`} data-zone={zoneId}>
      {/* Ad will be injected here */}
    </div>
  );
}