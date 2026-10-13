const MARK = "/assets/logo.png";
const WORDMARK = "/assets/logo-text-white.png";

export function BrandLogo({
  className = "",
  markClassName = "h-8 w-8",
  wordmarkClassName = "h-5",
  wordmark = true,
  variant = "auto",
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  wordmark?: boolean;
  variant?: "auto" | "light" | "dark";
}) {
  const showDarkWordmark = variant === "dark" || variant === "auto";
  const showLightWordmark = variant === "light" || variant === "auto";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={MARK} alt="" className={`shrink-0 object-contain ${markClassName}`} />
      {wordmark ? (
        <>
          {showDarkWordmark ? (
            <img
              src={WORDMARK}
              alt={showLightWordmark ? "" : "SecureEnv"}
              className={`w-auto object-contain object-left ${wordmarkClassName} ${variant === "auto" ? "hidden dark:block" : ""}`}
            />
          ) : null}
          {showLightWordmark ? (
            <span
              className={`text-[1.05rem] leading-none font-extrabold tracking-tight ${variant === "auto" ? "dark:hidden" : ""}`}
            >
              Secure<span className="text-brand-500">Env</span>
            </span>
          ) : null}
        </>
      ) : (
        <span className="sr-only">SecureEnv</span>
      )}
    </span>
  );
}
