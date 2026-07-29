import {
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode,
} from "react";
import { BiLoaderAlt } from "react-icons/bi";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "quiet"
  | "danger"
  | "success";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-brand-600 bg-brand-600 text-white shadow-soft hover:border-brand-700 hover:bg-brand-700",
  secondary:
    "border-brand-200 bg-brand-50 text-brand-800 hover:border-brand-300 hover:bg-brand-100",
  quiet:
    "border-transparent bg-transparent text-ink-700 hover:border-[var(--border)] hover:bg-surface-subtle hover:text-ink-900",
  danger:
    "border-red-200 bg-[var(--danger-soft)] text-[var(--danger)] hover:border-red-300 hover:bg-red-100",
  success:
    "border-emerald-700 bg-emerald-700 text-white hover:border-emerald-800 hover:bg-emerald-800",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = "",
    variant = "primary",
    size = "md",
    loading = false,
    leadingIcon,
    trailingIcon,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-control border font-semibold transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 ease-product active:translate-y-px disabled:translate-y-0 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <BiLoaderAlt className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {!loading && trailingIcon}
    </button>
  );
});

export default Button;
