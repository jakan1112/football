// components/Ads/ResponsiveAd.tsx
'use client';

import { useEffect, useState } from 'react';

interface ResponsiveAdProps {
  network: 'propeller' | 'monatag';
  adUnit: string;
  sizes: {
    mobile: [number, number];
    tablet: [number, number];
    desktop: [number, number];
  };
}

export default function ResponsiveAd({ network, adUnit, sizes }: ResponsiveAdProps) {
  const [adSize, setAdSize] = useState<[number, number]>([300, 250]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setAdSize(sizes.mobile);
      } else if (width < 1024) {
        setAdSize(sizes.tablet);
      } else {
        setAdSize(sizes.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sizes]);

  useEffect(() => {
    if (network === 'propeller') {
      const script = document.createElement('script');
      script.innerHTML = `
        var _propeller = _propeller || [];
        _propeller.push(['partner', 'YOUR_PARTNER_ID']);
        _propeller.push(['display', '${adUnit}']);
        _propeller.push(['size', [${adSize.join(',')}]]);
      `;
      document.head.appendChild(script);

      const adScript = document.createElement('script');
      adScript.src = '//up.propellerads.com/??YOUR_SCRIPT_CODE';
      adScript.async = true;
      document.head.appendChild(adScript);
    }
  }, [network, adUnit, adSize]);

  return (
    <div className="w-full flex justify-center my-6">
      <div 
        id={`ad-${adUnit}`}
        style={{ 
          width: `${adSize[0]}px`, 
          height: `${adSize[1]}px`,
          minHeight: `${adSize[1]}px`
        }}
        className="bg-gray-100 border flex items-center justify-center"
      >
        <span className="text-gray-500 text-sm">
          {adSize[0]}x{adSize[1]} Ad
        </span>
      </div>
    </div>
  );
}