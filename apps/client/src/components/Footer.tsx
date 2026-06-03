import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";

interface FooterLink {
  label: string;
  url: string;
}

interface StoreConfig {
  storeName: string;
  description: string;
  address: string;
  hotline: string;
  email: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  customerCareLinks: FooterLink[];
  aboutLinks: FooterLink[];
  showVisa: boolean;
  showMastercard: boolean;
  showVnpay: boolean;
  countryRegion: string;
}

async function getStoreConfig(): Promise<StoreConfig> {
  const defaults: StoreConfig = {
    storeName: "KCG Shop",
    description: "",
    address: "",
    hotline: "",
    email: "",
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    customerCareLinks: [],
    aboutLinks: [],
    showVisa: true,
    showMastercard: true,
    showVnpay: true,
    countryRegion: "Quốc gia & Khu vực: Việt Nam",
  };
  try {
    const res = await fetch(`${getPublicApiBaseUrl()}/store/config`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return defaults;
    const data = await res.json();
    return {
      ...defaults,
      ...data,
      customerCareLinks: Array.isArray(data.customerCareLinks) ? data.customerCareLinks : defaults.customerCareLinks,
      aboutLinks: Array.isArray(data.aboutLinks) ? data.aboutLinks : defaults.aboutLinks,
    };
  } catch {
    return defaults;
  }
}

const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 8.5a7.5 7.5 0 0 1-4.5-1.5v6.8a5.3 5.3 0 1 1-4.6-5.3v2.2a3.1 3.1 0 1 0 2.4 3V2h2.2a5.3 5.3 0 0 0 4.5 4.5z" />
  </svg>
);

const Footer = async () => {
  const cfg = await getStoreConfig();

  return (
    <footer className="bg-white border-t border-zinc-200 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">

          {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
          <div className="flex flex-col gap-6">
            <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Thông tin cửa hàng</h2>
            {cfg.description && (
              <p className="text-sm text-zinc-500 leading-relaxed">{cfg.description}</p>
            )}
            <div className="flex flex-col gap-3 text-sm text-zinc-700">
              {cfg.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{cfg.address}</span>
                </div>
              )}
              {cfg.hotline && (
                <div className="flex items-center gap-3 hover:text-red-600 transition-colors">
                  <Phone size={18} className="text-red-600 shrink-0" />
                  <a href={`tel:${cfg.hotline.replace(/\s/g, '')}`} className="font-bold">{cfg.hotline}</a>
                </div>
              )}
              {cfg.email && (
                <div className="flex items-center gap-3 hover:text-red-600 transition-colors">
                  <Mail size={18} className="text-red-600 shrink-0" />
                  <a href={`mailto:${cfg.email}`}>{cfg.email}</a>
                </div>
              )}
            </div>
          </div>

          {/* CỘT 2: CHĂM SÓC KHÁCH HÀNG */}
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-zinc-900 uppercase tracking-wide">Chăm sóc khách hàng</h3>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              {cfg.customerCareLinks.map((link) => (
                <Link key={link.url} href={link.url} className="hover:text-red-600 transition-colors w-fit">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CỘT 3: VỀ CHÚNG TÔI */}
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-zinc-900 uppercase tracking-wide">Về {cfg.storeName}</h3>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              {cfg.aboutLinks.map((link) => (
                <Link key={link.url} href={link.url} className="hover:text-red-600 transition-colors w-fit">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CỘT 4: THANH TOÁN & MẠNG XÃ HỘI */}
          <div className="flex flex-col gap-8">
            {(cfg.showVisa || cfg.showMastercard || cfg.showVnpay) && (
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-zinc-900 uppercase tracking-wide">Thanh toán an toàn</h3>
                <div className="flex flex-wrap gap-2">
                  {cfg.showVisa && (
                    <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200">
                      <Image src="/visa.png" alt="Visa" width={32} height={20} className="object-contain mix-blend-multiply" />
                    </div>
                  )}
                  {cfg.showMastercard && (
                    <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200">
                      <Image src="/mastercard.png" alt="Mastercard" width={32} height={20} className="object-contain mix-blend-multiply" />
                    </div>
                  )}
                  {cfg.showVnpay && (
                    <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200">
                      <Image src="/vnpay-logo.png" alt="VNPay" width={40} height={20} className="object-contain mix-blend-multiply" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-zinc-900 uppercase tracking-wide">Kết nối với chúng tôi</h3>
              <div className="flex items-center gap-4 text-zinc-500">
                {cfg.facebook && (
                  <a href={cfg.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                    <Facebook size={16} />
                  </a>
                )}
                {cfg.instagram && (
                  <a href={cfg.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all">
                    <Instagram size={16} />
                  </a>
                )}
                {cfg.youtube && (
                  <a href={cfg.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                    <Youtube size={16} />
                  </a>
                )}
                {cfg.tiktok && (
                  <a href={cfg.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <TiktokIcon />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} {cfg.storeName}. Tất cả các quyền được bảo lưu.</p>
          {cfg.countryRegion && (
            <div className="flex gap-4">
              <span className="hover:text-zinc-600 cursor-default">{cfg.countryRegion}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
