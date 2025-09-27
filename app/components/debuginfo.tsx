// components/DebugInfo.tsx (temporary)
'use client';

import { useEffect, useState } from 'react';
import { testKVConnection } from '../lib/data-service';

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkEnv = async () => {
      const isConnected = await testKVConnection();
      setDebugInfo({
        kvUrl: process.env.KV_REST_API_URL ? '✅ Set' : '❌ Missing',
        kvToken: process.env.KV_REST_API_TOKEN ? '✅ Set' : '❌ Missing',
        isConnected,
        environment: process.env.NODE_ENV,
        nodeEnv: process.env.NODE_ENV
      });
    };

    checkEnv();
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 border border-gray-600 p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}