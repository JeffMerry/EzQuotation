import type { Metadata } from "next";
import { Sarabun, Geist_Mono } from "next/font/google";
import "./globals.css";

// ใช้ฟอนต์ Sarabun เป็นฟอนต์หลักสำหรับภาษาไทยที่ดูเป็นทางการ เหมาะกับเอกสารธุรกิจ
const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบออกใบเสนอราคาด่วน | Quotation Generator",
  description: "ระบบจัดการและสร้างใบเสนอราคาในรูปแบบ PDF อัตโนมัติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        
        {/* Navigation Bar ส่วนกลางของระบบ */}
        <header className="bg-slate-900 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Icon จำลองตัวเล่มเอกสาร */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-bold text-lg tracking-wide">EzQuotation</span>
            </div>
            <nav className="flex space-x-4 text-sm font-medium text-slate-300">
              <span className="text-emerald-400 border-b-2 border-emerald-400 pb-1 cursor-default">สร้างเอกสาร</span>
              <span className="hover:text-white cursor-not-allowed opacity-50">ประวัติเอกสาร</span>
            </nav>
          </div>
        </header>

        {/* ส่วนเนื้อหาหลักที่จะดึงมาจาก page.tsx */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer ส่วนท้ายของหน้าเว็บ */}
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto px-4">
            &copy; {new Date().getFullYear()} EzQuotation App - พัฒนาด้วย Next.js & FastAPI
          </div>
        </footer>

      </body>
    </html>
  );
}