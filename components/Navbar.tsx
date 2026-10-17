"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Bell, LogOut, Menu, X, 
  LayoutDashboard, Package, Tractor, 
  ShoppingCart, Users, Landmark, 
  MessageSquareQuote, UserCircle, Settings, CheckCircle2, Info, ArrowRight
} from 'lucide-react'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // State Khusus Notifikasi
  const [notifications, setNotifications] = useState<any[]>([])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [hasNewNotif, setHasNewNotif] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const router = useRouter()
  
  // Logika Pendeteksi Halaman
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUser(user)
    }
    fetchUser()

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Hanya fetch notifikasi jika berada di halaman Admin
    if (!isAdminPage) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) setNotifications(data)
    }
    
    fetchNotifications()

    const channel = supabase.channel('navbar-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 10))
        setHasNewNotif(true)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isAdminPage])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    if (window.confirm('Keluar dari sistem Pertanian Pamarayan?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  const navLinks = [
    { name: 'Dasbor', path: '/admin', icon: LayoutDashboard },
    { name: 'Gudang', path: '/admin/gudang', icon: Package },
    { name: 'Panen', path: '/admin/panen', icon: Tractor },
    { name: 'Penjualan', path: '/admin/penjualan', icon: ShoppingCart },
    { name: 'SDM', path: '/admin/sdm', icon: Users },
    { name: 'Investasi', path: '/admin/investasi', icon: Landmark },
    { name: 'Ulasan', path: '/admin/ulasan', icon: MessageSquareQuote },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/90 backdrop-blur-lg border-b border-white/10 shadow-lg py-3' 
          : 'bg-transparent py-5 md:py-6'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* LOGO BESAR & IDENTITAS */}
            <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center gap-3 md:gap-4 group">
              <img 
                src="/Logo-1.png" alt="Logo" 
                className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-12 h-12 md:w-16 md:h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl items-center justify-center text-emerald-400 font-black text-xl">
                PP
              </div>
              
              <div className="flex flex-col">
                <span className="font-black text-white text-base md:text-xl tracking-widest uppercase drop-shadow-md whitespace-nowrap">
                  Pertanian Pamarayan
                </span>
                
                {/* Tampilkan identitas hanya jika di halaman admin */}
                {isAdminPage && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                    <span className="text-[10px] md:text-xs text-emerald-400 font-bold truncate max-w-[150px] md:max-w-[200px]">
                      {user?.email || 'Memuat identitas...'}
                    </span>
                  </div>
                )}
              </div>
            </Link>

            {/* LINK NAVIGASI DESKTOP (Hanya Muncul di Admin) */}
            {isAdminPage && (
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path
                  return (
                    <Link 
                      key={link.name} href={link.path}
                      className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 ${
                        isActive ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.5)]"></span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* AREA KANAN */}
            <div className="hidden lg:flex items-center gap-3">
              {isAdminPage ? (
                <>
                  <Link href="/admin/akun" title="Pusat Akun & Pengaturan" className="p-2.5 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all border border-transparent hover:border-emerald-500/20">
                    <UserCircle size={22} />
                  </Link>

                  <div className="relative" ref={notifRef}>
                    <button 
                      onClick={() => {
                        setIsNotifOpen(!isNotifOpen)
                        setHasNewNotif(false)
                      }}
                      title="Pemberitahuan" 
                      className={`relative p-2.5 rounded-full transition-all border ${
                        isNotifOpen ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 border-transparent hover:border-emerald-500/20'
                      }`}
                    >
                      <Bell size={22} />
                      {hasNewNotif && (
                        <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-black text-slate-900 text-sm">Pemberitahuan Sistem</h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notifications.length} Terbaru</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                              {notifications.map((notif, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 group">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 mt-1">
                                    <Info size={14} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-emerald-700 transition-colors">{notif.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{notif.description}</p>
                                    <span className="text-[9px] font-bold text-slate-400 mt-2 block uppercase tracking-wider">
                                      {new Date(notif.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center flex flex-col items-center">
                              <CheckCircle2 size={32} className="text-slate-300 mb-2" />
                              <p className="text-sm font-bold text-slate-800">Semua Terpantau Aman</p>
                              <p className="text-xs text-slate-500 mt-1">Belum ada aktivitas terbaru hari ini.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-px h-6 bg-white/20 mx-2"></div>

                  <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-full font-bold text-sm transition-all">
                    Keluar <LogOut size={16} />
                  </button>
                </>
              ) : (
                /* Tombol Login / Dasbor untuk Landing Page */
                <Link href={user ? "/admin" : "/login"} className="flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  {user ? 'Buka Dasbor' : 'Masuk Sistem'} <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* TOMBOL BURGER MOBILE */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-300 hover:text-white bg-white/5 rounded-lg border border-white/10 relative">
              <Menu size={26} />
              {isAdminPage && hasNewNotif && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE SIDE-DRAWER */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        <div className={`absolute top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {isAdminPage ? 'Menu Navigasi' : 'Selamat Datang'}
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full transition-colors"><X size={20} /></button>
          </div>

          {isAdminPage ? (
            <>
              {/* Drawer khusus Admin */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-b from-slate-900/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <UserCircle size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akun Terhubung</p>
                    <p className="text-sm font-black text-white truncate">{user?.email || 'Memuat akun...'}</p>
                  </div>
                </div>
                
                <Link href="/admin/akun" onClick={() => setIsMobileMenuOpen(false)} className="mt-5 w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <Settings size={16} /> Kelola Pusat Akun
                </Link>
              </div>

              <div className="px-4 py-2 border-b border-white/5">
                <button onClick={() => {
                    alert("Silakan buka dari tampilan desktop untuk melihat riwayat notifikasi.")
                    setHasNewNotif(false)
                  }} 
                  className="flex items-center justify-between w-full py-2 text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <Bell size={18} className={hasNewNotif ? 'text-emerald-400' : ''}/> 
                    <span className="text-sm font-bold">Pemberitahuan Sistem</span>
                  </div>
                  {hasNewNotif && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">BARU</span>}
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path
                  const Icon = link.icon
                  return (
                    <Link key={link.name} href={link.path} onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${
                        isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-emerald-400' : 'text-slate-500'} /> {link.name}
                    </Link>
                  )
                })}
              </div>

              <div className="p-6 border-t border-white/10 bg-slate-900/50">
                <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            </>
          ) : (
            /* Drawer khusus Landing Page */
            <div className="flex flex-col h-full p-6">
              <div className="mt-auto">
                <Link href={user ? "/admin" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg">
                  {user ? 'Buka Dasbor Admin' : 'Masuk Ke Sistem'} <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}