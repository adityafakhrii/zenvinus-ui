import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { About } from '@/features/about/screens';

const AboutPage = () => {
    return (
        <Wrapper>
            <SEO pageTitle={"About Zenvinus — AI Data, Research & Intelligence Platform"} />
            <About />
        </Wrapper>
    );
};

export default AboutPage;