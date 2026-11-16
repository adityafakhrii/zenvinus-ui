import HeaderOne from "@/components/layout/header/header";
import React from "react";
import { useRouter } from "next/router";
import { queryString } from "../utils/query";
import PostDetailsPostbox from "./post-details-postbox";
import FooterThree from "@/components/layout/footer/footer";
import type { PostKind } from "../types/post";

export interface BlogDetailsProps {
  kind?: PostKind;
}

const BlogDetails = ({ kind = "blog" }: BlogDetailsProps) => {
  const router = useRouter();
  const slug = router.isReady ? queryString(router.query.slug) : null;
  return (
    <>
      <HeaderOne />
      <main>
        <PostDetailsPostbox kind={kind} slug={slug} />
      </main>
      <FooterThree />
    </>
  );
};

export default BlogDetails;
