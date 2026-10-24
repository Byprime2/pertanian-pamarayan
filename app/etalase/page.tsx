"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, BadgeCheck, MessageCircle, ArrowDownUp, Leaf, Package, XCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function EtalasePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [sortBy, setSortBy] = useState('terbaru')

  const NO_WA_ADMIN = "6282114064622"

  const fetchProducts = async () => {
    // HAPUS filter .gt() agar semua data (termasuk stok 0) ditarik dari database
    const { data } = await supabase.from('harvests').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()

    // FITUR PRO: Real-time Listener. Etalase akan otomatis update jika Admin mengubah stok di backend
    const channel = supabase.channel('etalase-public-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'harvests' }, () => {
        fetchProducts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleOrderWA = (cropName: string, remainingKg: number) => {
    const message = `Halo Admin Pertanian Pamarayan, saya tertarik untuk membeli hasil panen *${cropName}* yang saat ini tersedia ${remainingKg} kg. Apakah saya bisa memesan?`
    const waUrl = `https://wa.me/${NO_WA_ADMIN}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  const getProductImage = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('timun')) return 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?q=80&w=600&auto=format&fit=crop'
    if (lowerName.includes('kacang')) return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600&auto=format&fit=crop'
    if (lowerName.includes('jagung')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600&auto=format&fit=crop'
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop'
  }

  const categories = ['Semua', 'Timun', 'Kacang', 'Jagung', 'Sayuran Lainya']

  let processedProducts = products.filter(p => {
    const matchSearch = p.crop_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = activeCategory === 'Semua' || 
                         (activeCategory === 'Sayuran Lainya' ? 
                          !['timun', 'kacang', 'jagung'].some(c => p.crop_name.toLowerCase().includes(c)) : 
                          p.crop_name.toLowerCase().includes(activeCategory.toLowerCase()))
    return matchSearch && matchCategory
  })

  // LOGIKA SORTING
  if (sortBy === 'terbaru') {
    processedProducts.sort((a, b) => new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime())
  } else if (sortBy === 'stok_terbanyak') {
    processedProducts.sort((a, b) => b.remaining_kg - a.remaining_kg)
  } else if (sortBy === 'stok_sedikit') {
    // Biarkan yang stok 0 tetap di bawah meskipun di-sort "Stok Menipis"
    processedProducts.sort((a, b) => {
      if (a.remaining_kg === 0) return 1;
      if (b.remaining_kg === 0) return -1;
      return a.remaining_kg - b.remaining_kg;
    })
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F4F7F6] pb-24">
        
        {/* HEADER / BANNER FULL-WIDTH */}
        <div className="bg-gradient-to-br from-[#064E3B] to-emerald-700 pt-32 pb-24 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-2/3 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-emerald-50 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-md mb-5 uppercase tracking-wider border border-white/10 shadow-sm">
                <Leaf size={14} /> Langsung dari Petani
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-md">
                Panen Segar Pamarayan
              </h1>
              <p className="text-emerald-50/90 text-sm md:text-base font-medium max-w-xl mx-auto md:mx-0 leading-relaxed">
                Kualitas grade A, disortir ketat, dan siap kirim ke lokasi Anda. Temukan kebutuhan logistik pangan Anda dengan stok real-time di sini.
              </p>
            </div>
            
            <div className="hidden md:flex items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-300">
              <Package size={80} className="text-emerald-100 drop-shadow-lg" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          
          {/* Toolbar Interaktif */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg shadow-emerald-900/5 border border-gray-100 mb-6 sticky top-24 z-40">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Cari komoditas panen..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              </div>

              <div className="flex items-center w-full md:w-auto gap-3">
                <label className="text-sm font-bold text-gray-500 hidden md:block">Urutkan:</label>
                <div className="relative w-full md:w-auto">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-800 text-sm font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner"
                  >
                    <option value="terbaru">Paling Baru Panen</option>
                    <option value="stok_terbanyak">Stok Terbanyak</option>
                    <option value="stok_sedikit">Stok Menipis</option>
                  </select>
                  <ArrowDownUp className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-gray-100 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    activeCategory === cat 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* E-commerce Grid Layout */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 shadow-sm"></div>
              ))}
            </div>
          ) : processedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {processedProducts.map((p) => {
                const isHabis = p.remaining_kg === 0;

                return (
                  <div 
                    key={p.id} 
                    className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden group cursor-default relative ${isHabis ? 'border-gray-200 grayscale-[0.6] opacity-80' : 'border-gray-200 hover:border-emerald-400 hover:shadow-xl cursor-pointer'}`}
                  >
                    
                    {/* LABEL BADGE */}
                    {isHabis ? (
                      <div className="absolute top-2 left-2 z-10 bg-gray-800 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-wide flex items-center gap-1">
                        <XCircle size={10} /> STOK HABIS
                      </div>
                    ) : p.remaining_kg > 50 ? (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-wide">
                        GROSIR
                      </div>
                    ) : null}

                    <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                      <img 
                        src={getProductImage(p.crop_name)} 
                        alt={p.crop_name} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${!isHabis && 'group-hover:scale-110'}`}
                      />
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className={`text-sm md:text-base font-extrabold line-clamp-2 leading-tight mb-1.5 transition-colors ${isHabis ? 'text-gray-500' : 'text-gray-800 group-hover:text-emerald-600'}`}>
                        {p.crop_name}
                      </h3>
                      
                      <div className={`text-xl font-black mb-1 flex items-baseline gap-1 ${isHabis ? 'text-gray-400' : 'text-gray-900'}`}>
                        {p.remaining_kg} <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kg</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 mb-4">
                        <BadgeCheck size={14} className={isHabis ? 'text-gray-400' : 'text-emerald-500'} fill="currentColor" stroke="white" />
                        <span className="text-[11px] font-bold text-gray-500 truncate">Kebun Pamarayan</span>
                      </div>

                      <div className="mt-auto">
                        {/* Progress bar stok menipis (Sembunyikan jika habis) */}
                        {!isHabis && p.remaining_kg < 20 && (
                          <>
                            <div className="w-full bg-red-100 rounded-full h-1.5 mb-1.5">
                              <div className="bg-red-500 h-1.5 rounded-full relative overflow-hidden" style={{ width: '80%' }}>
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                              </div>
                            </div>
                            <p className="text-[10px] text-red-500 font-bold mb-3">Sisa sedikit, cepat pesan!</p>
                          </>
                        )}
                        
                        <p className="text-[10px] text-gray-400 mb-3 font-semibold uppercase tracking-wider">
                          Panen: {new Date(p.harvest_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                        
                        {/* TOMBOL BELI */}
                        <button 
                          disabled={isHabis}
                          onClick={() => !isHabis && handleOrderWA(p.crop_name, p.remaining_kg)}
                          className={`w-full text-xs md:text-sm font-extrabold py-2 md:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm ${
                            isHabis 
                            ? 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white active:scale-95'
                          }`}
                        >
                          {isHabis ? (
                            'Stok Kosong'
                          ) : (
                            <><MessageCircle size={16} /> Beli via WA</>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm col-span-full">
              <div className="bg-gray-50 p-6 rounded-full mb-5 shadow-inner">
                <Search size={36} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">Oops, komoditas tidak ditemukan</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm mb-6 font-medium leading-relaxed">
                Coba gunakan kata kunci lain atau ubah kategori filter Anda untuk menemukan hasil panen.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('Semua'); setSortBy('terbaru'); }}
                className="px-6 py-2.5 bg-emerald-100 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-200 transition-colors shadow-sm"
              >
                Tampilkan Semua Stok
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  )
}