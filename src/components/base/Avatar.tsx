/**
 * Initials avatar used in topbars, user lists, and ticket notes.
 */
interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "accent" | "secondary";
  className?: string;
}

const SIZES = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-xs",
  lg: "w-11 h-11 text-sm",
};

const TONES = {
  primary: "bg-primary-100 text-primary-700",
  accent: "bg-accent-100 text-accent-700",
  secondary: "bg-secondary-100 text-secondary-800",
};

export default function Avatar({
  initials,
  size = "md",
  tone = "primary",
  className = "",
}: AvatarProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-label font-semibold tracking-wide shrink-0 ${SIZES[size]} ${TONES[tone]} ${className}`}
    >
      {initials}
    </span>
  );
}