"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  User, Shield, Briefcase, Lock, Key, Mail, 
  ArrowLeft, CheckCircle2, AlertCircle, Camera,
  Wallet, TrendingUp, Box, LogOut, ArrowRight, ArrowDownRight, ArrowUpRight, Link2
} from 'lucide-react'

export default function PusatAkunPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profil')
  const [loading, setLoading] = useState(true)

  // State Keamanan (Password)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })

  // State Portofolio (Untuk Admin menautkan/melihat laporan)
  const [allInvestors, setAllInvestors] = useState<any[]>([])
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>('')
  
  // Data Laporan Lengkap
  const [report, setReport] = useState({ 
    investorName: '',
    saldo: 0, 
    asetCount: 0,
    ledgers: [] as any[],
    assets: [] as any[]
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Saat Admin memilih investor dari dropdown, fetch data laporannya
  useEffect(() => {
    if (selectedInvestorId) {
      fetchDetailedReport(selectedInvestorId)
    } else {
      setReport({ investorName: '', saldo: 0, asetCount: 0, ledgers: [], assets: [] })
    }
  }, [selectedInvestorId])

  const fetchInitialData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUser(user)

    // Ambil daftar semua investor untuk dropdown admin
    const { data: invList } = await supabase.from('investors').select('*').order('name')
    if (invList) setAllInvestors(invList)
    
    setLoading(false)
  }

  const fetchDetailedReport = async (investorId: string) => {
    const inv = allInvestors.find(i => i.id === investorId)
    if (!inv) return

    const { data: ledgers } = await supabase.from('cash_ledger').select('*').eq('investor_id', investorId).order('date', { ascending: false })
    const { data: assets } = await supabase.from('physical_assets').select('*').eq('investor_id', investorId).order('date_acquired', { ascending: false })

    let totalPemasukan = 0, totalPengeluaran = 0
    ledgers?.forEach(l => {
      if (l.type === 'PEMASUKAN') totalPemasukan += Number(l.amount)
      if (l.type === 'PENGELUARAN') totalPengeluaran += Number(l.amount)
    })

    setReport({
      investorName: inv.name,
      saldo: totalPemasukan - totalPengeluaran,
      asetCount: assets?.length || 0,
      ledgers: ledgers || [],
      assets: assets || []
    })
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg({ type: '', text: '' })
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Konfirmasi password tidak cocok!' }); return
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password minimal 6 karakter.' }); return
    }
    setIsUpdating(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPassMsg({ type: 'error', text: error.message })
    else {
      setPassMsg({ type: 'success', text: 'Password berhasil diperbarui!' })
      setNewPassword(''); setConfirmPassword('')
    }
    setIsUpdating(false)
  }

  const handleLogout = async () => {
    if(window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      <div className="flex-grow">
        
        {/* HERO HEADER */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 z-0"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
          
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin" className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg active:scale-95 shrink-0">
                  <ArrowLeft size={22} />
                </Link>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/25 text-emerald-300 backdrop-blur-sm text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-2.5 uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                    Pengaturan Sistem Pusat
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    Pusat Akun
                  </h1>
                </div>
              </div>
              
              {user && (
                <button onClick={handleLogout} className="w-full md:w-auto px-6 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-black text-sm transition-all flex justify-center items-center gap-2 backdrop-blur-sm shadow-lg">
                  <LogOut size={18}/> Keluar Sesi Saat Ini
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AREA KONTEN UTAMA */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SIDEBAR MENU TAB */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 p-4 sticky top-28 flex flex-row lg:flex-col gap-2 overflow-x-auto">
                <button onClick={() => setActiveTab('profil')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'profil' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'}`}>
                  <User size={18} className={activeTab === 'profil' ? 'text-emerald-600' : ''} /> Profil Identitas
                </button>
                <button onClick={() => setActiveTab('portofolio')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'portofolio' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'}`}>
                  <Briefcase size={18} className={activeTab === 'portofolio' ? 'text-emerald-600' : ''} /> Laporan Portofolio
                </button>
                <button onClick={() => setActiveTab('keamanan')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'keamanan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'}`}>
                  <Shield size={18} className={activeTab === 'keamanan' ? 'text-emerald-600' : ''} /> Keamanan & Sandi
                </button>
              </div>
            </div>

            {/* AREA KONTEN TAB */}
            <div className="lg:col-span-9">
              {loading ? (
                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 p-20 flex flex-col items-center justify-center">
                   <span className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></span>
                   <p className="text-slate-500 font-bold animate-pulse">Menyiapkan pusat kontrol...</p>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 min-h-[600px]">
                  
                  {/* TAB 1: PROFIL IDENTITAS */}
                  {activeTab === 'profil' && (
                    <div>
                      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <User className="text-emerald-500" size={24}/>
                        <div>
                          <h2 className="text-xl font-black text-slate-900">Profil Identitas</h2>
                          <p className="text-sm font-medium text-slate-500 mt-1">Informasi kredensial login Anda saat ini.</p>
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                          <div className="relative z-10 w-28 h-28 md:w-32 md:h-32 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl shrink-0">
                            {user?.email?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          
                          <div className="relative z-10 text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-black text-white">{user?.email?.split('@')[0] || 'Administrator'}</h3>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest mt-3">
                              <CheckCircle2 size={14}/> Akses Penuh Sistem
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 shadow-sm hover:border-emerald-300 transition-colors">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100"><Mail size={20}/></div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Terdaftar</p>
                              <p className="text-sm font-bold text-slate-900">{user?.email || 'Tidak tersedia'}</p>
                            </div>
                          </div>
                          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 shadow-sm hover:border-emerald-300 transition-colors">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100"><Key size={20}/></div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User ID Sistem (UUID)</p>
                              <p className="text-sm font-mono text-slate-500 truncate max-w-[200px] md:max-w-md">{user?.id || '---'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PORTOFOLIO SAYA (Tampilan Lengkap) */}
                  {activeTab === 'portofolio' && (
                    <div className="flex flex-col h-full">
                      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Briefcase className="text-blue-500" size={24}/>
                          <div>
                            <h2 className="text-xl font-black text-slate-900">Laporan Portofolio</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Pilih entitas investor untuk melihat rincian laporan.</p>
                          </div>
                        </div>

                        {/* Dropdown Penautan Akun (Khusus Admin) */}
                        <div className="relative w-full md:w-64">
                          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <select 
                            value={selectedInvestorId} onChange={(e) => setSelectedInvestorId(e.target.value)}
                            className="w-full pl-10 pr-8 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none shadow-sm cursor-pointer"
                          >
                            <option value="">-- Tautkan / Pilih Entitas --</option>
                            {allInvestors.map(inv => (
                              <option key={inv.id} value={inv.id}>{inv.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8 flex-grow">
                        {!selectedInvestorId ? (
                          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-black text-slate-800 mb-2">Akun Administrator</h3>
                            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                              Secara default, Admin tidak memiliki investasi pribadi. Silakan pilih entitas di menu atas untuk melihat laporan lengkap milik klien.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-8 animate-in fade-in duration-300">
                            
                            {/* Kartu Saldo Utama */}
                            <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-bl-[100%] -mr-10 -mt-10"></div>
                              <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2"><User size={12}/> Portofolio: <span className="text-white">{report.investorName}</span></p>
                                <div className="flex items-center gap-4">
                                  <div className="p-3.5 bg-white/10 rounded-2xl text-blue-400 border border-white/5"><Wallet size={24}/></div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimasi Nilai Saldo Kas</p>
                                    <h3 className="text-3xl md:text-4xl font-black text-white mt-1 tracking-tight"><span className="text-lg font-medium text-slate-500 mr-2">Rp</span>{report.saldo.toLocaleString('id-ID')}</h3>
                                  </div>
                                </div>
                              </div>
                              <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5 md:min-w-[200px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aset Fisik Terdaftar</p>
                                <p className="text-2xl font-black text-emerald-400">{report.asetCount} <span className="text-sm font-bold text-slate-400">Item</span></p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                              {/* Tabel Mutasi Kas */}
                              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                                <div className="p-5 bg-slate-50 border-b border-slate-100">
                                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/> Riwayat Mutasi Kas</h4>
                                </div>
                                <div className="p-0 overflow-x-auto max-h-[350px]">
                                  {report.ledgers.length > 0 ? (
                                    <table className="w-full text-left whitespace-nowrap">
                                      <tbody className="divide-y divide-slate-100">
                                        {report.ledgers.map(l => (
                                          <tr key={l.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                              <p className="font-bold text-sm text-slate-900">{l.description}</p>
                                              <p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(l.date).toLocaleDateString('id-ID')}</p>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                              <span className={`inline-flex items-center gap-1 text-sm font-black ${l.type === 'PEMASUKAN' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {l.type === 'PEMASUKAN' ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>}
                                                Rp {l.amount.toLocaleString('id-ID')}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : <p className="text-center text-sm font-bold text-slate-400 p-8">Belum ada transaksi kas.</p>}
                                </div>
                              </div>

                              {/* Tabel Aset Fisik */}
                              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                                <div className="p-5 bg-slate-50 border-b border-slate-100">
                                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2"><Box size={16} className="text-amber-500"/> Daftar Aset Fisik</h4>
                                </div>
                                <div className="p-0 overflow-x-auto max-h-[350px]">
                                  {report.assets.length > 0 ? (
                                    <table className="w-full text-left whitespace-nowrap">
                                      <tbody className="divide-y divide-slate-100">
                                        {report.assets.map(a => (
                                          <tr key={a.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                              <p className="font-bold text-sm text-slate-900">{a.asset_name}</p>
                                              <p className="text-[10px] text-slate-400 font-bold mt-1">Status: {a.condition}</p>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                              <span className="text-sm font-black text-amber-600">Rp {a.value.toLocaleString('id-ID')}</span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : <p className="text-center text-sm font-bold text-slate-400 p-8">Belum ada aset terdaftar.</p>}
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: KEAMANAN & SANDI */}
                  {activeTab === 'keamanan' && (
                    <div>
                      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <Shield className="text-red-500" size={24}/>
                        <div>
                          <h2 className="text-xl font-black text-slate-900">Keamanan Akses</h2>
                          <p className="text-sm font-medium text-slate-500 mt-1">Perbarui sandi (password) untuk mengamankan akun administrator Anda.</p>
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8">
                        {passMsg.text && (
                          <div className={`p-4 rounded-xl border flex items-start gap-3 mb-6 shadow-sm ${passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {passMsg.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 mt-0.5"/> : <AlertCircle size={20} className="shrink-0 mt-0.5"/>}
                            <p className="font-bold text-sm leading-relaxed">{passMsg.text}</p>
                          </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                          <div>
                            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Password Baru</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="password" required minLength={6}
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-slate-900 text-sm transition-all shadow-inner" 
                                placeholder="Minimal 6 karakter..." 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Ketik Ulang Password</label>
                            <div className="relative">
                              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="password" required minLength={6}
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-slate-900 text-sm transition-all shadow-inner" 
                                placeholder="Konfirmasi sandi baru..." 
                              />
                            </div>
                          </div>

                          <div className="pt-4">
                            <button type="submit" disabled={isUpdating}
                              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50">
                              {isUpdating ? 'Memproses...' : 'Simpan Sandi Baru'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}