import HeaderOne from '@/components/layout/header/header';
import React from 'react';
import ContactArea from './contact-area';
import FooterThree from '@/components/layout/footer/footer';

const Contact = () => {
    return (
        <>
            <HeaderOne />
            <main>
                <ContactArea />
            </main>
            <FooterThree />
        </>
    );
};

export default Contact;
