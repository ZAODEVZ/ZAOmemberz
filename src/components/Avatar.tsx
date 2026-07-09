import { initials, hueFrom } from "@/lib/format";

/**
 * Avatar with graceful fallback: if no avatarUrl, render a deterministic
 * gradient tile with the member's initials. Uses a plain <img> (not next/image)
 * because avatar URLs are arbitrary owner-supplied endpoints.
 */
export function Avatar({
  src,
  name,
  wallet,
  size = 48,
  className = "",
}: {
  src: string | null;
  name: string | null;
  wallet: string;
  size?: number;
  className?: string;
}) {
  const hue = hueFrom(wallet);
  const dimension = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? wallet}
        style={dimension}
        className={`rounded-full object-cover ring-1 ring-white/10 ${className}`}
      />
    );
  }

  return (
    <div
      style={{
        ...dimension,
        background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${
          (hue + 60) % 360
        } 70% 35%))`,
        fontSize: size * 0.38,
      }}
      className={`flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-white/10 ${className}`}
      aria-label={name ?? wallet}
    >
      {initials(name, wallet)}
    </div>
  );
}
