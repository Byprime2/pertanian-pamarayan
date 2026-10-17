"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, UploadCloud, FileText, Type, AlignLeft, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TambahLaporanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Fungsi saat pengguna memilih file foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      // Membuat URL sementara untuk preview gambar
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop' // Gambar bawaan

      // 1. Jika ada file gambar, upload dulu ke Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `laporan/${fileName}`

        // Upload ke bucket bernama 'images'
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile)

        if (uploadError) throw new Error('Gagal mengunggah gambar: ' + uploadError.message)

        // Ambil URL publik dari gambar yang baru diupload
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        finalImageUrl = publicUrl
      }

      // 2. Simpan data laporan ke database
      const { error } = await supabase
        .from('land_news')
        .insert([
          {
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            image_url: finalImageUrl,
            published_at: new Date().toISOString(),
          }
        ])

      if (error) throw error

      // 3. Tambahkan notifikasi
      await supabase.from('notifications').insert([
        {
          title: 'Laporan Baru Ditambahkan',
          description: `Laporan "${formData.title}" telah berhasil dipublikasikan.`,
        }
      ])

      router.push('/admin')
      router.refresh()
    } catch (error: any) {
      alert('Gagal menyimpan laporan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      <div className="flex-grow">
        
        {/* HERO HEADER */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden bg-slate-950">
          <img 
            src="/Photos/1.jpeg" 
            alt="Latar Belakang Lahan" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 animate-[kenburns_20s_ease-in-out_infinite_alternate]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-50/10 z-0"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Link href="/admin" className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg active:scale-95 shrink-0">
                <ArrowLeft size={22} />
              </Link>
              <div>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/25 text-emerald-300 backdrop-blur-sm text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-2.5 uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                  Bagian Publikasi Lahan
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  Buat Laporan Baru
                </h1>
                <p className="text-slate-300 text-sm md:text-base font-medium mt-1 leading-relaxed max-w-2xl">
                  Unggah informasi operasional, proses pengerjaan lahan, dan dokumentasi lapangan terbaru untuk diakses oleh mitra dan pengunjung.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AREA FORMULIR */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-24">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl overflow-hidden">
            <div className="p-6 md:p-10 flex flex-col gap-6 md:gap-8">
              
              {/* Field Judul */}
              <div>
                <label className="flex items-center gap-2 text-sm font-extrabold text-slate-800 mb-2.5">
                  <Type size={16} className="text-emerald-600" /> Judul Laporan
                </label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Penyiapan Ladang Palawija Tahap 2"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner text-sm"
                />
              </div>

              {/* Field Ringkasan */}
              <div>
                <label className="flex items-center gap-2 text-sm font-extrabold text-slate-800 mb-2.5">
                  <AlignLeft size={16} className="text-emerald-600" /> Ringkasan Singkat (Excerpt)
                </label>
                <textarea 
                  name="excerpt"
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Tulis ringkasan maksimal 2 kalimat untuk ditampilkan di halaman depan..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none shadow-inner text-sm"
                />
              </div>

              {/* Field Konten Lengkap */}
              <div>
                <label className="flex items-center gap-2 text-sm font-extrabold text-slate-800 mb-2.5">
                  <FileText size={16} className="text-emerald-600" /> Isi Laporan Lengkap
                </label>
                <textarea 
                  name="content"
                  required
                  rows={8}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Tulis detail laporan kegiatan, hasil observasi, atau kondisi lahan di sini..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner text-sm"
                />
              </div>

              {/* Field Upload Gambar Premium */}
              <div>
                <label className="flex items-center gap-2 text-sm font-extrabold text-slate-800 mb-2.5">
                  <UploadCloud size={16} className="text-emerald-600" /> Unggah Foto Dokumentasi
                </label>
                
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${previewUrl ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 group-hover:border-emerald-400'}`}>
                    
                    {previewUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-sm h-48 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100">
                          <CheckCircle2 size={18} /> Foto Berhasil Dipilih
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Klik atau seret foto lain untuk mengganti</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                          <UploadCloud size={28} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Klik untuk mengunggah foto</p>
                          <p className="text-xs text-slate-500 font-medium mt-1">atau seret dan lepas file ke area ini (Maks. 5MB)</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

            </div>

            {/* Area Tombol Submit */}
            <div className="bg-slate-50 p-6 md:px-10 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25 text-sm cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save size={18} />
                )}
                {loading ? 'Menyimpan & Mengunggah...' : 'Publikasikan Laporan'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}