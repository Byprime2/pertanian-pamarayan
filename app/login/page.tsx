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
      
      {/* VIDEO BACKGROUND - Class sudah diperbaiki agar Fullscreen */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://ptgnowzbqxjjvgylwqva.supabase.co/storage/v1/object/public/images/profile.mp4" 
      />

      {/* OVERLAY GELAP - Z-Index 10 agar berada tepat di atas video */}
      <div className="absolute inset-0 bg-surface-900/70 z-10 backdrop-blur-[3px]"></div>

      {/* TOMBOL KEMBALI */}
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      {/* HEADER LOGO */}
      <div className="relative z-20 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="text-white flex items-center justify-center">
            <img src="/Logo-1.png" alt="Logo Pamarayan" className="h-24 w-auto object-contain drop-shadow-xl" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-white drop-shadow-lg">
          Portal Petani
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-surface-300 uppercase tracking-widest drop-shadow-md">
          Sistem Manajemen Pertanian Pamarayan
        </p>
      </div>

      {/* FORM LOGIN */}
      <div className="relative z-20 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl py-10 px-6 shadow-2xl border border-white/20 sm:rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md text-white text-sm font-bold rounded-xl border border-red-500/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-surface-200 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                type="email" required
                className="w-full px-4 py-3 bg-surface-900/40 border border-white/20 rounded-xl text-sm font-medium text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-surface-900/60 transition-all shadow-inner"
                placeholder="admin@pertanian.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-200 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <input
                type="password" required
                className="w-full px-4 py-3 bg-surface-900/40 border border-white/20 rounded-xl text-sm font-medium text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-surface-900/60 transition-all shadow-inner"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-black text-white bg-brand-600 hover:bg-brand-500 border border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all mt-6 uppercase tracking-widest hover:-translate-y-0.5"
            >
              {loading ? "Memverifikasi..." : "Otorisasi Masuk"}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  )
}