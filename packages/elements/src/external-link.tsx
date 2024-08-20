import { cn } from "@lightdotso/utils";
import { ArrowUpRightFromSquareIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type ExternalLinkProps = ComponentProps<"a">;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ExternalLink: FC<ExternalLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex flex-1 justify-center gap-0.5 break-all text-text-info leading-4 hover:text-text-info-strong",
        className,
      )}
      {...props}
    >
      {children ?? href}
      <ArrowUpRightFromSquareIcon className="h-2 w-2 shrink-0" />
    </a>
  );
};
