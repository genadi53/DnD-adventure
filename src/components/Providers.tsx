"use client";

import { ThemeProvider } from "next-themes";
import ConvexClientProvider from "../app/ConvexClientProvider";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <ThemeProvider enableSystem={true} defaultTheme="dark" attribute="class">
        {children}
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
