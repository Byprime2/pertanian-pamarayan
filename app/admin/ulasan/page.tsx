"use client"

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  MessageSquareQuote, Star, Trash2, Plus, User, 
  Briefcase, AlertCircle, ArrowLeft, Search, 
  Filter, CheckCircle2, Quote, BarChart, Users
} from 'lucide-react'

export default function AdminUlasanPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRating, setFilterRating] = useState('Semua')

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setReviews(data)
    setLoading(false)
  }

  // Efek Real-Time & Mount
  useEffect(() => {
    fetchReviews()

    const channel = supabase.channel('testimonials-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchReviews()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Fungsi Tambah Ulasan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !role || !content) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('testimonials').insert([
        { name, role, content, rating }
      ])
      
      if (error) throw error

      // Auto-Trigger Notifikasi
      await supabase.from('notifications').insert([{
        title: 'Ulasan Baru Ditambahkan',
        description: `Testimoni bintang ${rating} dari ${name} telah dipublikasikan ke sistem.`,
      }])

      // Reset form
      setName('')
      setRole('')
      setContent('')
      setRating(5)
      // fetchReviews otomatis ditangani realtime
    } catch (error: any) {
      alert("Gagal menambahkan ulasan: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fungsi Hapus Ulasan
  const handleDelete = async (id: string, reviewerName: string) => {
    if (window.confirm(`Yakin ingin menghapus ulasan dari ${reviewerName}?`)) {
      await supabase.from('testimonials').delete().eq('id', id)
      
      await supabase.from('notifications').insert([{
        title: 'Ulasan Dihapus',
        description: `Testimoni dari ${reviewerName} telah dihapus dari sistem publikasi.`,
      }])
    }
  }

  // Kalkulasi KPI
  const stats = useMemo(() => {
    if (reviews.length === 0) return { total: 0, average: 0, fiveStars: 0 }
    
    const total = reviews.length
    const sumRating = reviews.reduce((acc, curr) => acc + curr.rating, 0)
    const average = (sumRating / total).toFixed(1)
    const fiveStars = reviews.filter(r => r.rating === 5).length

    return { total, average, fiveStars }
  }, [reviews])

  // Logika Filter & Pencarian
  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = filterRating === 'Semua' || r.rating.toString() === filterRating
    return matchesSearch && matchesRating
  })

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      <div className="flex-grow">
        
        {/* HERO HEADER */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden bg-slate-950">
          <img 
            src="/Photos/6.jpeg" 
            alt="Latar Belakang Testimoni" 
            onError={(e) => e.currentTarget.src = "/Photos/2.jpeg"}
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 animate-[kenburns_20s_ease-in-out_infinite_alternate]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-slate-950/80 to-slate-50/10 z-0"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin" className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg active:scale-95 shrink-0">
                  <ArrowLeft size={22} />
                </Link>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/25 text-emerald-300 backdrop-blur-sm text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-2.5 uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                    Publikasi & Kredibilitas
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md flex items-center gap-3">
                    <MessageSquareQuote className="hidden md:block text-emerald-400" size={40} />
                    Manajemen Ulasan
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base font-medium mt-2 leading-relaxed max-w-2xl">
                    Kelola testimoni pelanggan, mitra strategis, dan investor untuk meningkatkan kepercayaan publik pada halaman utama.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AREA KONTEN UTAMA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-24">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* KIRI: FORM INPUT (Sticky) */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 overflow-hidden sticky top-28">
                <div className="bg-slate-900 p-6 flex items-center gap-3">
                  <Plus size={24} className="text-emerald-400" />
                  <h2 className="text-lg font-black text-white">Tambah Ulasan Baru</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Nama Reviewer</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900 text-sm transition-all shadow-inner" 
                        placeholder="Contoh: Budi Santoso" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Peran / Instansi</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" required value={role} onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900 text-sm transition-all shadow-inner" 
                        placeholder="Contoh: Mitra Distributor" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Rating Penilaian</label>
                    <select 
                      value={rating} onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-slate-800 text-sm cursor-pointer shadow-inner appearance-none"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Sangat Puas (5)</option>
                      <option value="4">⭐⭐⭐⭐ Puas (4)</option>
                      <option value="3">⭐⭐⭐ Cukup (3)</option>
                      <option value="2">⭐⭐ Kurang (2)</option>
                      <option value="1">⭐ Sangat Kurang (1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Isi Testimoni</label>
                    <textarea 
                      required rows={4} value={content} onChange={(e) => setContent(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-slate-900 text-sm transition-all shadow-inner resize-none leading-relaxed" 
                      placeholder="Tulis ulasan impresi atau kepuasan di sini..." 
                    ></textarea>
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <><CheckCircle2 size={18} /> Publikasi Ulasan</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* KANAN: DASHBOARD KPI & DAFTAR ULASAN */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0"><Users size={24}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ulasan</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{stats.total} <span className="text-sm font-bold text-slate-400">Entri</span></p>
                  </div>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full z-0"></div>
                  <div className="w-12 h-12 bg-white/10 text-yellow-400 rounded-xl flex items-center justify-center border border-white/5 shrink-0 relative z-10"><Star size={24} className="fill-yellow-400"/></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rata-Rata Rating</p>
                    <p className="text-xl font-black text-white mt-0.5">{stats.average} <span className="text-sm font-bold text-slate-500">/ 5.0</span></p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shrink-0"><BarChart size={24}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating Sempurna</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{stats.fiveStars} <span className="text-sm font-bold text-slate-400">Ulasan</span></p>
                  </div>
                </div>
              </div>

              {/* Area Daftar Ulasan */}
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 flex flex-col flex-grow overflow-hidden">
                
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">Arsip Publikasi</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Kelola testimoni yang tampil di beranda utama.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" placeholder="Cari isi atau nama..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-56 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select 
                        value={filterRating} onChange={(e) => setFilterRating(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="Semua">Semua Bintang</option>
                        <option value="5">Bintang 5</option>
                        <option value="4">Bintang 4</option>
                        <option value="3">Bintang 3</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-slate-50/50">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <span className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></span>
                      <p className="text-slate-500 font-bold animate-pulse">Memuat arsip ulasan...</p>
                    </div>
                  ) : filteredReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col relative group h-full">
                          
                          {/* Aksen Quote Background */}
                          <Quote className="absolute top-6 right-6 text-slate-100 z-0 rotate-12" size={60} />
                          
                          {/* Tombol Hapus */}
                          <button 
                            onClick={() => handleDelete(review.id, review.name)}
                            className="absolute top-4 right-4 z-20 p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-600 shadow-sm"
                            title="Hapus Ulasan"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="relative z-10 flex gap-1 mb-4">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                              <Star key={i} size={16} className="text-slate-200" />
                            ))}
                          </div>
                          
                          <p className="relative z-10 text-sm text-slate-700 italic mb-8 flex-grow leading-relaxed font-medium">"{review.content}"</p>
                          
                          <div className="relative z-10 flex items-center gap-4 mt-auto pt-5 border-t border-slate-100">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 font-black rounded-full flex items-center justify-center text-lg border border-emerald-100 shadow-sm">
                              {review.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-base font-black text-slate-900 leading-tight">{review.name}</h4>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{review.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center px-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <AlertCircle size={40} className="text-slate-300" />
                      </div>
                      <h3 className="text-lg font-black text-slate-800 mb-2">Tidak Ada Ulasan</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-md">Arsip kosong atau tidak ada hasil yang cocok dengan filter pencarian Anda.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}