"use client";

// components/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from "react";
import clsx from "clsx";

// Props extend native <button> props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary";
}

const baseStyles =
  "px-6 py-2 rounded border text-black transition hover:bg-gray-100";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border-black",
      primary: "bg-black text-white border-black hover:bg-gray-800",
      secondary: "border-gray-400 text-gray-800",
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
