import SEO from "@/components/common/seo";
import { HomeMain } from "@/features/home/screens";
import Wrapper from "@/components/layout/wrapper";

const Home = () => {
  return (
    <Wrapper>
      <SEO pageTitle={"Zenvinus — AI Data, Research & Intelligence Platform"} />
      <HomeMain />
    </Wrapper>
  );
};

export default Home;
