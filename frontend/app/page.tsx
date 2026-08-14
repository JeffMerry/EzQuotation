'use client'
import { useState } from 'react'

interface Item {
  description: string;
  quantity: number;
  unit_price: number;
}

const DEFAULT_ISSUER = {
  title: 'ผู้เสนอราคา',
  name: 'เขมภัสสร์ ดิษย์ธนกรกุล',
  taxId: '3100700851830',
  address: '110/31 ซ.กาญจนาภิเษก005 เขตบางแค\nแขวงหลักสอง กรุงเทพมหานคร 10160',
  phone: '0835391541',
  email: 'ekawachwork@gmail.com',
};

const TITLE_PRESETS = [
  'ใบเสนอราคา',
  'ใบแจ้งหนี้',
  'ใบเสร็จรับเงิน',
  'ใบกำกับภาษี/ใบแจ้งหนี้',
  'ใบวางบิล',
];

export default function Home() {
  // Document Title State
  const [documentTitle, setDocumentTitle] = useState('ใบเสนอราคา');
  const [isCustomTitle, setIsCustomTitle] = useState(false);

  // Issuer Info State
  const [issuerTitle, setIssuerTitle] = useState(DEFAULT_ISSUER.title);
  const [issuerName, setIssuerName] = useState(DEFAULT_ISSUER.name);
  const [issuerTaxId, setIssuerTaxId] = useState(DEFAULT_ISSUER.taxId);
  const [issuerAddress, setIssuerAddress] = useState(DEFAULT_ISSUER.address);
  const [issuerPhone, setIssuerPhone] = useState(DEFAULT_ISSUER.phone);
  const [issuerEmail, setIssuerEmail] = useState(DEFAULT_ISSUER.email);
  const [showIssuerDetails, setShowIssuerDetails] = useState(false);

  // Customer & Doc Metadata
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState(''); 
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);

  const resetIssuerToDefault = () => {
    setIssuerTitle(DEFAULT_ISSUER.title);
    setIssuerName(DEFAULT_ISSUER.name);
    setIssuerTaxId(DEFAULT_ISSUER.taxId);
    setIssuerAddress(DEFAULT_ISSUER.address);
    setIssuerPhone(DEFAULT_ISSUER.phone);
    setIssuerEmail(DEFAULT_ISSUER.email);
  };

  // calculation real time
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price || 0), 0);
  const vat = subtotal * 0.03;
  const grandTotal = subtotal - vat;

  const addItemRow = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItemRow = (indexToRemove: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          document_title: documentTitle,
          issuer_title: issuerTitle,
          issuer_name: issuerName,
          issuer_tax_id: issuerTaxId,
          issuer_address: issuerAddress,
          issuer_phone: issuerPhone,
          issuer_email: issuerEmail,
          customer_name: customerName,
          customer_address: customerAddress, 
          customer_tax_id: customerTaxId,   
          date: date, 
          items 
        }),
      });

      if (!response.ok) throw new Error('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle}_${customerName || 'Document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF โปรดตรวจสอบว่ารันหลังบ้านไว้หรือไม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto py-10">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-800">สร้างเอกสาร PDF (ใบเสนอราคา / ใบแจ้งหนี้)</h1>
          <p className="text-slate-500 text-sm mt-1">เลือกรุ่นเอกสารและกรอกข้อมูลด้านล่างเพื่อสร้างไฟล์ PDF</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Section: หัวข้อเอกสาร */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
            <label className="block text-sm font-semibold text-slate-800">1. หัวข้อ / ประเภทเอกสาร</label>
            <div className="flex flex-wrap gap-2">
              {TITLE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setDocumentTitle(preset);
                    setIsCustomTitle(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                    !isCustomTitle && documentTitle === preset
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomTitle(true)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                  isCustomTitle
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                + กำหนดเอง
              </button>
            </div>

            {isCustomTitle && (
              <div className="pt-2">
                <input
                  type="text"
                  required
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="พิมพ์หัวข้อเอกสารที่ต้องการ เช่น ใบแจ้งหนี้ค่างวด..."
                  className="w-full md:w-1/2 rounded-md border-slate-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white"
                />
              </div>
            )}
          </div>

          {/* Section: ข้อมูลฝั่งผู้เสนอ / ผู้ออกเอกสาร */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">2. ข้อมูลผู้เสนอราคา / ผู้ออกเอกสาร (ฝั่งเรา)</h2>
                <p className="text-xs text-slate-500">มีข้อมูลเริ่มต้นเดิมตั้งไว้ สามารถเปิดแก้ไขเพิ่มเติมได้</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetIssuerToDefault}
                  className="text-xs text-slate-600 underline hover:text-slate-900"
                >
                  คืนค่าเริ่มต้น
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssuerDetails(!showIssuerDetails)}
                  className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 font-medium text-slate-700 transition"
                >
                  {showIssuerDetails ? 'ซ่อนการแก้ไข' : '✏️ แก้ไขข้อมูลฝั่งเรา'}
                </button>
              </div>
            </div>

            {/* แสดงการสรุปข้อมูล หรือ แบบฟอร์มแก้ไข */}
            {!showIssuerDetails ? (
              <div className="text-xs text-slate-600 bg-white p-3.5 rounded border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">{issuerTitle}: {issuerName}</div>
                <div>เลขประจำตัว: {issuerTaxId} | โทร: {issuerPhone} | อีเมล: {issuerEmail}</div>
                <div className="whitespace-pre-line text-slate-500">ที่อยู่: {issuerAddress}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">หัวข้อผู้เสนอ (เช่น ผู้เสนอราคา, ผู้ออกใบ)</label>
                  <input
                    type="text"
                    value={issuerTitle}
                    onChange={(e) => setIssuerTitle(e.target.value)}
                    className="w-full rounded-md border-slate-300 p-2 text-sm border bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อ-นามสกุล / บริษัท ผู้ออกเอกสาร</label>
                  <input
                    type="text"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
                    className="w-full rounded-md border-slate-300 p-2 text-sm border bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">เลขประจำตัวประชาชน / ผู้เสียภาษี</label>
                  <input
                    type="text"
                    value={issuerTaxId}
                    onChange={(e) => setIssuerTaxId(e.target.value)}
                    className="w-full rounded-md border-slate-300 p-2 text-sm border bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={issuerPhone}
                    onChange={(e) => setIssuerPhone(e.target.value)}
                    className="w-full rounded-md border-slate-300 p-2 text-sm border bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={issuerEmail}
                    onChange={(e) => setIssuerEmail(e.target.value)}
                    className="w-full rounded-md border-slate-300 p-2 text-sm border bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">ที่อยู่</label>
                  <textarea
                    rows={2}
                    value={issuerAddress}
                    onChange={(e) => setIssuerAddress(e.target.value)}
                    className="w-full rounded-md border-slate-300 p-2 text-sm border bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: ข้อมูลลูกค้า */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">3. ข้อมูลลูกค้า และ วันที่ออกเอกสาร</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อบริษัทลูกค้า / คุณลูกค้า</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="เช่น บจก. เทคโนโลยี จำกัด"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">วันที่ออกเอกสาร</label>
                <input 
                  type="date" 
                  required
                  className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">ที่อยู่ลูกค้า</label>
                <textarea
                  required
                  rows={2}
                  className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="กรอกที่อยู่ลูกค้า..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">เลขประจำตัวผู้เสียภาษี (ลูกค้า)</label>
                <input
                  type="text"
                  className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                  placeholder="เช่น 01055XXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Section: รายการสินค้า / บริการ */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-sm font-semibold text-slate-800">4. รายการสินค้า / บริการ</label>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  
                  {/* รายละเอียดสินค้า */}
                  <div className="md:col-span-6">
                    <label className="text-xs text-slate-500 md:hidden">รายละเอียด</label>
                    <input 
                      type="text"
                      placeholder="รายละเอียดสินค้า"
                      required
                      className="w-full rounded-md border-slate-300 p-2 border bg-white"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                    />
                  </div>

                  {/* จำนวน */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 md:hidden">จำนวน</label>
                    <input 
                      type="number"
                      placeholder="จำนวน"
                      min="1"
                      required
                      className="w-full rounded-md border-slate-300 p-2 border text-center bg-white"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {/* ราคา */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 md:hidden">ราคา/หน่วย</label>
                    <input
                      type="number"
                      placeholder="ราคา"
                      min="0"
                      step="0.01"
                      required
                      className="w-full rounded-md border-slate-300 p-2 border text-right bg-white"
                      value={item.unit_price || ''}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* ราคารวมต่อแถว */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end text-sm font-semibold text-slate-700">
                    <span className="md:hidden">รวม:</span>
                    {((item.quantity * item.unit_price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บ.
                    
                    {/* ปุ่มลบ */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="text-red-500 hover:text-red-700 ml-4 font-bold text-lg"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="mt-4 text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 transition font-medium"
            >
              + เพิ่มรายการสินค้า
            </button>
          </div>

          {/* ส่วนสรุปราคา */}
          <div className="border-t border-slate-200 pt-6 flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 bg-slate-50 p-4 rounded-md border border-slate-200">
              <div className="flex justify-between py-2 text-slate-600">
                <span>มูลค่ารวม:</span>
                <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
              </div>
              <div className="flex justify-between py-2 text-slate-600 border-b border-slate-200">
                <span>หักภาษี ณ ที่จ่าย (3%):</span>
                <span>{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
              </div>
              <div className="flex justify-between py-3 font-bold text-lg text-emerald-700">
                <span>ยอดชำระสุทธิ:</span>
                <span>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
              </div>
            </div>
          </div>

          {/* ปุ่ม Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white p-4 rounded-md font-medium text-lg hover:bg-emerald-700 disabled:bg-slate-400 transition shadow-sm"
          >
            {loading ? 'กำลังประมวลผล PDF...' : `สร้าง${documentTitle} (ดาวน์โหลด PDF)`}
          </button>
          
        </form>
      </div>
    </main>
  )
}