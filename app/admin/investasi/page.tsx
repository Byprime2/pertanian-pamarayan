"use client"

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  Plus, Wallet, ArrowRight, User, Box, ArrowLeft, 
  Search, Landmark, TrendingUp, Users, ShieldCheck, 
  Building2, CheckCircle2, X 
} from 'lucide-react'

export default function DaftarInvestorPage() {
  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State Pencarian
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const { data: invData } = await supabase.from('investors').select('*').order('created_at', { ascending: true })
    const { data: ledgerData } = await supabase.from('cash_ledger').select('*')
    const { data: assetData } = await supabase.from('physical_assets').select('*')

    if (invData) {
      const aggregated = invData.map(inv => {
        const invLedger = ledgerData?.filter(l => l.investor_id === inv.id) || []
        const invAssets = assetData?.filter(a => a.investor_id === inv.id) || []
        
        let totalPemasukan = 0
        let totalPengeluaran = 0
        
        invLedger.forEach(l => {
          if (l.type === 'PEMASUKAN') totalPemasukan += Number(l.amount)
          if (l.type === 'PENGELUARAN') totalPengeluaran += Number(l.amount)
        })

        return {
          ...inv,
          saldo: totalPemasukan - totalPengeluaran,
          total_aset: invAssets.length
        }
      })
      setInvestors(aggregated)
    }
    setLoading(false)
  }

  // Efek Real-Time & Mount
  useEffect(() => {
    fetchData()

    // Dengarkan perubahan pada 3 tabel sekaligus agar saldo selalu akurat
    const channel = supabase.channel('investor-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_ledger' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'physical_assets' }, () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAddInvestor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('investors').insert([{ name: newName }])
      if (error) throw error

      // Auto Notifikasi
      await supabase.from('notifications').insert([{
        title: 'Mitra Investor Baru',
        description: `Entitas investor ${newName} telah ditambahkan ke dalam sistem portofolio.`,
      }])

      setNewName('')
      setShowModal(false)
      // fetchData() otomatis dipanggil oleh realtime channel
    } catch (error: any) {
      alert('Gagal menambah investor: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Kalkulasi KPI Global
  const stats = useMemo(() => {
    let totalAUM = 0
    let totalAssets = 0
    investors.forEach(inv => {
      totalAUM += inv.saldo
      totalAssets += inv.total_aset
    })
    return {
      totalInvestors: investors.length,
      totalAUM,
      totalAssets
    }
  }, [investors])

  // Filter Pencarian
  const filteredInvestors = investors.filter(inv => 
    inv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      
      <div className="flex-grow">
        
        {/* HERO HEADER - TEMA FINANSIAL / CORPORATE */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden bg-slate-950">
          <img 
            src="/Photos/5.jpeg" 
            alt="Latar Belakang Finansial" 
            onError={(e) => e.currentTarget.src = "/Photos/1.jpeg"}
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 animate-[kenburns_20s_ease-in-out_infinite_alternate]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-slate-950/80 to-slate-50/10 z-0"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin" className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-lg active:scale-95 shrink-0">
                  <ArrowLeft size={22} />
                </Link>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-blue-500/25 text-blue-300 backdrop-blur-sm text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-2.5 uppercase tracking-wider border border-blue-500/20 shadow-sm">
                    Manajemen Keuangan
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md flex items-center gap-3">
                    <Landmark className="hidden md:block text-blue-400" size={40} />
                    Daftar Investor
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base font-medium mt-2 leading-relaxed max-w-2xl">
                    Pusat kendali ekuitas, pemantauan saldo portofolio (AUM), dan aset fisik mitra secara komprehensif.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AREA KONTEN UTAMA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
          
          {/* KPI DASHBOARD GLOBAL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Portofolio / AUM */}
            <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 text-blue-400 rounded-2xl border border-white/5"><TrendingUp size={24} /></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Dana Terkelola</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-white tracking-tight"><span className="text-lg font-medium text-slate-500 mr-1">Rp</span>{stats.totalAUM.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Total Investor */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/80 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl border border-blue-100"><Users size={24} /></div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Mitra Investor</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-slate-900">{stats.totalInvestors} <span className="text-base font-bold text-slate-400">Entitas</span></p>
              </div>
            </div>
            
            {/* Total Aset Fisik */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/80 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100/50 text-amber-600 rounded-2xl border border-amber-100"><Box size={24} /></div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Akumulasi Aset Fisik</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-slate-900">{stats.totalAssets} <span className="text-base font-bold text-slate-400">Item</span></p>
              </div>
            </div>
          </div>

          {/* KONTROL PENCARIAN & TAMBAH */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari portofolio investor..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner" 
              />
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-500/50"
            >
              <Plus size={18} /> Daftarkan Entitas Baru
            </button>
          </div>

          {/* GRID KARTU INVESTOR */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></span>
              <p className="text-slate-500 font-bold animate-pulse">Menghitung kalkulasi portofolio...</p>
            </div>
          ) : filteredInvestors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvestors.map((inv) => (
                <Link href={`/admin/investasi/${inv.id}`} key={inv.id} className="group bg-white rounded-[2rem] border border-slate-200/80 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden p-6 md:p-8">
                  
                  {/* Aksen Hiasan Sudut */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
                  
                  <div className="relative z-10 flex items-start gap-4 mb-8">
                    <div className="w-14 h-14 bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-700 transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldCheck size={10}/> Portofolio Ekuitas</p>
                      <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{inv.name}</h3>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto space-y-3">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-1 group-hover:border-blue-200 transition-colors shadow-inner">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Wallet size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Saldo Likuid (Kas)</span>
                      </div>
                      <span className={`text-2xl font-black tracking-tight ${inv.saldo < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        Rp {inv.saldo.toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <div className={`p-4 rounded-2xl border flex justify-between items-center transition-colors ${inv.total_aset > 0 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      <div className="flex items-center gap-2">
                        <Box size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Kepemilikan Aset</span>
                      </div>
                      <span className="text-base font-black">{inv.total_aset} Item</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-blue-600 font-bold text-xs uppercase tracking-widest group-hover:text-blue-700">
                    Buka Rincian Buku Kas <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-xl">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Users size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Entitas Investor Kosong</h3>
              <p className="text-sm font-medium text-slate-500">Gunakan fitur pendaftaran untuk menambahkan mitra baru.</p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          MODAL: TAMBAH INVESTOR BARU 
      ========================================= */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><User size={18} className="text-blue-500"/> Entitas Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-2 bg-white rounded-full shadow-sm border border-slate-200"><X size={18}/></button>
            </div>
            
            <div className="p-6 md:p-8">
              <form onSubmit={handleAddInvestor} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Nama Lengkap / Instansi</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="text" required placeholder="Contoh: Bpk. Prima Aditya"
                      value={newName} onChange={e => setNewName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-bold text-slate-900 text-sm shadow-inner transition-all" 
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} 
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors uppercase tracking-widest">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting} 
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-black shadow-lg shadow-blue-600/20 transition-all text-sm uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSubmitting ? 'Memproses...' : <><CheckCircle2 size={18}/> Simpan</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}