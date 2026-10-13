type IconProps = {
  className?: string;
  strokeWidth?: number;
};

export function LockIcon({ className = "h-4 w-4", strokeWidth = 2.2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function BellIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}

export function MoonIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  );
}

export function SunIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function SignOutIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M15 17l5-5-5-5M20 12H9M12 20H5a1 1 0 01-1-1V5a1 1 0 011-1h7" />
    </svg>
  );
}

export function UserIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2a7 7 0 0114 0" />
    </svg>
  );
}

export function TrashIcon({ className = "h-4 w-4", strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function PencilIcon({ className = "h-4 w-4", strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function EyeOffIcon({ className = "h-4 w-4", strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 004.2 4.2" />
      <path d="M9.9 5.2A10.7 10.7 0 0112 5c6.4 0 10 7 10 7a18.5 18.5 0 01-3.1 4.1" />
      <path d="M6.1 6.1C3.7 7.9 2 12 2 12s3.6 7 10 7a10.8 10.8 0 004.2-.9" />
    </svg>
  );
}

export function EyeIcon({ className = "mt-0.5 h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function LogoMark({
  className = "h-8 w-8",
  iconClassName = "h-4 w-4",
  strokeWidth = 2.2,
}: {
  className?: string;
  iconClassName?: string;
  strokeWidth?: number;
}) {
  return (
    <span className={`grid place-items-center rounded-lg bg-brand-500 text-white ${className}`}>
      <LockIcon className={iconClassName} strokeWidth={strokeWidth} />
    </span>
  );
}
