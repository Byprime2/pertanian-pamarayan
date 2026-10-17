"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Package, Wallet, Activity, ArrowRight, Sprout, Landmark, 
  Newspaper, Target, Eye, TrendingUp, BarChart3, Clock, X, 
  Warehouse, Tractor, ShoppingCart, Users, Star, PlayCircle, Video
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminDashboard() {
  const [totalPanen, setTotalPanen] = useState(0)
  const [totalInvestasi, setTotalInvestasi] = useState(0)
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bgIndex, setBgIndex] = useState(1)
  const totalPhotos = 14
  const [selectedNews, setSelectedNews] = useState<any>(null)

  // State untuk Video Modal
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  useEffect(() => {
    if (selectedNews || isVideoOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [selectedNews, isVideoOpen])

  useEffect(() => {
    async function fetchData() {
      // Data Panen
      const { data: harvests } = await supabase.from('harvests').select('remaining_kg')
      const totalKg = harvests?.reduce((acc, curr) => acc + Number(curr.remaining_kg), 0) || 0
      setTotalPanen(totalKg)

      // Data Investasi
      const { data: investments } = await supabase.from('investments').select('total_value, used_value')
      const totalInv = investments?.reduce((acc, curr) => acc + (Number(curr.total_value) - Number(curr.used_value)), 0) || 0
      setTotalInvestasi(totalInv)

      // Data Berita
      const { data: newsData } = await supabase.from('land_news').select('*').order('published_at', { ascending: false }).limit(3)
      if (newsData) setNews(newsData)

      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setBgIndex((prev) => (prev >= totalPhotos ? 1 : prev + 1)), 5000)
    return () => clearInterval(timer)
  }, [])

  // Konfigurasi Quick Access Menu
  const quickAccess = [
    { name: 'Gudang', icon: Warehouse, href: '/admin/gudang', desc: 'Stok inventaris & logistik', color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:border-emerald-300' },
    { name: 'Panen', icon: Tractor, href: '/admin/panen', desc: 'Pencatatan hasil lahan', color: 'text-green-600', bg: 'bg-green-50', hover: 'hover:border-green-300' },
    { name: 'Penjualan', icon: ShoppingCart, href: '/admin/penjualan', desc: 'Transaksi & pesanan', color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:border-blue-300' },
    { name: 'SDM', icon: Users, href: '/admin/sdm', desc: 'Kelola pekerja & staf', color: 'text-amber-600', bg: 'bg-amber-50', hover: 'hover:border-amber-300' },
    { name: 'Investasi', icon: Landmark, href: '/admin/investasi', desc: 'Arus kas & pendanaan', color: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'hover:border-indigo-300' },
    { name: 'Ulasan', icon: Star, href: '/admin/ulasan', desc: 'Testimoni pelanggan', color: 'text-rose-600', bg: 'bg-rose-50', hover: 'hover:border-rose-300' },
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />
      
      <div className="flex-grow pb-20">
        {/* 1. HERO COMMAND CENTER */}
        {/* 1. HERO COMMAND CENTER */}
<div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 pb-24">
  {/* Foto latar belakang */}
  <img 
    key={bgIndex} 
    src={`/Photos/${bgIndex}.jpeg`} 
    alt="Latar Belakang" 
    className="absolute inset-0 w-full h-full object-cover z-0 opacity-60" 
  />
  
  {/* Gradient overlay yang diperhalus agar foto memenuhi layar ke bawah */}
  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-50 z-10"></div>

  <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between gap-12 pt-5">
    <div className="w-full md:w-3/5 text-center md:text-left">
      <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Sistem Enterprise Aktif
      </span>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight drop-shadow-2xl">
        Pusat Kendali <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Pertanian Pamarayan</span>
      </h1>
      <p className="text-base md:text-lg text-slate-200 max-w-xl font-medium leading-relaxed drop-shadow-lg mx-auto md:mx-0">
        Platform terpadu untuk visibilitas arus modal, pemantauan logistik hasil panen, dan pelaporan operasional lahan secara aktual.
      </p>
    </div>

    <div className="w-full md:w-2/5 flex justify-center md:justify-end">
      <button onClick={() => setIsVideoOpen(true)} className="group relative w-full md:w-auto overflow-hidden rounded-[2rem] p-1 transition-all hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] opacity-70 group-hover:opacity-100 blur transition-opacity duration-500"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 px-8 py-6 rounded-[2rem] flex flex-col items-center gap-3 w-full">
          <PlayCircle size={48} className="text-emerald-400" strokeWidth={1.5} />
          <span className="text-white font-bold tracking-wide">Pantau Lahan Aktual</span>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Video Operasional</span>
        </div>
      </button>
    </div>
  </div>
</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-16 md:-mt-24">
          
          {/* 2. STATISTIK UTAMA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-10 -mt-60">
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform"><Package size={24} /></div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full"><TrendingUp size={14} /> Stabil</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Stok Gudang</h3>
                <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{totalPanen.toLocaleString('id-ID')} <span className="text-base lg:text-xl font-bold text-slate-400">Kg</span></p>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full"><Activity size={14} /> Aktif</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Valuasi Kas Bersih</h3>
                <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight"><span className="text-base lg:text-xl font-bold text-slate-400 mr-1">Rp</span>{totalInvestasi.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">Sistem v2.0</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Integritas Server</h3>
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span></span>
                  <span className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Online & Sinkron</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MENU AKSES CEPAT (BENTO GRID) */}
          <div className="mb-12">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Target className="text-emerald-600" /> Akses Administratif Cepat</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quickAccess.map((item, idx) => {
                const Icon = item.icon
                return (
                  <Link href={item.href} key={idx} className={`bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl ${item.hover} group flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5`}>
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 mb-0.5 group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-1">{item.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* 4. VIDEO & MEDIA SECTION */}
            <div className="lg:col-span-2 flex flex-col">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Video className="text-emerald-600" /> Profil & Laporan Lahan</h2>
              <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden relative group aspect-video w-full cursor-pointer" onClick={() => setIsVideoOpen(true)}>
                {/* Thumbnail Gambar / Video Placeholder */}
                <img src="/Photos/1.jpeg" alt="Thumbnail Lahan" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/30">
                    <PlayCircle size={40} className="ml-1" />
                  </div>
                  <h3 className="text-white font-bold text-xl md:text-2xl tracking-wide">Tonton Video Profil & Laporan</h3>
                  <p className="text-emerald-400 text-sm font-semibold mt-1">Klik untuk memutar</p>
                </div>
                <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> VIDEO TERSEDIA
                </div>
              </div>
            </div>

            {/* 5. KPI & METRIK */}
            <div className="lg:col-span-1 flex flex-col">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><BarChart3 className="text-emerald-600" /> Indeks Kinerja</h2>
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex-grow flex flex-col justify-center gap-8">
                
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Target Kapasitas Panen Bulanan</span>
                      <span className="text-sm font-bold text-slate-700">Estimasi Tembus Target</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600">65%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Efisiensi Serapan Modal</span>
                      <span className="text-sm font-bold text-slate-700">Anggaran Operasional</span>
                    </div>
                    <span className="text-2xl font-black text-blue-600">42%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 6. DOKUMENTASI AKTUAL (BERITA) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-t border-slate-200 pt-12">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Newspaper className="text-emerald-600"/> Dokumentasi Lapangan</h2>
              <Link href="/admin/berita/tambah" className="inline-flex items-center justify-center text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 px-6 py-3 rounded-xl transition-colors shadow-lg active:scale-95">
                + Buat Laporan Baru
              </Link>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
              {news.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {news.map((item) => (
                    <button key={item.id} onClick={() => setSelectedNews(item)} className="w-full text-left group block p-6 md:p-8 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                        <div className="w-full md:w-72 h-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        </div>
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">Update Lahan</span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Clock size={12} /> {new Date(item.published_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-3 leading-tight">{item.title}</h3>
                          <p className="text-sm md:text-base text-slate-500 line-clamp-2 font-medium leading-relaxed">{item.excerpt}</p>
                        </div>
                        <div className="hidden lg:flex shrink-0 items-center justify-center w-14 h-14 rounded-full border-2 border-slate-100 group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all"><ArrowRight size={24} className="text-slate-400 group-hover:text-emerald-600" /></div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100"><Newspaper size={40} /></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada dokumentasi</h3>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />

      {/* MODAL BERITA */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedNews(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 overflow-hidden">
            <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-xl text-slate-900 rounded-full hover:bg-white transition-colors shadow-sm"><X size={20} /></button>
            <div className="overflow-y-auto w-full h-full pb-10">
              <div className="relative h-64 md:h-[400px]">
                <img src={selectedNews.image_url} alt={selectedNews.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
              <div className="p-6 md:p-12 md:pt-4 bg-white relative">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-black uppercase tracking-widest">Berita & Laporan</span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400"><Clock size={14} /> {new Date(selectedNews.published_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">{selectedNews.title}</h2>
                <div className="prose prose-lg prose-emerald max-w-none text-slate-600 font-medium whitespace-pre-line leading-relaxed">{selectedNews.content || selectedNews.excerpt}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIDEO PLAYER MENGGUNAKAN FILE LOKAL */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity" onClick={() => setIsVideoOpen(false)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex items-center justify-center">
            <button onClick={() => setIsVideoOpen(false)} className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl text-white rounded-full hover:bg-red-500 transition-colors shadow-sm border border-white/20">
              <X size={20} />
            </button>
            
            <video 
              className="w-full h-full object-contain"
              src="/Photos/profile.mp4" 
              autoPlay 
              controls 
              playsInline
            >
              Maaf, browser Anda tidak mendukung tag pemutar video.
            </video>
          </div>
        </div>
      )}
    </div>
  )
}