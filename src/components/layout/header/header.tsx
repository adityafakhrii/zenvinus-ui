import Link from 'next/link';
import Image from 'next/image';
import NavMenu from './nav-menu';
import MobileNav from './mobile-nav';
import React, { useEffect, useState } from 'react';
import SearchPopup from './search-popup';
import Logo from "@assets/img/logo/logo.png";
import { LanguageSwitch, useT } from "@/i18n";
import Button from "@/components/ui/button";
import { AccountMenu, useAuth } from "@/features/auth";

// Account menu of a signed-in visitor: back to the dashboard, settings, logout
const ACCOUNT_LINKS = [
   { href: "/dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
   { href: "/dashboard/settings", icon: "fa-solid fa-gear", label: "Account Settings" },
] as const;

const HeaderOne = () => {
   const [searchOpen, setSearchOpen] = useState(false)
   const { t } = useT();
   const { user, isLoading } = useAuth();

   // WHY: The header is position: sticky (index.scss); this only adds a shadow once the page has scrolled
   const [scrolled, setScrolled] = useState(false);
   useEffect(() => {
     const onScroll = () => setScrolled(window.scrollY > 10);
     onScroll();
     window.addEventListener('scroll', onScroll, { passive: true });
     return () => window.removeEventListener('scroll', onScroll);
   }, []);



    return (
        <>
            <header className={`tp-header-area tp-header-height zv-site-header${scrolled ? " is-scrolled" : ""}`}>
               <div id="header-sticky"
               className="tp-header-bottom p-relative">
                  <div className="tp-header-bottom-space p-relative">
                     <div className="container">
                        <div className="row align-items-center">
                           <div className="col col-xl-3">
                           <div className="tp-header-main-left d-flex align-items-center p-relative">
                              <div className="tp-header-logo">
                                    <Link href="/">
                                       <Image src={Logo} alt="theme-pure" />
                                    </Link>
                                 </div>
                              </div>
                              </div>
                           <div className="col-xl d-none d-xl-block">
                              <div className="tp-main-menu-area counter d-flex align-items-center">
                                 <div className="tp-main-menu menu-icon">
                                  <nav id="tp-mobile-menu">
                                       <NavMenu /> 
                                    </nav>
                                 </div>
                              </div>
                           </div>
                           {/* WHY: Sized to its content (search, ID/EN switch, button) so the button never wraps; the menu takes the rest.
                               Below 1200px it sits next to the logo and holds the menu button (MobileNav) instead of the desktop menu. */}
                           <div className="col-auto">
                           <div className="tp-header-main-right d-flex align-items-center justify-content-xl-end">
                              <div className="tp-header-search search-open-btn d-none d-xxl-block">
                                 <button type="button" aria-label={t("Search")} onClick={() => setSearchOpen(true)}><i className="fa-regular fa-magnifying-glass"></i></button>
                              </div>
                                 <LanguageSwitch className="zv-lang-switch-header" />
                                 {user ? (
                                    <div className="zv-header-account d-none d-xl-block">
                                       <AccountMenu name={user.name || user.email} email={user.email} links={ACCOUNT_LINKS} />
                                    </div>
                                 ) : (
                                    // WHY: Hidden (not removed) while the session loads, so a signed-in visitor never sees
                                    // the guest button flash and the layout does not shift
                                    <div className="tp-header-btn d-none d-xl-block pl-40" style={isLoading ? { visibility: "hidden" } : undefined}>
                                       <Button href="/login">{t("Get Started Today")}</Button>
                                    </div>
                                 )}
                                 <MobileNav />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </header>
            <SearchPopup searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
        </>
    );
};

export default HeaderOne;