import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { ServiceDetails } from '@/features/services/screens';

const ServiceDetailsPage = () => {
    return (
        <Wrapper>
            <SEO pageTitle={"Service Details"} />
            <ServiceDetails />
        </Wrapper>
    );
};

export default ServiceDetailsPage;