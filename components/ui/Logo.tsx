import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "sidebar";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  priority?: boolean;
}

const LOGO_SRC = "/images/logo/Green-basket-logo.png";

export function Logo({
  className,
  variant = "default",
  size = "md",
  href,
  priority = true,
}: LogoProps) {
  const sizeClasses = {
    sm: "h-9 sm:h-10 w-auto",
    md: "h-11 sm:h-12 md:h-13 w-auto",
    lg: "h-14 sm:h-18 w-auto",
    xl: "h-18 sm:h-22 w-auto",
  };

  const imageElement = (
    <div
      className={cn(
        "relative flex items-center transition-transform duration-200",
        variant === "sidebar" && "bg-white rounded-xl px-3 py-2 shadow-xs w-full flex justify-center",
        className
      )}
    >
      <Image
        src={LOGO_SRC}
        alt="Green Basket — Your Kitchen, Simplified"
        width={420}
        height={140}
        priority={priority}
        className={cn(
          "object-contain select-none",
          sizeClasses[size]
        )}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-95 transition-opacity" aria-label="Green Basket — Home">
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}
