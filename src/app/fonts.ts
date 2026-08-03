import localFont from "next/font/local";

// Main typeface, used everywhere by default. Every weight Geist ships with
// is loaded (not just the 4 Inter had) so any --typo-*-weight value in
// globals.css has a real matching file instead of the browser faking a
// weight it doesn't have (which looks worse than a real one).
export const geist = localFont({
  src: [
    { path: "../../public/fonts/GEIST/Geist-Thin.otf", weight: "100", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-ExtraLight.otf", weight: "200", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-Light.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-Medium.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "../../public/fonts/GEIST/Geist-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-geist",
  display: "swap",
});

// Secondary typeface, used only for artist names (see `font-artist` in
// globals.css). Karrik only ships a single weight (Regular) — there's no
// bold/light file to swap to, so font-artist always requests weight 400.
export const karrik = localFont({
  src: [
    { path: "../../public/fonts/KARRIK/Karrik-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/KARRIK/Karrik-Italic.otf", weight: "400", style: "italic" },
  ],
  variable: "--font-karrik",
  display: "swap",
});
