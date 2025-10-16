// components/MonatagAd.js
import { useEffect } from 'react';

export default function MonatagAd() {
  useEffect(() => {
    // Load Monatag script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(s){
        s.dataset.zone='10038316',
        s.src='https://al5sm.com/tag.min.js'
      })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
    `;
    document.head.appendChild(script);
    
    return () => {
      // Cleanup if needed
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="monatag-ad-container">
      {/* Ad will be injected here by Monatag */}
    </div>
  );
}