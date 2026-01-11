"""
Génération de factures PDF pour LimaJS Motors
Utilise ReportLab pour créer des factures professionnelles
"""

import io
import os
import uuid
from datetime import datetime
from decimal import Decimal

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

import boto3

# Configuration
S3_BUCKET = os.environ.get('INVOICE_BUCKET', 'limajs-invoices')
REGION = 'us-east-1'

s3 = boto3.client('s3', region_name=REGION)


def generate_invoice_number():
    """Génère un numéro de facture unique"""
    now = datetime.now()
    random_part = str(uuid.uuid4())[:6].upper()
    return f"INV-{now.year}-{now.month:02d}-{random_part}"


def create_invoice_pdf(invoice_data: dict) -> bytes:
    """
    Génère un PDF de facture
    
    Args:
        invoice_data: {
            'invoiceNumber': str,
            'date': str,
            'dueDate': str,
            'status': 'unpaid' | 'paid',
            'customer': {
                'name': str,
                'email': str,
                'phone': str
            },
            'items': [{
                'description': str,
                'quantity': int,
                'unitPrice': Decimal,
                'total': Decimal
            }],
            'subtotal': Decimal,
            'total': Decimal,
            'currency': str,
            'period': {'start': str, 'end': str}  # for subscriptions
        }
    """
    if not REPORTLAB_AVAILABLE:
        raise ImportError("ReportLab is required for PDF generation. Install with: pip install reportlab")
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#2563EB'), spaceAfter=20)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#1f2937'), spaceBefore=15, spaceAfter=10)
    normal_style = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#374151'))
    right_style = ParagraphStyle('Right', parent=styles['Normal'], fontSize=10, alignment=TA_RIGHT)
    
    # Header
    elements.append(Paragraph("LIMAJS MOTORS", title_style))
    elements.append(Paragraph("Transport Collectif - Haiti", normal_style))
    elements.append(Spacer(1, 20))
    
    # Invoice Info
    status_color = colors.HexColor('#10B981') if invoice_data['status'] == 'paid' else colors.HexColor('#EF4444')
    status_text = 'PAYÉE' if invoice_data['status'] == 'paid' else 'NON PAYÉE'
    
    invoice_info = [
        ['FACTURE', f"#{invoice_data['invoiceNumber']}"],
        ['Date', invoice_data['date']],
        ['Échéance', invoice_data['dueDate']],
        ['Statut', status_text]
    ]
    
    info_table = Table(invoice_info, colWidths=[4*cm, 6*cm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
        ('TEXTCOLOR', (-1, -1), (-1, -1), status_color),
        ('FONTNAME', (-1, -1), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))
    
    # Customer Info
    elements.append(Paragraph("FACTURER À:", heading_style))
    customer = invoice_data['customer']
    elements.append(Paragraph(f"<b>{customer['name']}</b>", normal_style))
    elements.append(Paragraph(customer['email'], normal_style))
    if customer.get('phone'):
        elements.append(Paragraph(customer['phone'], normal_style))
    elements.append(Spacer(1, 20))
    
    # Items Table
    elements.append(Paragraph("DÉTAILS", heading_style))
    
    table_data = [['Description', 'Qté', 'Prix Unitaire', 'Total']]
    for item in invoice_data['items']:
        table_data.append([
            item['description'],
            str(item['quantity']),
            f"{item['unitPrice']} {invoice_data['currency']}",
            f"{item['total']} {invoice_data['currency']}"
        ])
    
    items_table = Table(table_data, colWidths=[8*cm, 2*cm, 3.5*cm, 3.5*cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 10))
    
    # Total
    total_data = [
        ['', '', 'Sous-total:', f"{invoice_data['subtotal']} {invoice_data['currency']}"],
        ['', '', 'TOTAL:', f"{invoice_data['total']} {invoice_data['currency']}"]
    ]
    total_table = Table(total_data, colWidths=[8*cm, 2*cm, 3.5*cm, 3.5*cm])
    total_table.setStyle(TableStyle([
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (-2, -1), (-1, -1), 12),
        ('TEXTCOLOR', (-1, -1), (-1, -1), colors.HexColor('#2563EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(total_table)
    
    # Period (for subscriptions)
    if invoice_data.get('period'):
        elements.append(Spacer(1, 20))
        period = invoice_data['period']
        elements.append(Paragraph(f"<b>Période:</b> {period['start']} - {period['end']}", normal_style))
    
    # Footer
    elements.append(Spacer(1, 40))
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#9CA3AF'), alignment=TA_CENTER)
    elements.append(Paragraph("Merci pour votre confiance!", footer_style))
    elements.append(Paragraph("LimaJS Motors - Transport Collectif", footer_style))
    elements.append(Paragraph("Email: contact@limajs.com", footer_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def upload_invoice_to_s3(pdf_bytes: bytes, invoice_number: str) -> str:
    """Upload la facture PDF vers S3 et retourne l'URL"""
    key = f"invoices/{invoice_number}.pdf"
    
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=pdf_bytes,
        ContentType='application/pdf'
    )
    
    # Generate presigned URL (valid 7 days)
    url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': S3_BUCKET, 'Key': key},
        ExpiresIn=604800  # 7 days
    )
    
    return url


def generate_and_upload_invoice(invoice_data: dict) -> dict:
    """
    Génère une facture PDF et l'upload vers S3
    
    Returns:
        {
            'invoiceNumber': str,
            'pdfUrl': str,
            'pdfBytes': bytes
        }
    """
    # Generate invoice number if not provided
    if not invoice_data.get('invoiceNumber'):
        invoice_data['invoiceNumber'] = generate_invoice_number()
    
    # Set date if not provided
    if not invoice_data.get('date'):
        invoice_data['date'] = datetime.now().strftime('%d/%m/%Y')
    
    # Generate PDF
    pdf_bytes = create_invoice_pdf(invoice_data)
    
    # Upload to S3
    pdf_url = upload_invoice_to_s3(pdf_bytes, invoice_data['invoiceNumber'])
    
    return {
        'invoiceNumber': invoice_data['invoiceNumber'],
        'pdfUrl': pdf_url,
        'pdfBytes': pdf_bytes
    }


# Example usage
if __name__ == '__main__':
    test_data = {
        'invoiceNumber': 'INV-2026-01-ABC123',
        'date': '10/01/2026',
        'dueDate': '17/01/2026',
        'status': 'unpaid',
        'customer': {
            'name': 'Jacques Bonhomme',
            'email': 'client1@gmail.com',
            'phone': '+509 4111 1111'
        },
        'items': [
            {
                'description': 'Pass Mensuel - Janvier 2026',
                'quantity': 1,
                'unitPrice': 2500,
                'total': 2500
            }
        ],
        'subtotal': 2500,
        'total': 2500,
        'currency': 'HTG',
        'period': {
            'start': '10/01/2026',
            'end': '10/02/2026'
        }
    }
    
    pdf = create_invoice_pdf(test_data)
    with open('test_invoice.pdf', 'wb') as f:
        f.write(pdf)
    print("✅ Test invoice generated: test_invoice.pdf")
