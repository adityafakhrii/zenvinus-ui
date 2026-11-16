import { useEffect, useState } from 'react';

/** True once the page has scrolled more than 200px (the service page header turns sticky). */
const useSticky = (): { sticky: boolean } => {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const stickyHeader = () => setSticky(window.scrollY > 200);
    window.addEventListener('scroll', stickyHeader);
    return () => window.removeEventListener('scroll', stickyHeader);
  }, []);

  return { sticky };
};

export default useSticky;
