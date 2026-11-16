import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { StudioExplorer, StudioLayout } from '@/features/studio/screens';

const StudioExplorePage = () => (
  <Wrapper>
    <SEO pageTitle={'Explore Dataset'} />
    <StudioLayout>
      <StudioExplorer />
    </StudioLayout>
  </Wrapper>
);

export default StudioExplorePage;
