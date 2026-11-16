import React from 'react';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The site's main call-to-action button (dark with the mint corner, the template's .tp-btn look).
 * Use it instead of writing className="tp-btn" by hand:
 *
 *   <Button href="/login">{t("Sign in")}</Button>                  // link
 *   <Button onClick={save} disabled={busy}>{t("Save")}</Button>     // <button type="button">
 *   <Button type="submit" size="sm" block icon="fa-solid fa-arrow-right">…</Button>
 *
 * WHY: As a bare class the button took line-height, width and height from whatever box it sat in (in the blog
 * sidebar "Sign in" broke onto two lines). .zv-btn resets those, so it looks the same everywhere.
 */
interface ButtonBaseProps {
  /** "md" (default) or the compact "sm" */
  size?: 'md' | 'sm';
  /** Full width */
  block?: boolean;
  /** Font Awesome classes, shown after the label */
  icon?: string;
  /** Extra classes, e.g. a layout hook */
  className?: string;
  children?: ReactNode;
}

/** With href it renders a Next.js Link */
export type LinkButtonProps = ButtonBaseProps &
  Pick<LinkProps, 'href'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'>;

/** Without href it renders a <button>, type="button" unless given */
export type NativeButtonProps = ButtonBaseProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>;

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const isLink = (props: ButtonProps): props is LinkButtonProps => props.href !== undefined;

function Button(props: ButtonProps) {
  const { size = 'md', block = false, icon, className = '', children } = props;
  const classes = ['tp-btn', 'zv-btn', size === 'sm' && 'zv-btn-sm', block && 'zv-btn-block', className].filter(Boolean).join(' ');
  const content = (
    <>
      <span className="zv-btn-label">{children}</span>
      {icon && <i className={icon} aria-hidden="true"></i>}
    </>
  );

  if (isLink(props)) {
    const { size: _size, block: _block, icon: _icon, className: _className, children: _children, href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  const { size: _size, block: _block, icon: _icon, className: _className, children: _children, href: _href, type = 'button', ...rest } = props;
  return (
    // eslint-disable-next-line react/button-has-type -- type is always set (default "button")
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}

export default Button;
