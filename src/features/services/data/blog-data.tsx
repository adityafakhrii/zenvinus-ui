
// home 01
import blog_img_1 from "@assets/img/blog/img-1.jpg";
import blog_img_2 from "@assets/img/blog/img-2.jpg";
import blog_img_3 from "@assets/img/blog/img-3.jpg"; 
// home 03
import blog_img_4 from "@assets/img/blog/img-7.jpg";
import blog_img_5 from "@assets/img/blog/img-8.jpg";
import blog_img_6 from "@assets/img/blog/img-9.jpg";
// user
import blog_user_4 from "@assets/img/blog/user.png";
import blog_user_5 from "@assets/img/blog/user.png";
import blog_user_6 from "@assets/img/blog/user.png";
import { useT } from "@/i18n";
import type { ServiceBlogPost } from "../types/service";

// WHY: The titles are also rendered by src/features/services/components/blog-area.tsx as {item.title}, so each title translates itself
const Title = ({ text }: { text: string }) => {
    const { t } = useT();
    return <>{t(text, { br: <br /> })}</>;
};

const blog_data: ServiceBlogPost[] = [
    // for home 01 
    {
        id: 1, 
        img: blog_img_1,
        category: "Business",
        date: "02 Apr 2023",
        comments: "Comments (03)",
        title: <Title text="Providing solutions for Industrial {br} men restoration." />,
    },
    {
        id: 2, 
        img: blog_img_2,
        category: "Business",
        date: "02 Apr 2023",
        comments: "Comments (23)",
        title: <Title text="Occaecat nisi cupidatat deserunt culpa sit.." />,
    },
    {
        id: 3, 
        img: blog_img_3,
        category: "Business",
        date: "02 Apr 2023",
        comments: "Comments (15)",
        title: <Title text="Do do tempor deserunt ullamco. Voluptate sunt.." />,
    },
    // for home 03 
    {
        id: 4, 
        cls: "",
        img: blog_img_4,
        user: blog_user_4,
        user_name: "Jamil",
        category: "Business",
        date: "02 Apr 2023",
        comments: "Comments (03)",
        title: <Title text="Providing solutions for Industrial {br} men, and restoration." />,
    },
    {
        id: 5, 
        cls: "active",
        img: blog_img_5,
        user: blog_user_5,
        user_name: "Rasalina",
        category: "Business",
        date: "02 Apr 2023",
        comments: "Comments (23)",
        title: <Title text="Everything melancholy uncommonly but solicitude." />,
    },
    {
        id: 6, 
        cls: "",
        img: blog_img_6,
        user: blog_user_6,
        user_name: "Hamim",
        category: "Business",
        date: "02 Apr 2023",
        comments: "Comments (15)",
        title: <Title text="Discovery incommode earnestly commanded mentions." />,
    },


    
]
export default blog_data
