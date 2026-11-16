import Link from "next/link";
import { useT } from "@/i18n";

const social_links = [
  {
    link: "https://facebook.com",
    target: "_blank",
    icon: "fab fa-facebook-f", 
  },
  {
    link: "https://twitter.com",
    target: "_blank",
    icon: "fab fa-twitter", 
  },
  {
    link: "https://www.instagram.com",
    target: "_blank",
    icon: "fa-brands fa-instagram", 
  }, 
  {
    link: "https://www.pinterest.com",
    target: "_blank",
    icon: "fa-brands fa-pinterest", 
  },
];

const SocialLinks = () => {
  return (
    <>
      {social_links.map((l, i) => (
        <Link
          key={i}
          href={l.link}
          target={l.target}
        >
          <i className={l.icon}></i>
        </Link>
      ))}
    </>
  );
};

export default SocialLinks;

export const CopyRight = ()  => {
  const { t } = useT();
  return (
    <>
    {t("© Copyright {year} Zenvinus. All Rights Reserved", { year: <span>©{new Date().getFullYear()}</span> })}{" "}
    </>
  )
}
