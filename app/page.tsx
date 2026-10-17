"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Leaf, ShoppingBag, ShieldCheck, TrendingUp, 
  CheckCircle2, ChevronRight, Star, Clock, Newspaper, 
  ArrowRight, X, Quote, Truck, Search, MessageCircle 
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PublicLandingPage() {
  const [products, setProducts] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState<any>(null)
  const [bgIndex, setBgIndex] = useState(1)
  const totalPhotos = 14

  useEffect(() => {
    if (selectedNews) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [selectedNews])

  useEffect(() => {
    const fetchData = async () => {
      const { data: harvestData } = await supabase.from('harvests').select('*').gt('remaining_kg', 0).order('harvest_date', { ascending: false }).limit(6)
      if (harvestData) setProducts(harvestData)

      const { data: newsData } = await supabase.from('land_news').select('*').order('published_at', { ascending: false }).limit(3)
      if (newsData) setNews(newsData)

      const { data: reviewsData } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(6)
      if (reviewsData) setReviews(reviewsData)

      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setBgIndex((prev) => (prev >= totalPhotos ? 1 : prev + 1)), 6000)
    return () => clearInterval(timer)
  }, [])

  // Fungsi gambar premium otomatis untuk etalase
  const getProductImage = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('timun')) return 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?q=80&w=800&auto=format&fit=crop'
    if (lowerName.includes('kacang')) return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop'
    if (lowerName.includes('jagung')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=800&auto=format&fit=crop'
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop'
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <div className="flex-grow">
        
        {/* 1. PREMIUM HERO SECTION */}
        <div className="relative pt-32 pb-40 md:pt-48 md:pb-56 overflow-hidden flex items-center min-h-[95vh] md:min-h-[90vh]">
          {/* Animated Background Images */}
          <div className="absolute inset-0 z-0 bg-slate-900">
            <img 
              key={bgIndex} 
              src={`/Photos/${bgIndex}.jpeg`} 
              alt="Lahan Pamarayan" 
              className="w-full h-full object-cover animate-[kenburns_20s_ease-in-out_infinite_alternate] opacity-70" 
            />
            {/* Sophisticated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-emerald-900/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-slate-900/10 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6 uppercase tracking-widest backdrop-blur-md shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Panen Langsung Dari Lahan
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1] drop-shadow-2xl">
                Agrikultur Modern. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  Kualitas Premium.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed mb-10 max-w-2xl drop-shadow-md">
                Kami memutus rantai distribusi yang panjang. Dapatkan komoditas sayuran dan palawija segar dengan harga tangan pertama langsung dari lahan Pamarayan.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#katalog" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-center transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-lg active:scale-95">
                  <ShoppingBag size={20} /> Lihat Etalase Panen
                </a>
                <a href="#kabar-lahan" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-bold text-center transition-all backdrop-blur-md flex items-center justify-center gap-2 group">
                  Kabar Lahan <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FLOATING FEATURES SECTION */}
        <div id="keunggulan" className="relative z-20 -mt-24 md:-mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-900/10 border border-white flex flex-col hover:-translate-y-2 transition-transform duration-500 group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Leaf size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Panen Harian</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Komoditas dipanen dan didistribusikan di hari yang sama demi mempertahankan nutrisi dan kesegaran 100%.</p>
            </div>
            
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-900/10 border border-white flex flex-col hover:-translate-y-2 transition-transform duration-500 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Harga Tangan Pertama</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Tanpa tengkulak dan perantara panjang. Optimalkan profit bisnis retail atau restoran Anda bersama kami.</p>
            </div>
            
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-900/10 border border-white flex flex-col hover:-translate-y-2 transition-transform duration-500 group">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Sortir Quality Control</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Melalui penyortiran ketat grade-A pasca panen. Menjamin Anda hanya menerima produk terbaik tanpa cacat.</p>
            </div>

          </div>
        </div>

        {/* 3. PREMIUM CATALOG (BENTO-STYLE CARDS) */}
        <div id="katalog" className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <span className="text-emerald-600 font-extrabold tracking-widest uppercase text-xs mb-3 block flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-emerald-600 rounded-full"></span>
                  Katalog Etalase Gudang
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Stok Real-Time <br className="hidden md:block"/> Langsung Dari Kebun.
                </h2>
              </div>
              <Link href="/etalase" className="hidden md:flex items-center justify-center gap-2 bg-white text-slate-700 hover:text-emerald-600 px-6 py-3 rounded-xl text-sm font-bold border border-slate-200 shadow-sm transition-all hover:shadow-md">
                Lihat Semua Stok <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-[2rem]"></div>)}
               </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-2 transition-all duration-500 group flex flex-col">
                    
                    {/* Image Area */}
                    <div className="h-64 relative overflow-hidden bg-slate-100">
                      <img src={getProductImage(p.crop_name)} alt={p.crop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                      
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-800 shadow-lg flex items-center gap-1.5 uppercase tracking-wide">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Siap Kirim
                        </div>
                        {p.remaining_kg > 50 && (
                          <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg uppercase tracking-wide">
                            Grosir Tersedia
                          </div>
                        )}
                      </div>

                      {/* Title over image */}
                      <div className="absolute bottom-4 left-4 right-4">
                         <h3 className="text-2xl font-black text-white mb-1 line-clamp-1 drop-shadow-md">{p.crop_name}</h3>
                         <p className="text-xs font-bold text-slate-300 flex items-center gap-1">
                           <Clock size={12} /> Panen: {new Date(p.harvest_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                         </p>
                      </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6 flex-1 flex flex-col bg-white">
                      <div className="mt-auto">
                        <div className="flex justify-between items-end mb-6">
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Sisa Stok</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-slate-900">{p.remaining_kg}</span>
                              <span className="text-sm font-bold text-slate-500">Kg</span>
                            </div>
                          </div>
                          
                          {p.remaining_kg < 20 && (
                             <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">Hampir Habis!</span>
                          )}
                        </div>
                        
                        <a href={`https://wa.me/6282114064622?text=Halo%20Admin%20Pamarayan,%20saya%20tertarik%20membeli%20komoditas%20${p.crop_name}`} target="_blank" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-emerald-600 py-3.5 rounded-xl font-bold transition-colors shadow-md text-sm">
                          <ShoppingBag size={16} /> Pesan Via WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Leaf size={40} className="text-slate-300" /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Gudang Sedang Kosong</h3>
                <p className="text-slate-500">Semua hasil panen hari ini telah habis terjual.</p>
              </div>
            )}
            
            {/* Mobile View All Button */}
            <Link href="/etalase" className="md:hidden mt-8 w-full flex items-center justify-center gap-2 bg-white text-slate-700 px-6 py-4 rounded-xl text-sm font-bold border border-slate-200 shadow-sm active:bg-slate-50">
              Lihat Semua Stok <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 4. MODERN STEPS SECTION */}
        <div className="bg-white py-24 border-t border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Pemesanan Sangat Mudah</h2>
              <p className="text-slate-500 font-medium">Proses transparan dan cepat untuk memastikan komoditas segera sampai di tangan Anda.</p>
            </div>
            
            <div className="relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-emerald-100 via-emerald-500 to-emerald-100"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] border-4 border-slate-50 group-hover:border-emerald-100 transition-all duration-300">
                    <Search className="text-emerald-600 w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">1. Pilih Etalase</h4>
                  <p className="text-slate-500 font-medium text-sm">Cek ketersediaan stok aktual komoditas panen yang Anda butuhkan melalui website.</p>
                </div>
                
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] border-4 border-slate-50 group-hover:border-emerald-100 transition-all duration-300">
                    <MessageCircle className="text-emerald-600 w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">2. Hubungi Admin</h4>
                  <p className="text-slate-500 font-medium text-sm">Konsultasikan kebutuhan, negosiasi harga partai besar, dan sepakati pengiriman via WhatsApp.</p>
                </div>
                
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] border-4 border-slate-50 group-hover:border-emerald-100 transition-all duration-300">
                    <Truck className="text-emerald-600 w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">3. Barang Dikirim</h4>
                  <p className="text-slate-500 font-medium text-sm">Armada logistik kami mengantar panen segar langsung ke lokasi bisnis Anda hari itu juga.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. EDITORIAL BENTO GRID FOR NEWS */}
        <div id="kabar-lahan" className="bg-slate-50 py-24 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="text-emerald-600 font-extrabold tracking-widest uppercase text-xs mb-3 block flex items-center gap-2">
                <span className="w-8 h-0.5 bg-emerald-600 rounded-full"></span>
                Transparansi Publik
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Kabar Lahan Terbaru</h2>
            </div>
            
            {loading ? (
              <div className="text-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : news.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Large News (Span 8) */}
                <button 
                  onClick={() => setSelectedNews(news[0])} 
                  className="lg:col-span-8 relative rounded-[2rem] overflow-hidden h-[400px] md:h-[500px] group text-left cursor-pointer border border-slate-200"
                >
                  <img src={news[0].image_url} alt={news[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-md">Berita Utama</span>
                      <span className="text-slate-300 text-xs font-bold flex items-center gap-1.5"><Clock size={12}/> {new Date(news[0].published_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})}</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight group-hover:text-emerald-400 transition-colors drop-shadow-lg">{news[0].title}</h3>
                    <p className="text-slate-300 font-medium line-clamp-2 md:w-4/5 text-sm md:text-base drop-shadow-md">{news[0].excerpt}</p>
                  </div>
                </button>

                {/* Side Smaller News (Span 4) */}
                {news.length > 1 && (
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {news.slice(1, 3).map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => setSelectedNews(item)} 
                        className="flex-1 relative rounded-[2rem] overflow-hidden min-h-[200px] md:min-h-[238px] group text-left cursor-pointer border border-slate-200"
                      >
                        <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="text-slate-300 text-[10px] font-bold flex items-center gap-1.5 mb-2"><Clock size={10}/> {new Date(item.published_at).toLocaleDateString('id-ID')}</span>
                          <h3 className="text-lg font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2 drop-shadow-md">{item.title}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4"><Newspaper size={32} /></div>
                <h3 className="text-lg font-bold text-slate-900">Belum ada dokumentasi</h3>
              </div>
            )}
          </div>
        </div>

        {/* 6. PREMIUM TESTIMONIALS (DARK GLASSMORPHISM) */}
        <div id="ulasan" className="bg-[#062F21] py-24 border-t border-[#041d14] relative overflow-hidden selection:bg-white selection:text-[#062F21]">
          {/* Subtle Organic Patterns */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[120px] opacity-10 translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500 rounded-full blur-[100px] opacity-10 -translate-x-1/3 translate-y-1/4"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="text-emerald-400 font-extrabold tracking-widest uppercase text-xs mb-3 block">Apa Kata Mereka?</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">Ulasan Mitra & Pelanggan</h2>
              <p className="text-emerald-100/70 max-w-2xl mx-auto font-medium text-lg">
                Kepercayaan adalah pondasi kami. Dengarkan pengalaman nyata dari mereka yang telah bermitra dan berbelanja di Pertanian Pamarayan.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-10"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col">
                    <Quote size={40} className="text-emerald-500/40 mb-6" />
                    <div className="flex gap-1 mb-6">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-emerald-50/90 font-medium leading-relaxed mb-8 italic flex-grow text-sm md:text-base">"{review.content}"</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10 mt-auto">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-inner">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{review.name}</h4>
                        <p className="text-emerald-400/80 text-[10px] font-extrabold uppercase tracking-widest mt-0.5">{review.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-16 text-center max-w-2xl mx-auto">
                <Quote size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Belum Ada Ulasan</h3>
                <p className="text-emerald-200/60">Ulasan dari pelanggan dan mitra investasi akan ditampilkan di sini setelah ditambahkan oleh sistem.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <Footer />

      {/* PREMIUM IOS-STYLE MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedNews(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 overflow-hidden">
            
            {/* Close Button */}
            <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-xl text-slate-900 rounded-full hover:bg-white transition-colors shadow-sm">
              <X size={20} />
            </button>
            
            <div className="overflow-y-auto w-full h-full scrollbar-none">
              <div className="relative h-64 md:h-[400px]">
                <img src={selectedNews.image_url} alt={selectedNews.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 md:p-12 md:pt-4 bg-white relative">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-black uppercase tracking-widest">Berita & Kabar Lahan</span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400"><Clock size={14} /> {new Date(selectedNews.published_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                  {selectedNews.title}
                </h2>
                
                <div className="prose prose-lg prose-emerald max-w-none text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                  {selectedNews.content || selectedNews.excerpt}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}