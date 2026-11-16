import React from 'react';
import type { ReactNode } from 'react';

/** Outer wrapper of every page (keeps consistent shell boundary without legacy WOW.js bounce effects). */
const Wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

export default Wrapper;
