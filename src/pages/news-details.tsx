import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { NewsDetails } from "@/features/blog/screens";

const NewsDetailsPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle={"News Details"} />
      <NewsDetails />
    </Wrapper>
  );
};

export default NewsDetailsPage;
