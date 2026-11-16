import React from 'react';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

export type ButtonVariant = 'legacy' | 'primary' | 'teal' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  /** 'legacy' keeps existing template styling until all pages are revamped; Tailwind variants use the new UI kit. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Legacy Font Awesome icon class (kept for backwards compatibility during revamp phases). */
  icon?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

/** With href it renders a Next.js Link. */
export type LinkButtonProps = ButtonBaseProps &
  Pick<LinkProps, 'href'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'>;

/** Without href it renders a <button>, type="button" unless given. */
export type NativeButtonProps = ButtonBaseProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ButtonBaseProps
  >;

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const isLink = (props: ButtonProps): props is LinkButtonProps => props.href !== undefined;

const VARIANT_CLASSES = {
  primary:
    'bg-navy text-white border border-navy hover:bg-navy-hover hover:border-navy-hover focus-visible:ring-2 focus-visible:ring-teal-ink/40',
  teal:
    'bg-teal text-navy border border-teal hover:bg-teal-ink hover:border-teal-ink hover:text-white focus-visible:ring-2 focus-visible:ring-teal-ink/40',
  secondary:
    'bg-surface text-ink border border-[rgba(8,13,53,0.10)] shadow-[0_1px_2px_rgba(2,6,38,0.04)] hover:bg-canvas hover:border-[rgba(8,13,53,0.18)] focus-visible:ring-2 focus-visible:ring-teal-ink/40',
  outline:
    'bg-transparent text-ink border border-[rgba(8,13,53,0.14)] hover:bg-canvas hover:border-ink/30 focus-visible:ring-2 focus-visible:ring-teal-ink/40',
  ghost:
    'bg-transparent text-ink-secondary border border-transparent hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-teal-ink/40',
  danger:
    'bg-tone-red-fg text-white border border-tone-red-fg hover:bg-tone-red-ink hover:border-tone-red-ink focus-visible:ring-2 focus-visible:ring-tone-red-fg/35',
} as const satisfies Record<Exclude<ButtonVariant, 'legacy'>, string>;

const SIZE_CLASSES = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-[8px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-[10px]',
} as const satisfies Record<ButtonSize, string>;

/**
 * Shared Button primitive supporting both legacy template CTA styling (during phased migration)
 * and the new Tailwind design system variants.
 */
function Button(props: ButtonProps) {
  const {
    variant = 'legacy',
    size = 'md',
    block = false,
    icon,
    leftIcon,
    rightIcon,
    loading = false,
    className = '',
    children,
  } = props;

  if (variant === 'legacy') {
    const legacyClasses = [
      'tp-btn',
      'zv-btn',
      size === 'sm' && 'zv-btn-sm',
      block && 'zv-btn-block',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const content = (
      <>
        <span className="zv-btn-label">{children}</span>
        {icon && <i className={icon} aria-hidden="true"></i>}
      </>
    );

    if (isLink(props)) {
      const {
        variant: _variant,
        size: _size,
        block: _block,
        icon: _icon,
        leftIcon: _leftIcon,
        rightIcon: _rightIcon,
        loading: _loading,
        className: _className,
        children: _children,
        href,
        ...rest
      } = props;
      return (
        <Link href={href} className={legacyClasses} {...rest}>
          {content}
        </Link>
      );
    }

    const {
      variant: _variant,
      size: _size,
      block: _block,
      icon: _icon,
      leftIcon: _leftIcon,
      rightIcon: _rightIcon,
      loading: _loading,
      className: _className,
      children: _children,
      href: _href,
      type = 'button',
      ...rest
    } = props;
    return (
      // eslint-disable-next-line react/button-has-type -- type is always set (default "button")
      <button type={type} className={legacyClasses} {...rest}>
        {content}
      </button>
    );
  }

  const tailwindClasses = cn(
    'inline-flex items-center justify-center font-medium leading-none whitespace-nowrap select-none cursor-pointer',
    'transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'active:scale-[0.98] focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    block && 'w-full',
    className,
  );

  const inner = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.75} aria-hidden="true" /> : leftIcon}
      {children != null && <span>{children}</span>}
      {!loading && rightIcon}
    </>
  );

  if (isLink(props)) {
    const {
      variant: _variant,
      size: _size,
      block: _block,
      icon: _icon,
      leftIcon: _leftIcon,
      rightIcon: _rightIcon,
      loading: _loading,
      className: _className,
      children: _children,
      href,
      ...rest
    } = props;
    return (
      <Link href={href} className={tailwindClasses} {...rest}>
        {inner}
      </Link>
    );
  }

  const {
    variant: _variant,
    size: _size,
    block: _block,
    icon: _icon,
    leftIcon: _leftIcon,
    rightIcon: _rightIcon,
    loading: _loading,
    className: _className,
    children: _children,
    href: _href,
    type = 'button',
    disabled,
    ...rest
  } = props;

  return (
    // eslint-disable-next-line react/button-has-type -- type is always set (default "button")
    <button type={type} className={tailwindClasses} disabled={disabled || loading} {...rest}>
      {inner}
    </button>
  );
}

export default Button;
