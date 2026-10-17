"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  ArrowLeft, Plus, Sprout, Package, ShoppingCart, 
  TrendingUp, Search, Calendar, History, X, 
  CheckCircle2, DollarSign, Users, Tag, Trash2, Leaf
} from 'lucide-react'

export default function ManajemenPanenPage() {
  const [harvests, setHarvests] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // State Pencarian & Statistik
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ totalProduksi: 0, stokTersedia: 0, totalPendapatan: 0 })

  // State Modal Form Panen
  const [showHarvestModal, setShowHarvestModal] = useState(false)
  const [cropName, setCropName] = useState('')
  const [totalKg, setTotalKg] = useState('')
  const [harvestDate, setHarvestDate] = useState('')
  
  // State Modal Form Penjualan
  const [activeSaleHarvest, setActiveSaleHarvest] = useState<any>(null)
  const [buyerName, setBuyerName] = useState('')
  const [sellQty, setSellQty] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State Toggle Riwayat
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)

  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true)
    const { data: hData } = await supabase.from('harvests').select('*').order('created_at', { ascending: false })
    const { data: sData } = await supabase.from('sales').select('*').order('created_at', { ascending: false })

    if (hData) setHarvests(hData)
    if (sData) setSales(sData)

    // Kalkulasi KPI
    let tProd = 0, stok = 0, tPendapatan = 0;
    hData?.forEach(h => {
      tProd += Number(h.total_kg || 0)
      stok += Number(h.remaining_kg || 0)
    })
    sData?.forEach(s => {
      tPendapatan += Number(s.total_revenue || 0)
    })
    
    setStats({ totalProduksi: tProd, stokTersedia: stok, totalPendapatan: tPendapatan })
    setLoading(false)
  }

  // 2. Efek Real-Time & Mount
  useEffect(() => {
    fetchData()

    // Langganan Realtime: Tabel otomatis update jika ada perubahan (Panen atau Penjualan)
    const channel = supabase.channel('panen-sales-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'harvests' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter logika pencarian
  const filteredHarvests = harvests.filter(h => 
    h.crop_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 3. Fungsi Registrasi Panen Baru
  const handleAddHarvest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.from('harvests').insert([{
        crop_name: cropName,
        total_kg: Number(totalKg),
        remaining_kg: Number(totalKg), 
        harvest_date: harvestDate
      }])

      if (error) throw error

      // Auto-Trigger Notifikasi
      await supabase.from('notifications').insert([{
        title: 'Hasil Panen Baru Terdaftar',
        description: `Sebanyak ${totalKg} Kg ${cropName} telah didaftarkan dan masuk ke gudang panen.`,
      }])

      setShowHarvestModal(false)
      setCropName(''); setTotalKg(''); setHarvestDate('')
    } catch (error: any) {
      alert("Gagal menyimpan data: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. Fungsi Catat Penjualan
  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSaleHarvest) return
    
    const qty = Number(sellQty)
    const price = Number(pricePerKg)
    const total = qty * price

    if (qty > activeSaleHarvest.remaining_kg) {
      alert(`Stok tidak cukup! Sisa stok hanya ${activeSaleHarvest.remaining_kg} Kg.`)
      return
    }

    setIsSubmitting(true)
    
    try {
      // Catat Penjualan
      const { error: saleError } = await supabase.from('sales').insert([{
        harvest_id: activeSaleHarvest.id,
        commodity: activeSaleHarvest.crop_name, 
        buyer_name: buyerName,
        quantity_sold: qty, 
        price_per_kg: price,
        total_revenue: total, 
        status: 'Lunas' 
      }])

      if (saleError) throw saleError

      // Kurangi Stok Panen
      const newRemaining = activeSaleHarvest.remaining_kg - qty
      await supabase.from('harvests').update({ remaining_kg: newRemaining }).eq('id', activeSaleHarvest.id)
      
      // Auto-Trigger Notifikasi
      await supabase.from('notifications').insert([{
        title: 'Transaksi Penjualan Berhasil',
        description: `${qty} Kg ${activeSaleHarvest.crop_name} telah terjual kepada ${buyerName} senilai Rp ${total.toLocaleString('id-ID')}.`,
      }])

      setActiveSaleHarvest(null)
      setBuyerName(''); setSellQty(''); setPricePerKg('')
    } catch (error: any) {
      alert("Gagal mencatat penjualan: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 5. Fungsi Hapus Panen
  const handleDeleteHarvest = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data panen ${name}? Semua riwayat penjualan terkait juga akan terhapus.`)) {
      await supabase.from('harvests').delete().eq('id', id)
      // Real-time akan mengurus pembaruan UI
    }
  }

  const getSalesForHarvest = (harvestId: string) => {
    return sales.filter(s => s.harvest_id === harvestId)
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      <div className="flex-grow">
        
        {/* HERO HEADER - TEMA ALAM & PERTANIAN */}
        <div className="relative pt-32 pb-32 md:pt-40 md:pb-40 px-4 overflow-hidden bg-slate-950">
          <img 
            src="/Photos/2.jpeg" 
            alt="Latar Belakang Ladang Panen" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 animate-[kenburns_20s_ease-in-out_infinite_alternate]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-slate-50/10 z-0"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin" className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg active:scale-95 shrink-0">
                  <ArrowLeft size={22} />
                </Link>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/25 text-emerald-300 backdrop-blur-sm text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-2.5 uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                    Pusat Rantai Pasok
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md flex items-center gap-3">
                    Logistik Panen
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base font-medium mt-2 leading-relaxed max-w-2xl">
                    Manajemen pencatatan hasil bumi, pemantauan stok komoditas, dan sirkulasi distribusi penjualan.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowHarvestModal(true)}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-3.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 border border-emerald-500/50"
              >
                <Plus size={18} /> Registrasi Panen Baru
              </button>
            </div>
          </div>
        </div>

        {/* AREA KONTEN UTAMA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-24">
          
          {/* KPI DASHBOARD CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Produksi */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/80 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl border border-emerald-100"><Sprout size={24} /></div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Produksi</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-slate-900">{stats.totalProduksi.toLocaleString('id-ID')} <span className="text-base font-bold text-slate-400">Kg</span></p>
              </div>
            </div>
            
            {/* Stok Gudang */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/80 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl border border-blue-100"><Package size={24} /></div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Sisa Stok</h3>
                  </div>
                  <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md uppercase tracking-widest border border-blue-200">Siap Jual</span>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-slate-900">{stats.stokTersedia.toLocaleString('id-ID')} <span className="text-base font-bold text-slate-400">Kg</span></p>
              </div>
            </div>

            {/* Omset Penjualan */}
            <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 text-emerald-400 rounded-2xl border border-white/5"><TrendingUp size={24} /></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Omset</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-white"><span className="text-lg font-medium text-slate-500 mr-1">Rp</span>{stats.totalPendapatan.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* FILTER & PENCARIAN */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Leaf className="text-emerald-500" size={20} /> Data Aset Panen
            </h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari komoditas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner" 
              />
            </div>
          </div>

          {/* GRID KARTU PANEN */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></span>
              <p className="text-slate-500 font-bold animate-pulse">Menyelaraskan data server...</p>
            </div>
          ) : filteredHarvests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredHarvests.map((harvest) => {
                const harvestSales = getSalesForHarvest(harvest.id);
                const isStockEmpty = harvest.remaining_kg === 0;
                const isExpanded = expandedHistory === harvest.id;
                const progressPercent = (harvest.remaining_kg / harvest.total_kg) * 100;

                return (
                  <div key={harvest.id} className={`bg-white rounded-[2rem] border shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${isStockEmpty ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200/80 hover:shadow-2xl hover:-translate-y-1'}`}>
                    
                    <div className="p-6 md:p-8 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${isStockEmpty ? 'bg-slate-200/50 text-slate-500 border-slate-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                              {isStockEmpty ? 'Stok Habis' : 'Stedia'}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{harvest.crop_name}</h3>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Calendar size={14}/> {new Date(harvest.harvest_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                        </div>
                        
                        {/* Tombol Hapus */}
                        <button onClick={() => handleDeleteHarvest(harvest.id, harvest.crop_name)} className="text-slate-300 hover:text-red-500 p-2 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors border border-slate-100 hover:border-red-100">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Progress Bar Stok */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 mt-auto">
                        <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                          <span className="text-slate-500">Sisa / Total</span>
                          <span className={isStockEmpty ? 'text-slate-900' : 'text-emerald-600'}>
                            {harvest.remaining_kg} <span className="text-slate-400">/ {harvest.total_kg} Kg</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isStockEmpty ? 'bg-slate-400' : progressPercent < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => setActiveSaleHarvest(harvest)}
                          disabled={isStockEmpty}
                          className={`flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all ${isStockEmpty ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95'}`}
                        >
                          <ShoppingCart size={18} /> Jual
                        </button>
                        <button 
                          onClick={() => setExpandedHistory(isExpanded ? null : harvest.id)}
                          className={`px-4 py-3.5 rounded-xl font-bold text-sm transition-all border flex justify-center items-center gap-2 sm:w-auto w-full shadow-sm ${isExpanded ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                        >
                          <History size={18} /> {harvestSales.length} Riwayat
                        </button>
                      </div>
                    </div>

                    {/* RIWAYAT PENJUALAN (Expandable Panel) */}
                    {isExpanded && (
                      <div className="bg-slate-50/80 border-t border-slate-100 p-6 animate-in slide-in-from-top-2 duration-300">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <DollarSign size={14} className="text-slate-400"/> Riwayat Distribusi
                        </h4>
                        
                        {harvestSales.length > 0 ? (
                          <div className="space-y-3">
                            {harvestSales.map(sale => (
                              <div key={sale.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-black text-slate-900 flex items-center gap-1.5"><Users size={14} className="text-emerald-600"/> {sale.buyer_name}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">{new Date(sale.sale_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                  </div>
                                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-md border border-emerald-100">{sale.status}</span>
                                </div>
                                <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                                  <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Volume & Harga</p>
                                    <p className="text-sm font-bold text-slate-700"><span className="text-slate-900">{sale.quantity_sold} Kg</span> <span className="text-slate-400 text-xs">(Rp {sale.price_per_kg.toLocaleString('id-ID')})</span></p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Pendapatan</p>
                                    <p className="text-sm font-black text-emerald-600">Rp {sale.total_revenue.toLocaleString('id-ID')}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500 text-xs font-bold border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                            Belum ada riwayat penjualan.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-xl">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Sprout size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Tidak ada hasil panen</h3>
              <p className="text-sm font-medium text-slate-500">Mulai registrasi panen baru untuk mencatat logistik.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB Mobile (Tambah Panen) */}
      <button 
        onClick={() => setShowHarvestModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center z-40 active:scale-95 transition-all"
      >
        <Plus size={24} />
      </button>

      {/* =========================================
          MODAL: REGISTRASI PANEN BARU 
      ========================================= */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Leaf size={18} className="text-emerald-500"/> Registrasi Panen</h2>
              <button onClick={() => setShowHarvestModal(false)} className="text-slate-400 hover:text-slate-700 p-2 bg-white rounded-full shadow-sm border border-slate-200"><X size={18}/></button>
            </div>
            
            <div className="overflow-y-auto p-6 md:p-8">
              <form onSubmit={handleAddHarvest} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Komoditas</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" required placeholder="Contoh: Jagung Manis" value={cropName} onChange={e => setCropName(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-bold text-slate-900 text-sm shadow-inner transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Volume Panen (Kg)</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="number" required min="1" placeholder="Contoh: 5000" value={totalKg} onChange={e => setTotalKg(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-black text-xl text-slate-900 shadow-inner transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Tanggal Panen</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="date" required value={harvestDate} onChange={e => setHarvestDate(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-bold text-slate-900 text-sm shadow-inner transition-all cursor-pointer" />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-black shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center gap-2 text-sm uppercase tracking-widest disabled:opacity-50">
                  {isSubmitting ? 'Memproses...' : <><CheckCircle2 size={18}/> Simpan Ke Sistem</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: CATAT TRANSAKSI PENJUALAN
      ========================================= */}
      {activeSaleHarvest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
            <div className="p-6 border-b border-emerald-100 flex justify-between items-center bg-emerald-50 shrink-0">
              <div>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest shadow-sm bg-white px-2.5 py-1 rounded-md border border-emerald-100">Form Distribusi</span>
                <h2 className="text-xl font-black text-slate-900 leading-tight mt-2">Jual {activeSaleHarvest.crop_name}</h2>
              </div>
              <button onClick={() => setActiveSaleHarvest(null)} className="text-slate-400 hover:text-slate-700 p-2 bg-white rounded-full shadow-sm border border-slate-200"><X size={18}/></button>
            </div>
            
            <div className="overflow-y-auto">
              <div className="px-6 md:px-8 pt-6 pb-2">
                 <div className="bg-slate-50 text-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-200 shadow-inner">
                   <span className="text-xs font-black uppercase tracking-widest text-slate-500">Stok Tersedia</span>
                   <span className="text-xl font-black text-emerald-600">{activeSaleHarvest.remaining_kg} <span className="text-sm font-bold text-slate-400">Kg</span></span>
                 </div>
              </div>

              <form onSubmit={handleAddSale} className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Nama Pembeli / Distributor</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" required placeholder="Contoh: PT. Makmur Jaya..." value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-bold text-slate-900 text-sm shadow-inner transition-all" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Volume Jual (Kg)</label>
                    <input type="number" required min="1" max={activeSaleHarvest.remaining_kg} placeholder="Maks: 500" value={sellQty} onChange={e => setSellQty(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-black text-xl text-slate-900 shadow-inner transition-all text-center" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Harga / Kg (Rp)</label>
                    <input type="number" required min="1" placeholder="Rp" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-black text-xl text-emerald-600 shadow-inner transition-all text-center" />
                  </div>
                </div>
                
                {/* Auto Kalkulasi Real-time */}
                {sellQty && pricePerKg && (
                  <div className="bg-slate-900 text-white p-5 rounded-xl flex justify-between items-center shadow-lg mt-6 border border-slate-800 animate-in slide-in-from-bottom-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Tagihan</span>
                    <span className="text-2xl font-black text-emerald-400">Rp {(Number(sellQty) * Number(pricePerKg)).toLocaleString('id-ID')}</span>
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-black shadow-xl shadow-emerald-600/20 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50">
                  {isSubmitting ? 'Memproses Transaksi...' : <><CheckCircle2 size={18}/> Konfirmasi Penjualan</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}