import HeaderOne from "@/components/layout/header/header";
import React from "react";
import PostboxArea from "./postbox-area";
import FooterThree from "@/components/layout/footer/footer";
import type { PostKind, PostPage } from "../types/post";

export interface BlogProps {
  kind?: PostKind;
  initialData?: PostPage | null;
}

const Blog = ({ kind = "blog", initialData = undefined }: BlogProps) => {
  return (
    <>
      <HeaderOne />
      <main>
        <PostboxArea base={`/${kind}`} kind={kind} initialData={initialData} />
      </main>
      <FooterThree />
    </>
  );
};

export default Blog;
