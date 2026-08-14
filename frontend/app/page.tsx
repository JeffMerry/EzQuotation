'use client'
import { useState } from 'react'

interface Item {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function Home() {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState(''); 
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);

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
      a.download = `Quotation_${customerName || 'Company'}.pdf`;
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
          <h1 className="text-2xl font-bold text-slate-800">สร้างใบเสนอราคาใหม่</h1>
          <p className="text-slate-500 text-sm mt-1">กรอกข้อมูลด้านล่างเพื่อสร้างไฟล์ PDF</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อบริษัทลูกค้า</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
              <input
                type="text"
                className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-emerald-500 outline-none transition"
                value={customerTaxId}
                onChange={(e) => setCustomerTaxId(e.target.value)}
                placeholder="เช่น 01055XXXXXXXX"
              />
            </div>
          </div>
          {/* item */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-sm font-medium text-slate-700">รายการสินค้า / บริการ</label>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  
                  {/* รายละเอียดสินค้า - กว้างที่สุด */}
                  <div className="md:col-span-6">
                    <label className="text-xs text-slate-500 md:hidden">รายละเอียด</label>
                    <input 
                      type="text"
                      placeholder="รายละเอียดสินค้า"
                      required
                      className="w-full rounded-md border-slate-300 p-2 border"
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
                      className="w-full rounded-md border-slate-300 p-2 border text-center"
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
                      className="w-full rounded-md border-slate-300 p-2 border text-right"
                      value={item.unit_price || ''}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* ราคารวมต่อแถว */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end text-sm font-semibold text-slate-700">
                    <span className="md:hidden">รวม:</span>
                    {((item.quantity * item.unit_price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บ.
                    
                    {/* ปุ่มลบจัดให้อยู่ขวาสุดเสมอ */}
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
            {loading ? 'กำลังประมวลผล PDF...' : 'สร้างใบเสนอราคา (ดาวน์โหลด PDF)'}
          </button>
          
        </form>
      </div>
    </main>
  )
}