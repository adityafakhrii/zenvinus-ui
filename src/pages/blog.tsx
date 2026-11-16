import React from "react";
import type { GetServerSideProps } from "next";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { fetchPostPage, postListParams, type PostPage } from "@/features/blog";
import { Blog } from "@/features/blog/screens";

interface BlogPageProps {
  /** First page of posts; null when the API was down */
  initialData: PostPage | null;
}

const BlogPage = ({ initialData }: BlogPageProps) => {
  return (
    <Wrapper>
      <SEO pageTitle={"Blog"} />
      <Blog kind="blog" initialData={initialData} />
    </Wrapper>
  );
};

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async (ctx) => {
  try {
    // Same params as the client query, so the server-rendered page matches the first client render
    const initialData = await fetchPostPage("blog", postListParams(ctx.query).params);
    return { props: { initialData } };
  } catch {
    // API down — let the client-side query retry.
    return { props: { initialData: null } };
  }
};

export default BlogPage;
