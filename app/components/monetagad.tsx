'use client'

import Script from "next/script";
import Adjs from "./adjs";
export default function MonetagAd() {
  return (
    <>
      {/* Popunder / OnClick Ad Script */}
      <Script id="monetag-popunder" strategy="afterInteractive">
        {`(function(s,u,b,i,z){
            var o,t,r,y;
            s[i]=s[i]||function(){
              (s[i].q=s[i].q||[]).push(arguments)
            };
            o=u.createElement(b);
            t=u.getElementsByTagName(b)[0];
            o.async=1;
            o.src='Adjs';
            t.parentNode.insertBefore(o,t);
          })(window,document,'script','_monetag');
        `}
      </Script>
    </>
  );
}
