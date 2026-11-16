import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { ServicePage as Service } from '@/features/services/screens';

const ServicePageRoute = () => {
    return (
        <Wrapper>
            <SEO pageTitle={"Service"}/>
            <Service />
        </Wrapper>
    );
};

export default ServicePageRoute;