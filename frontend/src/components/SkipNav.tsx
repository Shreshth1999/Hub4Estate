export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm font-medium"
    >
      Skip to main content
    </a>
  );
}
