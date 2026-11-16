import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { BlogDetails } from "@/features/blog/screens";

const BlogDetailsPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle={"Blog Details"} />
      <BlogDetails kind="blog" />
    </Wrapper>
  );
};

export default BlogDetailsPage;
