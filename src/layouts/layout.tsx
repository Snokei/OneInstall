import React from 'react';
import Header from './header';
import { ConsoleDrawer } from '@/components/console-drawer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground transition-colors duration-300">
      
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-40">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-48 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-background/40 z-10">
        
        {/* Header Component */}
        <Header />

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </main>

        {/* Operation Console Drawer */}
        <ConsoleDrawer />
      </div>
      
    </div>
  );
};

export default Layout;
