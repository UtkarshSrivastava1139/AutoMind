export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-app text-text-primary selection:bg-primary/30 selection:text-primary-light">
      {/* Marketing-specific headers/footers can go here if needed.
          Currently they are inside page.tsx, which is perfectly fine for full control. */}
      {children}
    </div>
  );
}
