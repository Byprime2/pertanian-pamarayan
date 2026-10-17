"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  Package, Plus, Search, Filter, Trash2, Edit, 
  Archive, AlertCircle, ArrowLeft, Leaf, Droplets, Shield, PenTool
} from 'lucide-react'

export default function GudangPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('Pupuk')
  const [stock, setStock] = useState('')
  const [unit, setUnit] = useState('Kg')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Semua')

  // 1. Fetch Data Awal
  const fetchMaterials = async () => {
    const { data } = await supabase
      .from('raw_materials')
      .select('*')
      .order('last_updated', { ascending: false })
    
    if (data) setMaterials(data)
    setLoading(false)
  }

  // 2. Efek Real-Time & Mount
  useEffect(() => {
    fetchMaterials()

    // Langganan Realtime: Tabel otomatis update jika ada perubahan dari admin lain
    const channel = supabase
      .channel('gudang-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raw_materials' }, () => {
        fetchMaterials()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // 3. Fungsi Tambah Barang
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Insert ke tabel gudang
      const { error } = await supabase.from('raw_materials').insert([{
        item_name: itemName, 
        category, 
        stock_quantity: Number(stock), 
        unit,
        last_updated: new Date().toISOString()
      }])
      
      if (error) throw error

      // Tembak Notifikasi Otomatis ke Navbar
      await supabase.from('notifications').insert([{
        title: 'Update Stok Gudang',
        description: `${stock} ${unit} ${itemName} (${category}) telah ditambahkan ke gudang.`,
      }])

      // Reset Form
      setItemName('')
      setStock('')
      // fetchMaterials tidak perlu dipanggil karena Real-Time sudah mengatasinya
    } catch (error: any) {
      alert('Gagal menambah barang: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. Fungsi Hapus Barang
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${name} dari gudang?`)) {
      await supabase.from('raw_materials').delete().eq('id', id)
      // Real-time otomatis menghapus dari tampilan
    }
  }

  // 5. Logika Pencarian & Filter Cerdas
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'Semua' || m.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Ikon Kategori Dinamis
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Pupuk': return <Leaf size={14} className="text-emerald-600" />
      case 'Bibit': return <Droplets size={14} className="text-blue-600" />
      case 'Pestisida': return <Shield size={14} className="text-red-600" />
      case 'Alat': return <PenTool size={14} className="text-amber-600" />
      default: return <Package size={14} />
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      <div className="flex-grow">
        
        {/* HERO HEADER - KONSISTEN DENGAN TEMA ADMIN */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden bg-slate-950">
          <img 
            src="/Photos/1.jpeg" 
            alt="Latar Belakang Gudang" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-30 animate-[kenburns_20s_ease-in-out_infinite_alternate]" 
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
                    Fasilitas Logistik
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md flex items-center gap-3">
                    <Package className="hidden md:block text-emerald-400" size={40} />
                    Gudang Material
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base font-medium mt-2 leading-relaxed max-w-2xl">
                    Pusat kendali manajemen stok logistik, pupuk, bibit, dan aset perlengkapan tani Pertanian Pamarayan.
                  </p>
                </div>
              </div>

              {/* Status Mini Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl w-full md:w-auto">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <Archive size={24} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Total Item Tersimpan</p>
                  <p className="text-2xl font-black text-white">{materials.length} <span className="text-sm font-medium text-slate-400">Jenis Barang</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AREA KONTEN UTAMA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-24">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* KOLOM KIRI: FORM INPUT (Sticky Mode) */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 overflow-hidden sticky top-28">
                <div className="bg-slate-900 p-6 flex items-center gap-3">
                  <Plus size={24} className="text-emerald-400" />
                  <h2 className="text-lg font-black text-white">Registrasi Barang</h2>
                </div>
                
                <form onSubmit={handleAddMaterial} className="p-6 md:p-8 space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Nama Barang</label>
                    <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-inner" 
                      placeholder="Contoh: Pupuk NPK Mutiara" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Kategori</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none cursor-pointer">
                        <option value="Pupuk">Pupuk</option>
                        <option value="Bibit">Bibit</option>
                        <option value="Pestisida">Pestisida</option>
                        <option value="Alat">Alat Tani</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Satuan</label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none cursor-pointer">
                        <option value="Kg">Kilogram (Kg)</option>
                        <option value="Liter">Liter (L)</option>
                        <option value="Karung">Karung</option>
                        <option value="Unit">Unit/Pcs</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Stok Awal</label>
                    <input type="number" required min="0" value={stock} onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner" 
                      placeholder="0" 
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <><Plus size={18} /> Simpan Ke Gudang</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* KOLOM KANAN: TABEL DATABASE CERDAS */}
            <div className="xl:col-span-8">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col h-full">
                
                {/* Header Tabel & Fitur Filter */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Database Inventaris</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Kelola pergerakan aset dan ketersediaan stok operasional.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Kotak Pencarian */}
                    <div className="relative w-full sm:w-auto">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Cari barang..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      />
                    </div>
                    {/* Filter Kategori */}
                    <div className="relative w-full sm:w-auto">
                      <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="Semua">Semua Kategori</option>
                        <option value="Pupuk">Pupuk</option>
                        <option value="Bibit">Bibit</option>
                        <option value="Pestisida">Pestisida</option>
                        <option value="Alat">Alat Tani</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Area Tabel */}
                <div className="p-0 overflow-x-auto flex-grow">
                  {loading ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                       <span className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></span>
                       <p className="text-slate-500 font-bold animate-pulse">Menghubungkan ke Server Logistik...</p>
                     </div>
                  ) : filteredMaterials.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-white border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-black">
                          <th className="px-6 py-5">Nama Material</th>
                          <th className="px-6 py-5">Kategori</th>
                          <th className="px-6 py-5 text-right">Sisa Stok</th>
                          <th className="px-6 py-5">Pembaruan Terakhir</th>
                          <th className="px-6 py-5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredMaterials.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-900 text-sm">{m.item_name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                                ${m.category === 'Pupuk' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                  m.category === 'Bibit' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                  m.category === 'Pestisida' ? 'bg-red-50 text-red-700 border-red-200' : 
                                  'bg-amber-50 text-amber-700 border-amber-200'}
                              `}>
                                {getCategoryIcon(m.category)}
                                {m.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`text-lg font-black ${m.stock_quantity <= 10 ? 'text-red-600' : 'text-slate-800'}`}>
                                  {m.stock_quantity}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{m.unit}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold text-slate-600">
                                {new Date(m.last_updated).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(m.last_updated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => handleDelete(m.id, m.item_name)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 md:opacity-0"
                                title="Hapus Barang"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <AlertCircle size={40} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">Tidak ada material ditemukan</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Coba sesuaikan filter pencarian atau tambahkan barang baru.</p>
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