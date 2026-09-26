import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({
  children,
  className = "",
  style,
  ...props
}: Props) {
  const baseClassName =
    "group relative inline-flex h-14 min-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-white/12 bg-white/[0.045] px-7 text-sm font-semibold tracking-[0.16em] text-white shadow-[0_16px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-[transform,border-color,background,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.075] hover:shadow-[0_20px_70px_rgba(34,211,238,0.12)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

  const mergedStyle: CSSProperties = {
    ...style,
    fontFamily: style?.fontFamily ?? "Sebino, sans-serif",
  };

  return (
    <button
      {...props}
      style={mergedStyle}
      className={`${baseClassName} ${className}`}
    >
      <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-80" />
      <span className="absolute -inset-x-20 -top-10 h-20 rotate-12 bg-gradient-to-r from-transparent via-cyan-200/15 to-transparent opacity-0 blur-xl transition-all duration-700 group-hover:translate-x-24 group-hover:opacity-100" />
      <span className="relative z-10 flex items-center gap-3">
        {children}
      </span>
    </button>
  );
}
