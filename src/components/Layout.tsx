import React from "react";
import Header from "@/components/Header";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="container" style={{ flex: 1 }}>{children}</main>
      <footer className="footer">© {new Date().getFullYear()} AI Καφετζού</footer>
    </div>
  );
};

export default Layout;
