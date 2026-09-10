import Header from "@/components/Header";
import PageTransitionProvider from "@/components/PageTransition";
import HomeAppearanceProvider from "@/components/HomeAppearance";
import WorkFilterProvider from "@/components/WorkFilter";
import "../globals.css";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageTransitionProvider>
      <HomeAppearanceProvider>
        <WorkFilterProvider>
          <Header />
          {children}
        </WorkFilterProvider>
      </HomeAppearanceProvider>
    </PageTransitionProvider>
  );
}
