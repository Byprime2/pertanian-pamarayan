"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  ArrowLeft, ShoppingCart, TrendingUp, Search, Receipt, 
  Users, CheckCircle2, AlertCircle, PackageCheck, Wallet, Banknote, CalendarClock
} from 'lucide-react'

export default function PenjualanPage() {
  const [sales, setSales] = useState<any[]>([])
  const [availableHarvests, setAvailableHarvests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State Form
  const [buyerName, setBuyerName] = useState('')
  const [selectedCrop, setSelectedCrop] = useState('')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('Lunas')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // State Pencarian & KPI
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ totalRevenue: 0, totalVolume: 0, activeBuyers: 0 })

  const totalTagihan = (Number(qty) || 0) * (Number(price) || 0)

  const fetchData = async () => {
    setLoading(true)
    
    // 1. Ambil riwayat penjualan
    const { data: salesData } = await supabase.from('sales').select('*').order('sale_date', { ascending: false })
    if (salesData) {
      setSales(salesData)
      
      // Kalkulasi KPI
      let revenue = 0, volume = 0
      const buyers = new Set()
      salesData.forEach(s => {
        revenue += Number(s.total_revenue || 0)
        volume += Number(s.quantity_sold || 0)
        if (s.buyer_name) buyers.add(s.buyer_name.toLowerCase())
      })
      setStats({ totalRevenue: revenue, totalVolume: volume, activeBuyers: buyers.size })
    }
    
    // 2. Ambil komoditas yang ADA stoknya
    const { data: crops } = await supabase.from('harvests').select('*').gt('remaining_kg', 0).order('crop_name')
    if (crops) {
      // Kelompokkan stok jika ada nama komoditas yang sama (Agregasi)
      const groupedCrops = crops.reduce((acc, curr) => {
        if (!acc[curr.crop_name]) acc[curr.crop_name] = 0
        acc[curr.crop_name] += curr.remaining_kg
        return acc
      }, {})

      const formattedCrops = Object.keys(groupedCrops).map(name => ({
        crop_name: name,
        total_remaining: groupedCrops[name]
      }))

      setAvailableHarvests(formattedCrops)
      if(formattedCrops.length > 0 && !selectedCrop) setSelectedCrop(formattedCrops[0].crop_name)
    }
    setLoading(false)
  }

  // Efek Real-Time & Mount
  useEffect(() => {
    fetchData()

    const channel = supabase.channel('sales-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'harvests' }, () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    const qtyToDeduct = Number(qty)

    try {
      // Cek total stok agregat terlebih dahulu
      const cropStock = availableHarvests.find(c => c.crop_name === selectedCrop)
      if (!cropStock || cropStock.total_remaining < qtyToDeduct) {
        throw new Error(`Stok ${selectedCrop} tidak mencukupi! Sisa stok gabungan: ${cropStock?.total_remaining || 0} Kg.`)
      }

      // Logika FIFO (First In First Out) untuk memotong stok dari batch yang paling lama
      const { data: harvestBatches } = await supabase
        .from('harvests')
        .select('*')
        .eq('crop_name', selectedCrop)
        .gt('remaining_kg', 0)
        .order('harvest_date', { ascending: true })

      if (!harvestBatches || harvestBatches.length === 0) throw new Error('Data batch panen tidak ditemukan.')

      let remainingToDeduct = qtyToDeduct

      // Potong stok secara berurutan
      for (const batch of harvestBatches) {
        if (remainingToDeduct <= 0) break;

        const deductAmount = Math.min(batch.remaining_kg, remainingToDeduct)
        const { error: deductError } = await supabase
          .from('harvests')
          .update({ remaining_kg: batch.remaining_kg - deductAmount })
          .eq('id', batch.id)

        if (deductError) throw new Error('Sistem gagal memotong stok gudang.')
        remainingToDeduct -= deductAmount
      }

      // Catat Transaksi Penjualan
      const { error: salesError } = await supabase.from('sales').insert([{
        buyer_name: buyerName, 
        commodity: selectedCrop, 
        quantity_sold: qtyToDeduct, 
        price_per_kg: Number(price), 
        total_revenue: totalTagihan, 
        status
      }])

      if (salesError) throw salesError

      // Kirim Notifikasi Sistem
      await supabase.from('notifications').insert([{
        title: 'Faktur Penjualan Baru',
        description: `Rp ${totalTagihan.toLocaleString('id-ID')} - ${qtyToDeduct} Kg ${selectedCrop} terjual kepada ${buyerName}.`,
      }])

      setBuyerName(''); setQty(''); setPrice('');
      alert('Transaksi berhasil! Faktur tersimpan dan stok otomatis terpotong.')

    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter Pencarian Riwayat
  const filteredSales = sales.filter(s => 
    s.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.commodity.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      <div className="flex-grow">
        
        {/* HERO HEADER */}
        <div className="relative pt-32 pb-28 md:pt-40 md:pb-36 px-4 overflow-hidden bg-slate-950">
          <img 
            src="/Photos/3.jpeg" 
            alt="Latar Belakang Distribusi" 
            onError={(e) => e.currentTarget.src = "/Photos/1.jpeg"}
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 animate-[kenburns_20s_ease-in-out_infinite_alternate]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-50/10 z-0"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin" className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg active:scale-95 shrink-0">
                  <ArrowLeft size={22} />
                </Link>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/25 text-emerald-300 backdrop-blur-sm text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-2.5 uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                    Modul Transaksi
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md flex items-center gap-3">
                    <ShoppingCart className="hidden md:block text-emerald-400" size={40} />
                    Distribusi & Penjualan
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base font-medium mt-2 leading-relaxed max-w-2xl">
                    Pusat pembuatan faktur, pelacakan omset, dan pengeluaran barang keluar. Transaksi di sini otomatis menyinkronkan stok gudang menggunakan metode FIFO.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AREA KONTEN UTAMA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* KIRI: FORMULIR FAKTUR (Sticky) */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 overflow-hidden sticky top-28">
                <div className="bg-slate-900 p-6 flex items-center gap-3">
                  <Receipt size={24} className="text-emerald-400" />
                  <h2 className="text-lg font-black text-white">Buat Faktur Baru</h2>
                </div>
                
                <form onSubmit={handleAddSale} className="p-6 md:p-8 space-y-6">
                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200 flex items-start gap-2 shadow-inner">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Tengkulak / Pembeli</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" required value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900 text-sm transition-all shadow-inner" 
                        placeholder="Nama entitas pembeli..." 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Komoditas Gudang</label>
                    <div className="relative">
                      <PackageCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select required value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-slate-900 text-sm appearance-none transition-all shadow-inner cursor-pointer">
                        {availableHarvests.length === 0 ? (
                          <option value="">-- Gudang Kosong --</option>
                        ) : (
                          availableHarvests.map((h, idx) => (
                            <option key={idx} value={h.crop_name}>
                              {h.crop_name} (Sisa: {h.total_remaining} Kg)
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Volume (Kg)</label>
                      <input type="number" required min="1" value={qty} onChange={(e) => setQty(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-lg text-slate-900 text-center transition-all shadow-inner" 
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Harga/Kg (Rp)</label>
                      <input type="number" required min="1" value={price} onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-lg text-emerald-600 text-center transition-all shadow-inner" 
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  {/* Kalkulator Real-time */}
                  <div className="bg-slate-900 text-white p-5 rounded-xl flex justify-between items-center shadow-lg border border-slate-800 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full z-0"></div>
                    <div className="relative z-10 flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimasi Tagihan</span>
                      <span className="text-2xl font-black text-emerald-400">Rp {totalTagihan.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Status Pembayaran</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-sm text-slate-800 cursor-pointer shadow-inner">
                      <option value="Lunas">Lunas (Selesai)</option>
                      <option value="Piutang">Piutang (Belum Bayar)</option>
                    </select>
                  </div>

                  <button type="submit" disabled={isSubmitting || availableHarvests.length === 0}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <><CheckCircle2 size={18} /> Cetak Faktur & Potong Stok</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* KANAN: DASHBOARD KPI & TABEL RIWAYAT */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* KPI Cards Mini */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0"><Wallet size={24}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Omset</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shrink-0"><TrendingUp size={24}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Terjual</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalVolume.toLocaleString('id-ID')} <span className="text-sm font-bold text-slate-400">Kg</span></p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shrink-0"><Users size={24}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mitra Aktif</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{stats.activeBuyers} <span className="text-sm font-bold text-slate-400">Entitas</span></p>
                  </div>
                </div>
              </div>

              {/* Tabel Riwayat */}
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col h-full">
                
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">Riwayat Transaksi</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Daftar arsip seluruh faktur penjualan.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari pembeli atau komoditas..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="p-0 overflow-x-auto flex-grow">
                  {loading ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                       <span className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></span>
                       <p className="text-slate-500 font-bold animate-pulse">Menyelaraskan data pembukuan...</p>
                     </div>
                  ) : filteredSales.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-white border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-black">
                          <th className="px-6 py-5">Faktur / Pembeli</th>
                          <th className="px-6 py-5">Rincian Komoditas</th>
                          <th className="px-6 py-5">Total Tagihan</th>
                          <th className="px-6 py-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredSales.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-black text-sm text-slate-900 flex items-center gap-1.5"><Users size={14} className="text-slate-400"/> {s.buyer_name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1"><CalendarClock size={12}/> {new Date(s.sale_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-black text-sm text-slate-800">{s.commodity}</p>
                              <p className="text-xs text-slate-500 font-bold mt-1">
                                <span className="text-slate-700">{s.quantity_sold} Kg</span> @ Rp {s.price_per_kg.toLocaleString('id-ID')}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-black text-lg text-emerald-600 flex items-center gap-1"><Banknote size={16}/> Rp {s.total_revenue.toLocaleString('id-ID')}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                                s.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Receipt size={40} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">Tidak ada transaksi ditemukan</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Arsip kosong atau pencarian tidak cocok.</p>
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