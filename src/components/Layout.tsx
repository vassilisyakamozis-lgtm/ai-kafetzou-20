import React from "react";
import Header from "@/components/Header";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, width: "100%", maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {children}
      </main>
      <footer style={{ borderTop: "1px solid #eee", padding: 16, textAlign: "center", opacity: 0.7 }}>
        © {new Date().getFullYear()} AI Καφετζού
      </footer>
    </div>
  );
};

export default Layout;