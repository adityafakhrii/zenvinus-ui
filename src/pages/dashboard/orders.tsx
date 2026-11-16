import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Custom orders now live at /dashboard/projects?id=REQ-xxxx; this keeps old links working. */
const OrdersRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      router.replace({ pathname: '/dashboard/projects', query: router.query });
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps -- run once when the query is ready

  return <div className="tflow-loading"><span className="spinner-border"></span></div>;
};

export default OrdersRedirect;
