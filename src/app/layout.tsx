"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import RepoForm from "../components/RepoForm";
import RepoDetails from "../components/RepoDetails";
import { Provider } from "@/components/ui/provider";

import "./globals.css";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {" "}
        <QueryClientProvider client={queryClient}>
          <Provider>{children}</Provider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
