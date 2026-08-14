import os
from datetime import datetime
from typing import List, Optional
from urllib.parse import quote

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import jinja2
from pydantic import BaseModel
from pythainlp.util import bahttext
from weasyprint import HTML

app = FastAPI()

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    description: str
    quantity: int
    unit_price: float

class QuotationData(BaseModel):
    customer_name: str
    customer_address: str    
    customer_tax_id: Optional[str] = ""
    date: str
    quotation_number: Optional[str] = None
    valid_until: Optional[str] = None
    document_title: Optional[str] = "ใบเสนอราคา"
    items: List[Item]

@app.post("/api/generate-pdf")
async def generate_pdf(data: QuotationData):
    try:
        date_obj = datetime.strptime(data.date, "%Y-%m-%d")
        formatted_date = date_obj.strftime("%d/%m/%Y")
    except Exception:
        formatted_date = data.date

    formatted_valid_until = ""
    if data.valid_until:
        try:
            valid_obj = datetime.strptime(data.valid_until, "%Y-%m-%d")
            formatted_valid_until = valid_obj.strftime("%d/%m/%Y")
        except Exception:
            formatted_valid_until = data.valid_until

    quotation_no = data.quotation_number or f"QT-{datetime.now().strftime('%Y%m%d')}-001"
    doc_title = data.document_title or "ใบเสนอราคา"

    subtotal = sum(item.quantity * item.unit_price for item in data.items)
    vat = subtotal * 0.03
    grand_total = subtotal - vat

    thai_baht_text = bahttext(grand_total)

    template_loader = jinja2.FileSystemLoader(searchpath="./")
    template_env = jinja2.Environment(loader=template_loader)
    template = template_env.get_template("template.html")

    rendered_html = template.render(
        document_title=doc_title,
        quotation_number=quotation_no,
        date=formatted_date,
        valid_until=formatted_valid_until,
        customer_name=data.customer_name,
        customer_address=data.customer_address,
        customer_tax_id=data.customer_tax_id,  
        items=data.items,
        subtotal=subtotal,
        vat=vat,
        grand_total=grand_total,
        bahttext=thai_baht_text
    )

    pdf_bytes = HTML(string=rendered_html).write_pdf()

    encoded_filename = quote(f"{doc_title}.pdf")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=\"document.pdf\"; filename*=UTF-8''{encoded_filename}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)