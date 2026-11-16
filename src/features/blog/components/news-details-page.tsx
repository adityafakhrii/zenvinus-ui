import HeaderOne from "@/components/layout/header/header";
import React from "react";
import { useRouter } from "next/router";
import { queryString } from "../utils/query";
import FooterThree from "@/components/layout/footer/footer";
import PostDetailsPostbox from "./post-details-postbox";

const NewsDetails = () => {
  const router = useRouter();
  // WHY: The article is loaded by slug, so it must come from ?slug= once the router has read the URL
  const slug = router.isReady ? queryString(router.query.slug) : null;
  return (
    <>
      <HeaderOne />
      <main>
        <PostDetailsPostbox kind="news" slug={slug} />
      </main>
      <FooterThree />
    </>
  );
};

export default NewsDetails;
