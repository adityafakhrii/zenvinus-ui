import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { Contact } from '@/features/contact/screens';

const ContactPage = () => {
    return (
        <Wrapper>
            <SEO pageTitle={"Contact"} />
            <Contact />
        </Wrapper>
    );
};

export default ContactPage;