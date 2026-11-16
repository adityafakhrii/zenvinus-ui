import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { PublicAssetDetails } from '@/features/catalog/screens';

/** Public dataset detail. Signed-in users reach the dashboard version at /dashboard/dataset-details. */
const DatasetDetailsPage = () => (
  <Wrapper>
    <SEO pageTitle={'Dataset Details'} />
    <PublicAssetDetails res="Dataset" />
  </Wrapper>
);

export default DatasetDetailsPage;
