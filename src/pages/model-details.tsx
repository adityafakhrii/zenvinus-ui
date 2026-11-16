import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { PublicAssetDetails } from '@/features/catalog/screens';

/** Public model detail. Signed-in users reach the dashboard version at /dashboard/model-details. */
const ModelDetailsPage = () => (
  <Wrapper>
    <SEO pageTitle={'Model Details'} />
    <PublicAssetDetails res="Model" />
  </Wrapper>
);

export default ModelDetailsPage;
