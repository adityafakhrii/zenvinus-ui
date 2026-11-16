import React from "react";
import type { GetServerSideProps } from "next";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { fetchPostPage, type PostPage } from "@/features/blog";
import { News } from "@/features/blog/screens";

interface NewsPageProps {
  /** News list; null when the API was down */
  initialData: PostPage | null;
}

const NewsPage = ({ initialData }: NewsPageProps) => {
  return (
    <Wrapper>
      <SEO pageTitle={"News"} />
      <News initialData={initialData} />
    </Wrapper>
  );
};

const first = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value);

export const getServerSideProps: GetServerSideProps<NewsPageProps> = async (ctx) => {
  try {
    const initialData = await fetchPostPage("news", {
      q: first(ctx.query.q),
      category: first(ctx.query.category),
      tag: first(ctx.query.tag),
    });
    return { props: { initialData } };
  } catch {
    return { props: { initialData: null } };
  }
};

export default NewsPage;
