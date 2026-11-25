export function BrandAvatar({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      className={`${className} shrink-0 rounded-lg object-contain`}
    />
  );
}
