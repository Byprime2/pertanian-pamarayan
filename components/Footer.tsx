import Link from 'next/link'
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-400 pt-20 pb-10 border-t border-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img src="/Logo-1.png" alt="Logo Pamarayan" className="h-10 w-auto object-contain" />
              <span className="font-black text-xl text-green-500 tracking-tight">PERTANIAN PAMARAYAN</span>
            </div>
            <p className="text-sm leading-relaxed font-medium mb-6">
              Ekosistem agrikultur modern yang memadukan investasi gotong royong transparan dengan suplai pangan berkualitas tinggi langsung dari petani.
            </p>
            <div className="flex items-center gap-3">
              {/* Instagram SVG */}
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all text-surface-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              {/* Facebook SVG */}
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all text-surface-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              {/* Twitter SVG */}
              <a href="#" aria-label="Twitter / X" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all text-surface-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-green-600 font-bold mb-6 text-lg">Perusahaan</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#tentang" className="hover:text-brand-400 transition-colors">Tentang Sistem Kami</a></li>
              <li><a href="#keunggulan" className="hover:text-brand-400 transition-colors">Kualitas Pertanian</a></li>
              <li><a href="#kabar-lahan" className="hover:text-brand-400 transition-colors">Kabar & Update Lahan</a></li>
              <li><Link href="/login" className="hover:text-brand-400 transition-colors">Dashboard Investor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-600 font-bold mb-6 text-lg">Pelanggan</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/etalase" className="hover:text-brand-400 transition-colors">Katalog & Stok Harga</Link></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Cara Pemesanan</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Syarat & Ketentuan Grosir</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-600 font-bold mb-6 text-lg">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-500 shrink-0 mt-0.5" />
                <span>Kawasan Pertanian Bojong garu,<br/>Pamarayan, Banten, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-brand-500 shrink-0" />
                <span>0858 8595 4047</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand-500 shrink-0" />
                <span>pertanianpamarayan2026@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-sm font-medium flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Pertanian Pamarayan. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-brand-500"/> Keamanan Sistem Enterprise</span>
          </div>
        </div>
      </div>
    </footer>
  )
}