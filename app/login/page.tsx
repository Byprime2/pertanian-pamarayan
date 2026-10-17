"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Email atau password tidak valid.")
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden font-sans">
      
      {/* VIDEO BACKGROUND */}
      {/* Ganti "8.mp4" dengan nama video pengenalan perusahaan Anda nanti */}
      <video 
  autoPlay 
  loop 
  muted 
  playsInline 
  className="..."
  src="https://ptgnowzbqxjjvgylwqva.supabase.co/storage/v1/object/public/images/profile.mp4" 
/>

      {/* OVERLAY GELAP (Agar video tidak mengalahkan warna teks form login) */}
      <div className="absolute inset-0 bg-surface-900/60 z-0 backdrop-blur-[2px]"></div>

      {/* TOMBOL KEMBALI KE BERANDA (Opsional, sangat bagus untuk user experience) */}
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-bold bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="text-white flex items-center justify-center">
            <img src="/Logo-1.png" alt="Logo Pamarayan" className="h-20 w-auto object-contain" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-white drop-shadow-md">
          Portal Petani
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-surface-200 uppercase tracking-widest drop-shadow-md">
          Sistem Manajemen Pertanian Pamarayan
        </p>
      </div>

      <div className="relative z-10 mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        {/* KOTAK LOGIN DENGAN EFEK GLASSMORPHISM */}
        <div className="bg-white/20 backdrop-blur-xl py-10 px-6 shadow-2xl border border-white/40 sm:rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                type="email" required
                className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-sm"
                placeholder="admin@pertanian.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <input
                type="password" required
                className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-sm"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-surface-900/20 text-sm font-bold text-white bg-surface-900 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-900 disabled:opacity-50 transition-all mt-4 uppercase tracking-widest"
            >
              {loading ? "Memverifikasi Kredensial..." : "Otorisasi Masuk"}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  )
}