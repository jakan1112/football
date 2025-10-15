// components/Ads/MonatagAds.tsx
'use client';

import Script from 'next/script';

export default function MonatagAds() {
  return (
    <>
      <Script
        id="monatag-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var _m3u = _m3u || [];
            _m3u.push(['zone', 'YOUR_ZONE_ID']);
            _m3u.push(['placement', 'YOUR_PLACEMENT_ID']);
            
            (function() {
              var m3u = document.createElement('script');
              m3u.type = 'text/javascript';
              m3u.async = true;
              m3u.src = '//tags.m3u.com/??YOUR_SCRIPT_CODE';
              var s = document.getElementsByTagName('script')[0];
              s.parentNode.insertBefore(m3u, s);
            })();
          `
        }}
      />
      
      {/* Ad Container */}
      <div 
        id="monatag-ad" 
        className="w-full min-h-[90px] flex items-center justify-center bg-gray-100 border"
      >
        <span className="text-gray-500">Loading ad...</span>
      </div>
    </>
  );
}