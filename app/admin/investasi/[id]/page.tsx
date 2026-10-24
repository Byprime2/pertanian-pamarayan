"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Trash2, Wallet, Box, PieChart, TrendingDown, TrendingUp, Activity, CheckCircle2, X, PlusCircle, ArrowDownRight, Tag, Receipt, Percent, ArrowUpDown } from 'lucide-react'

export default function DetailInvestorPage() {
  const { id } = useParams()
  const [investor, setInvestor] = useState<any>(null)
  const [ledger, setLedger] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State Urutan Tabel (Filter Sort)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc') // Default: Terbaru ke Terlama

  // State Global Keuangan (Untuk Kalkulasi Bagi Hasil)
  const [globalStats, setGlobalStats] = useState({ omset: 0, modalGlobal: 0 })

  // State Modal Transaksi
  const [showModalTrx, setShowModalTrx] = useState(false)
  const [txType, setTxType] = useState('PEMASUKAN_UANG')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [itemQty, setItemQty] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State Modal Alokasi Dana & Dividen
  const [selectedIncome, setSelectedIncome] = useState<any>(null)
  const [showModalDividen, setShowModalDividen] = useState(false)

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    const { data: invData } = await supabase.from('investors').select('*').eq('id', id).single()
    // Selalu ambil berurutan dari terlama ke terbaru agar perhitungan saldo akurat
    const { data: ledgerData } = await supabase.from('cash_ledger').select('*').eq('investor_id', id).order('date', { ascending: true }).order('created_at', { ascending: true })
    const { data: assetData } = await supabase.from('physical_assets').select('*').eq('investor_id', id).order('date', { ascending: false })

    const { data: allLedger } = await supabase.from('cash_ledger').select('type, amount')
    const { data: allSales } = await supabase.from('sales').select('total_revenue')

    if (allLedger && allSales) {
      const gModal = allLedger.filter(l => l.type === 'PEMASUKAN').reduce((acc, curr) => acc + Number(curr.amount), 0)
      const gOmset = allSales.reduce((acc, curr) => acc + Number(curr.total_revenue), 0)
      setGlobalStats({ omset: gOmset, modalGlobal: gModal })
    }

    if (invData) setInvestor(invData)
    if (ledgerData) setLedger(ledgerData)
    if (assetData) setAssets(assetData)
    setLoading(false)
  }

  // Kalkulasi Saldo Berjalan Investor
  let currentSaldo = 0
  let totalPemasukan = 0
  let totalPengeluaran = 0

  const processedLedger = ledger.map((item, index) => {
    const nominal = Number(item.amount || 0)
    if (item.type === 'PEMASUKAN') {
      currentSaldo += nominal
      totalPemasukan += nominal
    } else if (item.type === 'PENGELUARAN') {
      currentSaldo -= nominal
      totalPengeluaran += nominal
    }
    return { ...item, saldo: currentSaldo, rowIndex: index + 1 }
  })

  // LOGIKA SORTING (Balik array jika sortOrder = 'desc')
  const displayLedger = sortOrder === 'desc' ? [...processedLedger].reverse() : processedLedger

  const serapanPercentage = totalPemasukan > 0 ? (totalPengeluaran / totalPemasukan) * 100 : 0

  // ==========================================
  // LOGIKA BISNIS: KALKULASI DIVIDEN INDIVIDU
  // ==========================================
  const porsiSaham = globalStats.modalGlobal > 0 ? (totalPemasukan / globalStats.modalGlobal) * 100 : 0
  let pengembalianModalIndividu = 0
  let hakDividenIndividu = 0
  let isProfit = globalStats.omset > globalStats.modalGlobal

  if (isProfit) {
    pengembalianModalIndividu = totalPemasukan
    const labaBersihTotal = globalStats.omset - globalStats.modalGlobal
    const dividenPoolInvestor = labaBersihTotal * 0.5 
    hakDividenIndividu = (porsiSaham / 100) * dividenPoolInvestor
  } else {
    pengembalianModalIndividu = (porsiSaham / 100) * globalStats.omset
    hakDividenIndividu = 0
  }
  
  const totalDiterima = pengembalianModalIndividu + hakDividenIndividu

  const formatRupiah = (angka: number) => {
    const isMinus = angka < 0
    return isMinus ? `- Rp ${Math.abs(angka).toLocaleString('id-ID')}` : `Rp ${Math.abs(angka).toLocaleString('id-ID')}`
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setItemQty('')
  }

  // Submit Transaksi (Uang / Barang)
  const handleSubmitTrx = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (txType === 'PEMASUKAN_UANG' || txType === 'PENGELUARAN') {
        const type = txType === 'PEMASUKAN_UANG' ? 'PEMASUKAN' : 'PENGELUARAN'
        const payload = { investor_id: id, date, type, amount: Number(amount), description: description.toUpperCase() }
        const { error } = await supabase.from('cash_ledger').insert([payload])
        if (error) throw error
      } 
      else if (txType === 'PEMASUKAN_BARANG') {
        const totalValue = Number(amount)
        const descUpper = description.toUpperCase()
        await supabase.from('cash_ledger').insert([{ investor_id: id, date, type: 'PEMASUKAN', amount: totalValue, description: `MODAL NATURA: ${descUpper}` }])
        await supabase.from('cash_ledger').insert([{ investor_id: id, date, type: 'PENGELUARAN', amount: totalValue, description: `KONVERSI ASET: ${descUpper}` }])
        await supabase.from('physical_assets').insert([{ investor_id: id, date, item_name: descUpper, description: `${itemQty || 1} ITEM` }])
      }
      setShowModalTrx(false)
      resetForm()
      fetchData()
    } catch (err: any) { alert('Gagal: ' + err.message) } 
    finally { setIsSubmitting(false) }
  }

  // Alokasi Dana
  const handleAlokasiDana = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const payload = { 
      investor_id: id, date, type: 'PENGELUARAN', amount: Number(amount), 
      description: `${description.toUpperCase()} (ALOKASI DARI: ${selectedIncome.description})` 
    }
    const { error } = await supabase.from('cash_ledger').insert([payload])
    if (!error) { setSelectedIncome(null); resetForm(); fetchData(); } 
    else alert('Gagal: ' + error.message)
    setIsSubmitting(false)
  }

  const handleDeleteCash = async (txId: string) => {
    if (confirm('Hapus transaksi uang ini?')) { await supabase.from('cash_ledger').delete().eq('id', txId); fetchData(); }
  }
  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Hapus pencatatan barang ini?')) { await supabase.from('physical_assets').delete().eq('id', assetId); fetchData(); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface-50 font-bold text-surface-500">Memuat data...</div>
  if (!investor) return <div className="min-h-screen flex items-center justify-center bg-surface-50">Data tidak ditemukan.</div>

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col font-sans">
      
      {/* HEADER INTERNAL */}
      <div className="bg-white border-b border-surface-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/investasi" className="p-3 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors text-surface-700">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-surface-900 tracking-tight">{investor.name}</h1>
              <p className="text-sm font-bold text-surface-500 uppercase tracking-widest mt-1">Laporan Keuangan & Aset Individu</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={() => { setTxType('PEMASUKAN_UANG'); setShowModalTrx(true); }} className="flex-1 sm:flex-none bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-xl text-sm font-black transition-shadow shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 uppercase tracking-widest">
              <PlusCircle size={18} /> Catat Transaksi
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow pb-24 pt-8">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mb-12 relative">
            
            {/* BAGIAN TENGAH: TABEL UTAMA */}
            <div className="w-full lg:max-w-4xl xl:max-w-5xl bg-white rounded-3xl border border-surface-200 shadow-sm overflow-hidden flex flex-col mx-auto">
              
              <div className="p-5 md:p-6 bg-surface-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black tracking-wide text-yellow-300">LAPORAN KEUANGAN</h2>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <p className="text-xs text-surface-300 font-medium">Rekapitulasi Arus Kas Berjalan</p>
                    {/* TOMBOL FILTER / SORTING */}
                    <button 
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-surface-800 hover:bg-surface-700 px-3 py-1.5 rounded-lg transition-colors border border-surface-700 text-surface-200 hover:text-white"
                    >
                      <ArrowUpDown size={12} />
                      {sortOrder === 'desc' ? 'Terbaru ➔ Terlama' : 'Terlama ➔ Terbaru'}
                    </button>
                  </div>
                </div>
                <div className="bg-surface-800 px-4 py-2 rounded-xl border border-surface-700 text-right w-full sm:w-auto">
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Saldo Saat Ini</p>
                  <p className={`text-xl font-black tracking-tight ${currentSaldo < 0 ? 'text-red-400' : 'text-white'}`}>
                    {formatRupiah(currentSaldo)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-yellow-300 border-b-2 border-surface-900 text-xs font-black uppercase text-surface-900">
                      <th className="py-3 px-4 text-center border-r border-surface-900/20 w-12">No</th>
                      <th className="py-3 px-4 border-r border-surface-900/20 w-28">Tanggal</th>
                      <th className="py-3 px-4 text-right border-r border-surface-900/20">Pengeluaran</th>
                      <th className="py-3 px-4 text-right border-r border-surface-900/20">Pemasukan</th>
                      <th className="py-3 px-4 text-right border-r border-surface-900/20">Saldo</th>
                      <th className="py-3 px-4 border-r border-surface-900/20">Keterangan</th>
                      <th className="py-3 px-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 text-sm font-bold text-surface-800">
                    {displayLedger.length > 0 ? (
                      displayLedger.map((row) => {
                        const formattedDate = new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })
                        const isKeluar = row.type === 'PENGELUARAN'
                        const isMasuk = row.type === 'PEMASUKAN'
                        
                        return (
                          <tr key={row.id} onClick={() => isMasuk && setSelectedIncome(row)} className={`${isMasuk ? 'bg-green-100/50 hover:bg-green-100 cursor-pointer group' : 'hover:bg-surface-50'} transition-colors relative`}>
                            <td className="py-3 px-4 text-center border-r border-surface-200 text-surface-500">{row.rowIndex}</td>
                            <td className="py-3 px-4 border-r border-surface-200 whitespace-nowrap">{formattedDate}</td>
                            <td className="py-3 px-4 text-right border-r border-surface-200 font-black">{isKeluar ? formatRupiah(Number(row.amount)) : ''}</td>
                            <td className="py-3 px-4 text-right border-r border-surface-200 font-black text-brand-700 relative">{isMasuk ? formatRupiah(Number(row.amount)) : ''}</td>
                            <td className={`py-3 px-4 text-right border-r border-surface-200 font-black tracking-tight ${row.saldo < 0 ? 'text-red-600 bg-red-50/50' : 'text-surface-900 bg-surface-50/50'}`}>
                              {row.saldo < 0 ? `- ${Math.abs(row.saldo).toLocaleString('id-ID')}` : row.saldo.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4 border-r border-surface-200 font-medium">
                              {row.description}
                              {isMasuk && <span className="block text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity mt-1 w-max">Klik untuk gunakan dana ini</span>}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteCash(row.id); }} className="text-surface-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr><td colSpan={7} className="text-center py-12 text-surface-400 font-medium">Belum ada transaksi kas untuk investor ini.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BAGIAN KANAN: RINCIAN PROFESIONAL & TOMBOL DIVIDEN */}
            <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-6">
              
              {/* KARTU DIVIDEN */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white border border-blue-700">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl z-0"></div>
                <div className="relative z-10">
                  <h3 className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">Estimasi Pencairan</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <p className="text-3xl font-black">{formatRupiah(totalDiterima)}</p>
                  </div>
                  <p className="text-[10px] font-medium text-blue-300 mb-5 leading-relaxed">
                    Total gabungan dari pengembalian modal dan pembagian laba bersih (dividen).
                  </p>
                  <button 
                    onClick={() => setShowModalDividen(true)}
                    className="w-full bg-white text-blue-900 hover:bg-blue-50 px-4 py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-widest"
                  >
                    <Receipt size={16} /> Cek Rincian Bagi Hasil
                  </button>
                </div>
              </div>

              {/* KARTU RINGKASAN */}
              <div className="bg-white rounded-3xl border border-surface-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[100px] -mr-8 -mt-8 z-0"></div>
                
                <h3 className="text-lg font-black text-surface-900 mb-6 relative z-10 flex items-center gap-2">
                  <PieChart size={20} className="text-brand-600" /> Ringkasan Kas
                </h3>

                <div className="space-y-5 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <TrendingUp size={12} className="text-brand-500"/> Total Modal Disetor
                    </p>
                    <p className="text-xl font-black text-brand-700">{formatRupiah(totalPemasukan)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <TrendingDown size={12} className="text-red-500"/> Total Penggunaan
                    </p>
                    <p className="text-xl font-black text-surface-900">{formatRupiah(totalPengeluaran)}</p>
                  </div>
                  <div className="border-t border-surface-100 pt-5">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Activity size={12} className="text-blue-500"/> Persentase Serapan
                    </p>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-black text-surface-900">{serapanPercentage.toFixed(1)}%</span>
                      <span className="text-xs font-bold text-surface-500">Terserap</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${serapanPercentage > 100 ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(serapanPercentage, 100)}%` }}></div>
                    </div>
                    {serapanPercentage > 100 && (
                      <p className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1">! Overbudget (Keluar melebihi setor)</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-surface-900 to-surface-800 rounded-3xl p-6 shadow-md text-white">
                <h4 className="text-sm font-bold text-surface-300 mb-4 uppercase tracking-widest">Informasi Portofolio</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-brand-400 shrink-0" />
                    <span>Total <strong className="text-white">{processedLedger.length}</strong> transaksi kas</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-orange-400 shrink-0" />
                    <span>Tercatat <strong className="text-white">{assets.length}</strong> aset fisik/barang</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* LIST ASET BARANG */}
          <h2 className="text-xl font-bold text-surface-900 mb-6 flex items-center gap-2 max-w-5xl mx-auto">
            <Box className="text-orange-500" /> Catatan Sumbangan Fisik / Aset
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-3xl border border-surface-200 p-6 shadow-sm relative group">
                  <div className="absolute top-4 right-4 text-surface-300">
                    <button onClick={() => handleDeleteAsset(asset.id)} className="hover:text-red-500 p-1"><Trash2 size={16}/></button>
                  </div>
                  <p className="text-xs font-bold text-surface-400 mb-1">{new Date(asset.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <h3 className="text-lg font-black text-surface-900 mb-3 pr-8 uppercase">{asset.item_name}</h3>
                  {asset.description && <p className="text-sm text-surface-600 font-medium bg-surface-50 p-3 rounded-xl border border-surface-100">{asset.description}</p>}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-surface-200 text-surface-400 font-medium">Belum ada catatan aset fisik.</div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: RINCIAN KALKULASI DIVIDEN 
      ========================================================================== */}
      {showModalDividen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl my-8 animate-in zoom-in-95 overflow-hidden border border-surface-200">
            
            <div className="bg-surface-900 p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-xl font-black text-white">Laporan Bagi Hasil</h2>
                  <p className="text-xs font-bold text-surface-400 mt-1 uppercase tracking-widest">{investor.name}</p>
                </div>
                <button onClick={() => setShowModalDividen(false)} className="text-surface-400 hover:text-white bg-surface-800 p-2 rounded-full transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Porsi Saham */}
              <div className="flex items-center justify-between border-b border-surface-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Percent size={18}/></div>
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Porsi Kepemilikan</p>
                    <p className="font-bold text-surface-900 text-sm">Modal Anda / Total Global</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-blue-600">{porsiSaham.toFixed(2)}%</p>
                </div>
              </div>

              {/* Step 2: Omset vs Modal */}
              <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-surface-600">Total Omset Penjualan</p>
                  <p className="font-black text-surface-900">{formatRupiah(globalStats.omset)}</p>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-surface-600">Total Modal Keseluruhan</p>
                  <p className="font-black text-surface-900">{formatRupiah(globalStats.modalGlobal)}</p>
                </div>
                <div className="pt-3 border-t border-surface-200 flex justify-between items-center">
                  <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Status Laba Kotor</p>
                  {isProfit ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">UNTUNG ({formatRupiah(globalStats.omset - globalStats.modalGlobal)})</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">BELUM BALIK MODAL</span>
                  )}
                </div>
              </div>

              {/* Step 3: Hak Individu */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-surface-900">Pengembalian Modal</p>
                    <p className="text-[10px] text-surface-500 font-medium">Berdasarkan porsi saham</p>
                  </div>
                  <p className="font-black text-surface-700">{formatRupiah(pengembalianModalIndividu)}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-surface-900">Hak Dividen (Laba)</p>
                    <p className="text-[10px] text-surface-500 font-medium">50% Laba Bersih x Porsi Anda</p>
                  </div>
                  <p className="font-black text-emerald-600">{formatRupiah(hakDividenIndividu)}</p>
                </div>
              </div>

              {/* Total Diterima */}
              <div className="bg-blue-600 p-5 rounded-2xl text-white mt-6 shadow-lg shadow-blue-600/20 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Total Estimasi Diterima</p>
                  <p className="text-xs font-medium text-blue-100">Modal + Dividen</p>
                </div>
                <p className="text-2xl font-black">{formatRupiah(totalDiterima)}</p>
              </div>

              <button onClick={() => setShowModalDividen(false)} className="w-full py-4 bg-surface-100 hover:bg-surface-200 text-surface-800 rounded-xl font-black text-sm transition-colors uppercase tracking-widest mt-4">
                Tutup Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSAKSI UNIFIED */}
      {showModalTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl my-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-surface-900">Catat Transaksi Kas</h3>
              <button onClick={() => setShowModalTrx(false)} className="text-surface-400 hover:text-surface-900"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitTrx} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">Jenis Transaksi</label>
                  <select value={txType} onChange={e => setTxType(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="PEMASUKAN_UANG">➕ Pemasukan Tunai</option>
                    <option value="PEMASUKAN_BARANG">📦 Pemasukan Barang (Natura)</option>
                    <option value="PENGELUARAN">➖ Belanja/Keluar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">Tanggal</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              {txType === 'PEMASUKAN_BARANG' && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-xs font-bold text-orange-800 flex gap-2">
                  <Box size={16} className="shrink-0 mt-0.5" />
                  Mencatat Pemasukan Modal & Pengeluaran Otomatis, lalu mendaftarkan barang ke Aset Fisik.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-surface-700 mb-2">
                    {txType === 'PEMASUKAN_BARANG' ? 'Total Harga Barang (Rp)' : 'Nominal Uang (Rp)'}
                  </label>
                  <input type="number" required placeholder="Contoh: 1500000" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-black text-xl outline-none focus:ring-2 focus:ring-brand-500 ${txType.includes('PEMASUKAN') ? 'text-brand-600' : 'text-red-600'}`} />
                </div>
                {txType === 'PEMASUKAN_BARANG' && (
                  <div>
                    <label className="block text-sm font-bold text-surface-700 mb-2">Jumlah (Qty)</label>
                    <input type="number" required placeholder="Qty" value={itemQty} onChange={e => setItemQty(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">
                  {txType === 'PEMASUKAN_BARANG' ? 'Nama Barang (Keterangan)' : 'Keterangan Laporan'}
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16}/>
                  <input type="text" required placeholder="Contoh: Beli Pupuk NPK / Saldo Awal" value={description} onChange={e => setDescription(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-surface-50 border border-surface-200 rounded-xl font-medium uppercase outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModalTrx(false)} className="px-5 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ALOKASI DANA */}
      {selectedIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl my-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-surface-900">Gunakan Dana Ini</h2>
                <p className="text-xs font-bold text-brand-600 mt-1">Sistem Alokasi Pengeluaran</p>
              </div>
              <button onClick={() => setSelectedIncome(null)} className="text-surface-400 hover:text-surface-900 bg-surface-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleAlokasiDana} className="space-y-5">
              <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Sumber Dana (Pemasukan):</p>
                <p className="font-bold text-surface-900">{selectedIncome.description}</p>
                <p className="text-brand-600 font-black mt-1 text-lg">{formatRupiah(selectedIncome.amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Dana Digunakan (Rp)</label>
                <input type="number" required placeholder="Contoh: 500000" max={selectedIncome.amount} value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-black text-xl text-red-600 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Untuk Kebutuhan / Beli Apa?</label>
                <input type="text" required placeholder="Contoh: Beli Pupuk Urea" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-medium uppercase outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                <button type="button" onClick={() => setSelectedIncome(null)} className="px-5 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50">{isSubmitting ? 'Mencatat...' : 'Konfirmasi Alokasi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}