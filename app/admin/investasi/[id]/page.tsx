"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Trash2, Wallet, Box, PieChart, TrendingDown, TrendingUp, Activity, CheckCircle2 } from 'lucide-react'

export default function DetailInvestorPage() {
  const { id } = useParams()
  const [investor, setInvestor] = useState<any>(null)
  const [ledger, setLedger] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State Form
  const [showCashForm, setShowCashForm] = useState(false)
  const [txType, setTxType] = useState('PEMASUKAN')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const [showAssetForm, setShowAssetForm] = useState(false)
  const [itemName, setItemName] = useState('')
  const [assetDesc, setAssetDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    const { data: invData } = await supabase.from('investors').select('*').eq('id', id).single()
    const { data: ledgerData } = await supabase.from('cash_ledger').select('*').eq('investor_id', id).order('date', { ascending: true }).order('created_at', { ascending: true })
    const { data: assetData } = await supabase.from('physical_assets').select('*').eq('investor_id', id).order('date', { ascending: false })

    if (invData) setInvestor(invData)
    if (ledgerData) setLedger(ledgerData)
    if (assetData) setAssets(assetData)
    setLoading(false)
  }

  // Kalkulasi Saldo Berjalan & Ringkasan
  let currentSaldo = 0
  let totalPemasukan = 0
  let totalPengeluaran = 0

  const processedLedger = ledger.map((item) => {
    const nominal = Number(item.amount || 0)
    if (item.type === 'PEMASUKAN') {
      currentSaldo += nominal
      totalPemasukan += nominal
    } else if (item.type === 'PENGELUARAN') {
      currentSaldo -= nominal
      totalPengeluaran += nominal
    }
    return { ...item, saldo: currentSaldo }
  })

  // Kalkulasi Persentase Serapan Dana
  const serapanPercentage = totalPemasukan > 0 ? (totalPengeluaran / totalPemasukan) * 100 : 0

  // Fungsi Format Rupiah Khusus (Menangani Minus dengan rapi: - Rp xxx)
  const formatRupiah = (angka: number) => {
    const isMinus = angka < 0
    const nominal = Math.abs(angka).toLocaleString('id-ID')
    return isMinus ? `- Rp ${nominal}` : `Rp ${nominal}`
  }

  const handleSubmitCash = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const payload = { investor_id: id, date, type: txType, amount: Number(amount), description: description.toUpperCase() }
    const { error } = await supabase.from('cash_ledger').insert([payload])
    if (!error) {
      setShowCashForm(false)
      setAmount('')
      setDescription('')
      fetchData()
    } else alert('Gagal: ' + error.message)
    setIsSubmitting(false)
  }

  const handleSubmitAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const payload = { investor_id: id, date, item_name: itemName.toUpperCase(), description: assetDesc }
    const { error } = await supabase.from('physical_assets').insert([payload])
    if (!error) {
      setShowAssetForm(false)
      setItemName('')
      setAssetDesc('')
      fetchData()
    } else alert('Gagal: ' + error.message)
    setIsSubmitting(false)
  }

  const handleDeleteCash = async (txId: string) => {
    if (confirm('Hapus transaksi uang ini?')) {
      await supabase.from('cash_ledger').delete().eq('id', txId)
      fetchData()
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Hapus pencatatan barang ini?')) {
      await supabase.from('physical_assets').delete().eq('id', assetId)
      fetchData()
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface-50 font-bold text-surface-500">Memuat data...</div>
  if (!investor) return <div className="min-h-screen flex items-center justify-center bg-surface-50">Data tidak ditemukan.</div>

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col font-sans">
      
      {/* HEADER INTERNAL BERSIH */}
      <div className="bg-white border-b border-surface-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm">
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
            <button onClick={() => setShowAssetForm(true)} className="flex-1 sm:flex-none bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              <Box size={16} /> + Barang
            </button>
            <button onClick={() => setShowCashForm(true)} className="flex-1 sm:flex-none bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-shadow shadow-md flex items-center justify-center gap-2">
              <Wallet size={16} /> + Transaksi
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow pb-24 pt-8">
        {/* Kontainer Utama membatasi lebar maksimal layar besar */}
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* LAYOUT FLEX: TABEL TENGAH & RINCIAN KANAN */}
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mb-12 relative">
            
            {/* BAGIAN TENGAH: TABEL UTAMA (Maksimal Lebar Terkontrol) */}
            <div className="w-full lg:max-w-4xl xl:max-w-5xl bg-white rounded-3xl border border-surface-200 shadow-sm overflow-hidden flex flex-col mx-auto">
              <div className="p-5 md:p-6 bg-surface-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black tracking-wide text-yellow-300">LAPORAN KEUANGAN</h2>
                  <p className="text-xs text-surface-300 mt-1 font-medium">Rekapitulasi Arus Kas Berjalan</p>
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
                    {processedLedger.length > 0 ? (
                      processedLedger.map((row, index) => {
                        const formattedDate = new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })
                        const isKeluar = row.type === 'PENGELUARAN'
                        const isMasuk = row.type === 'PEMASUKAN'
                        
                        return (
                          <tr key={row.id} className={`${isMasuk ? 'bg-green-100/50 hover:bg-green-100' : 'hover:bg-surface-50'} transition-colors`}>
                            <td className="py-3 px-4 text-center border-r border-surface-200 text-surface-500">{index + 1}</td>
                            <td className="py-3 px-4 border-r border-surface-200 whitespace-nowrap">{formattedDate}</td>
                            <td className="py-3 px-4 text-right border-r border-surface-200 font-black">
                              {isKeluar ? formatRupiah(Number(row.amount)) : ''}
                            </td>
                            <td className="py-3 px-4 text-right border-r border-surface-200 font-black text-brand-700">
                              {isMasuk ? formatRupiah(Number(row.amount)) : ''}
                            </td>
                            <td className={`py-3 px-4 text-right border-r border-surface-200 font-black tracking-tight ${row.saldo < 0 ? 'text-red-600 bg-red-50/50' : 'text-surface-900 bg-surface-50/50'}`}>
                              {/* Menampilkan format angka saja khusus untuk kolom ini agar rapi, atau beserta minusnya */}
                              {row.saldo < 0 ? `- ${Math.abs(row.saldo).toLocaleString('id-ID')}` : row.saldo.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4 border-r border-surface-200 font-medium">
                              {row.description}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button onClick={() => handleDeleteCash(row.id)} className="text-surface-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
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

            {/* BAGIAN KANAN: RINCIAN PROFESIONAL (Menempel di pojok kanan layar PC, Susun Bawah di HP) */}
            <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-6">
              <div className="bg-white rounded-3xl border border-surface-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[100px] -mr-8 -mt-8 z-0"></div>
                
                <h3 className="text-lg font-black text-surface-900 mb-6 relative z-10 flex items-center gap-2">
                  <PieChart size={20} className="text-brand-600" /> Ringkasan Kas
                </h3>

                <div className="space-y-5 relative z-10">
                  {/* Total Modal Masuk */}
                  <div>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <TrendingUp size={12} className="text-brand-500"/> Total Modal Disetor
                    </p>
                    <p className="text-xl font-black text-brand-700">{formatRupiah(totalPemasukan)}</p>
                  </div>

                  {/* Total Penggunaan */}
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
                    {/* Progress Bar */}
                    <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${serapanPercentage > 100 ? 'bg-red-500' : 'bg-brand-500'}`} 
                        style={{ width: `${Math.min(serapanPercentage, 100)}%` }}
                      ></div>
                    </div>
                    {serapanPercentage > 100 && (
                      <p className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1">
                        ! Overbudget (Keluar melebihi setor)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Tambahan */}
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


      {/* MODAL TRANSAKSI UANG */}
      {showCashForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl my-8">
            <h3 className="text-xl font-bold text-surface-900 mb-6">Catat Transaksi Kas</h3>
            <form onSubmit={handleSubmitCash} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">Jenis</label>
                  <select value={txType} onChange={e => setTxType(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-bold">
                    <option value="PEMASUKAN">➕ Pemasukan</option>
                    <option value="PENGELUARAN">➖ Belanja/Keluar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">Tanggal</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Nominal Uang (Rp)</label>
                <input type="number" required placeholder="Contoh: 85000" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-black text-xl ${txType === 'PEMASUKAN' ? 'text-brand-600' : 'text-red-600'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Keterangan Laporan</label>
                <input type="text" required placeholder="Contoh: SALDO AWAL / BELI OBAT" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-medium uppercase" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCashForm(false)} className="px-5 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md">{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAKSI BARANG */}
      {showAssetForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl my-8">
            <h3 className="text-xl font-bold text-surface-900 mb-6 flex items-center gap-2"><Box className="text-orange-500"/> Catat Sumbangan Fisik</h3>
            <form onSubmit={handleSubmitAsset} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Tanggal Penerimaan</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Nama Barang / Aset</label>
                <input type="text" required placeholder="Contoh: BENIH JAGUNG 5KG" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-bold uppercase" />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Deskripsi / Catatan Tambahan</label>
                <textarea rows={3} placeholder="Opsional..." value={assetDesc} onChange={e => setAssetDesc(e.target.value)} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl font-medium" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAssetForm(false)} className="px-5 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md">{isSubmitting ? 'Menyimpan...' : 'Simpan Aset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}