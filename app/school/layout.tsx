import "./globals.css";
import { Providers } from "./providers";

export default function SchoolLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Providers>{children}</Providers>;
}