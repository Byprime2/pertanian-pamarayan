"use client"
import { Inter } from "next/font/google";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Sprout, Wallet, LogOut } from 'lucide-react';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // LOGIKA PENENTU HALAMAN
  const isLoginPage = pathname === '/login'; 
  const isMainDashboard = pathname === '/admin'; // <-- Hanya bernilai true jika tepat berada di Dashboard Awal
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !isLoginPage) router.push('/'); 
      else if (session && isLoginPage) router.push('/admin'); 
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session && !isLoginPage) router.push('/');
    });
    return () => subscription.unsubscribe();
  }, [pathname, isLoginPage, router]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 20);
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) return (
    <html lang="id">
      <body className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </body>
    </html>
  );

  return (
    <html lang="id">
      <body className={`${inter.className} bg-surface-50 min-h-screen flex flex-col relative`}>

        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}