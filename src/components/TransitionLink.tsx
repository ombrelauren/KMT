"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { useTransitionNavigate } from "@/components/PageTransition";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: React.ReactNode;
  };

export default function TransitionLink({ href, children, ...props }: Props) {
  const navigate = useTransitionNavigate();

  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        e.preventDefault();
        navigate(href.toString());
      }}
    >
      {children}
    </Link>
  );
}
