"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  Users, UserPlus, Search, Filter, Trash2, 
  ArrowLeft, HardHat, Banknote, Briefcase, // <-- BadgeDollar diganti Banknote
  CalendarClock, ShieldCheck, AlertCircle, CheckCircle2 
} from 'lucide-react'
export default function SDMPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Petani Harian')
  const [wage, setWage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('Semua')

  // KPI Stats
  const [stats, setStats] = useState({ totalWorkers: 0, totalDailyWage: 0, totalMandor: 0 })

  const fetchWorkers = async () => {
    setLoading(true)
    const { data } = await supabase.from('workers').select('*').order('join_date', { ascending: false })
    
    if (data) {
      setWorkers(data)
      
      // Hitung KPI
      const totalW = data.length
      const totalWages = data.reduce((acc, curr) => acc + (Number(curr.daily_wage) || 0), 0)
      const mandors = data.filter(w => w.role.toLowerCase().includes('mandor')).length
      
      setStats({ totalWorkers: totalW, totalDailyWage: totalWages, totalMandor: mandors })
    }
    setLoading(false)
  }

  // Efek Real-Time & Mount
  useEffect(() => {
    fetchWorkers()

    const channel = supabase.channel('sdm-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
        fetchWorkers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Fungsi Tambah Personil
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.from('workers').insert([{
        full_name: fullName, 
        role, 
        daily_wage: Number(wage),
        join_date: new Date().toISOString()
      }])
      
      if (error) throw error

      // Auto-Trigger Notifikasi
      await supabase.from('notifications').insert([{
        title: 'Personil Baru Ditambahkan',
        description: `${fullName} telah bergabung ke tim sebagai ${role}.`,
      }])

      setFullName('')
      setWage('')
      // fetchWorkers() ditangani oleh realtime
    } catch (error: any) {
      alert('Gagal menambah pekerja: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fungsi Hapus Personil
  const handleDeleteWorker = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin memberhentikan/menghapus data ${name} dari sistem?`)) {
      await supabase.from('workers').delete().eq('id', id)
      
      // Auto-Trigger Notifikasi
      await supabase.from('notifications').insert([{
        title: 'Pembaruan Status Personil',
        description: `Data pekerja atas nama ${name} telah dihapus dari sistem.`,
      }])
    }
  }

  // Logika Filter & Pencarian
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'Semua' || w.role === filterRole
    return matchesSearch && matchesRole
  })

  // Dynamic Badge Color mapping
  const getRoleBadge = (roleName: string) => {
    if (roleName.includes('Mandor')) return 'bg-amber-100 text-amber-800 border-amber-200'
    if (roleName.includes('Operator')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (roleName.includes('Gudang')) return 'bg-purple-100 text-purple-800 border-purple-200'
    return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      <div className="flex-grow">
        
        {/* HERO HEADER */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden bg-slate-950">
          <img 
            src="/Photos/4.jpeg" 
            alt="Latar Belakang SDM" 
            onError={(e) => e.currentTarget.src = "/Photos/2.jpeg"} // Fallback image
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-30 animate-[kenburns_20s_ease-in-out_infinite_alternate]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-slate-950/70 to-slate-50/10 z-0"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin" className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-lg active:scale-95 shrink-0">
                  <ArrowLeft size={22} />
                </Link>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-indigo-500/25 text-indigo-300 backdrop-blur-sm text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-2.5 uppercase tracking-wider border border-indigo-500/20 shadow-sm">
                    Manajemen Operasional
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md flex items-center gap-3">
                    <Users className="hidden md:block text-indigo-400" size={40} />
                    SDM & Tenaga Kerja
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base font-medium mt-2 leading-relaxed max-w-2xl">
                    Database personil, struktur operasional lapangan, dan kalkulasi parameter upah harian secara terpusat.
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
                  <UserPlus size={24} className="text-indigo-400" />
                  <h2 className="text-lg font-black text-white">Registrasi Personil</h2>
                </div>
                
                <form onSubmit={handleAddWorker} className="p-6 md:p-8 space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Nama Lengkap Pekerja</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-inner" 
                      placeholder="Contoh: Asep Sunandar" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Posisi / Jabatan</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select value={role} onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none shadow-inner cursor-pointer">
                        <option value="Petani Harian">Petani Harian</option>
                        <option value="Mandor Lapangan">Mandor Lapangan</option>
                        <option value="Operator Traktor">Operator Traktor</option>
                        <option value="Penjaga Gudang">Penjaga Gudang</option>
                        <option value="Teknisi Irigasi">Teknisi Irigasi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Upah Harian (Rp)</label>
                    <div className="relative">
                      <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="number" required min="0" value={wage} onChange={(e) => setWage(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-indigo-700 font-black text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner" 
                        placeholder="100000" 
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <><CheckCircle2 size={18} /> Daftarkan Pekerja</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* KANAN: DIREKTORI & KPI */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* KPI Cards Mini */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-16 h-16 bg-indigo-50 rounded-bl-full z-0 group-hover:scale-110 transition-transform"></div>
                  <div className="w-12 h-12 bg-indigo-100/50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0 relative z-10"><Users size={24}/></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pekerja</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalWorkers} <span className="text-sm font-bold text-slate-400">Orang</span></p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-16 h-16 bg-amber-50 rounded-bl-full z-0 group-hover:scale-110 transition-transform"></div>
                  <div className="w-12 h-12 bg-amber-100/50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shrink-0 relative z-10"><HardHat size={24}/></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandor Lapangan</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalMandor} <span className="text-sm font-bold text-slate-400">Orang</span></p>
                  </div>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-500/10 rounded-bl-full z-0"></div>
                  <div className="w-12 h-12 bg-white/10 text-indigo-400 rounded-xl flex items-center justify-center border border-white/5 shrink-0 relative z-10"><Banknote size={24}/></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beban Upah/Hari</p>
                    <p className="text-xl font-black text-white mt-0.5">Rp {stats.totalDailyWage.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              {/* Area Direktori */}
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 flex flex-col flex-grow">
                
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-[2rem]">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">Direktori Personil Aktif</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Daftar lengkap tenaga kerja dan rincian operasional.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Cari nama pekerja..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-56 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select 
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="Semua">Semua Peran</option>
                        <option value="Petani Harian">Petani Harian</option>
                        <option value="Mandor Lapangan">Mandor Lapangan</option>
                        <option value="Operator Traktor">Operator Traktor</option>
                        <option value="Penjaga Gudang">Penjaga Gudang</option>
                        <option value="Teknisi Irigasi">Teknisi Irigasi</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
                      <p className="text-slate-500 font-bold animate-pulse">Memuat database SDM...</p>
                    </div>
                  ) : filteredWorkers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredWorkers.map((w) => (
                        <div key={w.id} className="p-5 border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-xl transition-all bg-white group flex flex-col justify-between h-full relative overflow-hidden">
                          
                          {/* Garis Aksen Samping */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getRoleBadge(w.role).split(' ')[0]}`}></div>

                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-slate-100 text-slate-500 border border-slate-200 rounded-full flex items-center justify-center text-xl font-black shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-700 transition-colors">
                              {w.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="w-full">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-black text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">{w.full_name}</h3>
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md mt-1 border ${getRoleBadge(w.role)}`}>
                                    {w.role.includes('Mandor') && <ShieldCheck size={10} />}
                                    {w.role}
                                  </span>
                                </div>
                                {/* Tombol Hapus - Muncul saat di hover */}
                                <button 
                                  onClick={() => handleDeleteWorker(w.id, w.full_name)}
                                  className="text-slate-300 hover:text-red-500 p-2 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 opacity-100 md:opacity-0 group-hover:opacity-100"
                                  title="Berhentikan / Hapus Pekerja"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-auto">
                            <div>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Kesepakatan Upah</p>
                              <p className="font-black text-lg text-indigo-600 flex items-center gap-1">
                                Rp {w.daily_wage.toLocaleString('id-ID')}
                                <span className="text-[10px] text-slate-400 font-bold">/ Hari</span>
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              <CalendarClock size={12} />
                              Join: {new Date(w.join_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-sm border border-slate-100">
                        <AlertCircle size={40} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">Direktori Kosong</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Personil tidak ditemukan atau pencarian tidak cocok.</p>
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