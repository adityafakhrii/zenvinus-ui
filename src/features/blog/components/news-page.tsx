import HeaderOne from "@/components/layout/header/header";
import React from "react";
import NewsGrid from "./news-grid";
import FooterThree from "@/components/layout/footer/footer";
import type { PostPage } from "../types/post";

export interface NewsProps {
  initialData?: PostPage | null;
}

const News = ({ initialData = undefined }: NewsProps) => {
  return (
    <>
      <HeaderOne />
      <main>
        <NewsGrid initialData={initialData} />
      </main>
      <FooterThree />
    </>
  );
};

export default News;
