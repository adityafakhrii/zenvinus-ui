import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

/** Custom orders now live at /dashboard/projects?id=REQ-xxxx; this keeps old links working. */
const OrdersRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      router.replace({ pathname: '/dashboard/projects', query: router.query });
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps -- run once when the query is ready

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Loader2 className="h-6 w-6 animate-spin text-teal-ink" strokeWidth={1.75} aria-label="Loading" />
    </div>
  );
};

export default OrdersRedirect;
