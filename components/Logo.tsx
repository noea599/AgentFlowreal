export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect width="80" height="80" rx="18" fill="url(#logoGrad)" />
      <path d="M26 56L40 24L54 56" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31 46H49" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <circle cx="58" cy="32" r="4" fill="white" fillOpacity="0.9" />
      <circle cx="62" cy="44" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="58" cy="54" r="2" fill="white" fillOpacity="0.4" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="80" y2="80">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
      </defs>
    </svg>
  );
}
