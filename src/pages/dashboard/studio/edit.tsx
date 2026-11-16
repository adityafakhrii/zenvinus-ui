import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { StudioEditor, StudioLayout } from '@/features/studio/screens';

const StudioEditPage = () => (
  <Wrapper>
    <SEO pageTitle={'Edit Dataset'} />
    <StudioLayout>
      <StudioEditor />
    </StudioLayout>
  </Wrapper>
);

export default StudioEditPage;
