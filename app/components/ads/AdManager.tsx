// components/Ads/AdManager.tsx
'use client';

import { useEffect } from 'react';

interface AdProps {
  type: 'propeller' | 'monatag';
  placement: string;
}

export default function AdManager({ type, placement }: AdProps) {
  useEffect(() => {
    if (type === 'propeller') {
      // PropellerAds implementation
      const script = document.createElement('script');
      script.innerHTML = `
        var _propeller = _propeller || [];
        _propeller.push(['partner', 'YOUR_PARTNER_ID']);
        _propeller.push(['display', '${placement}']);
        _propeller.push(['domain', 'yourdomain.com']);
      `;
      document.head.appendChild(script);

      const adScript = document.createElement('script');
      adScript.src = '//up.propellerads.com/??YOUR_SCRIPT_CODE';
      adScript.async = true;
      document.head.appendChild(adScript);
    }

    if (type === 'monatag') {
      // Monatag implementation
      const script = document.createElement('script');
      script.innerHTML = `
        var _m3u = _m3u || [];
        _m3u.push(['zone', 'YOUR_ZONE_ID']);
        _m3u.push(['placement', '${placement}']);
      `;
      document.head.appendChild(script);

      const adScript = document.createElement('script');
      adScript.src = '//tags.m3u.com/??YOUR_SCRIPT_CODE';
      adScript.async = true;
      document.head.appendChild(adScript);
    }

    return () => {
      // Cleanup if needed
    };
  }, [type, placement]);

  return (
    <div 
      id={`ad-container-${placement}`}
      className="w-full min-h-[250px] flex items-center justify-center bg-gray-100 border my-4"
    >
      <span className="text-gray-500">Ad loading...</span>
    </div>
  );
}