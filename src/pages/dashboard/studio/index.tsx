import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { StudioLayout, StudioList } from '@/features/studio/screens';

const StudioPage = () => (
  <Wrapper>
    <SEO pageTitle={'Dataset Studio'} />
    <StudioLayout title="Dataset Studio">
      <StudioList />
    </StudioLayout>
  </Wrapper>
);

export default StudioPage;
