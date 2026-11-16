import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { LoginPage as Login } from '@/features/auth/screens';

const LoginPage = () => {
    return (
        <Wrapper>
            <SEO pageTitle={"Sign In"} />
            <Login />
        </Wrapper>
    );
};

export default LoginPage;
