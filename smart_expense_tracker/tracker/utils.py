import csv
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def predict_category(description):
    """Predicts category based on keywords in description."""
    desc = description.lower()
    rules = {
        'Food': ['pizza', 'zomato', 'swiggy', 'hotel', 'restaurant', 'cafe', 'lunch', 'dinner'],
        'Travel': ['uber', 'ola', 'auto', 'petrol', 'bus', 'train', 'flight'],
        'Bills': ['recharge', 'eb', 'wifi', 'rent', 'electricity'],
        'Shopping': ['amazon', 'flipkart', 'mall', 'dress', 'shirt'],
    }
    for category, keywords in rules.items():
        if any(word in desc for word in keywords):
            return category
    return 'Others'

def generate_csv(expenses):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="Expense_Report.csv"'
    writer = csv.writer(response)
    writer.writerow(['Date', 'Description', 'Category', 'Amount'])
    for exp in expenses:
        writer.writerow([exp.date, exp.description, exp.category, exp.amount])
    return response

# utils.py - PDF alignment update
def generate_pdf(expenses):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Expense_Report.pdf"'
    p = canvas.Canvas(response, pagesize=letter)
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(200, 750, "Smart Expense Tracker Report")
    
    # Table Header
    p.setFont("Helvetica-Bold", 12)
    y = 700
    p.drawString(50, y, "Date")
    p.drawString(150, y, "Description")
    p.drawString(300, y, "Category")
    p.drawString(450, y, "Amount")
    p.line(50, y-5, 550, y-5)
    
    # Table Content
    p.setFont("Helvetica", 10)
    y -= 30
    for exp in expenses:
        p.drawString(50, y, f"{exp.date}")
        p.drawString(150, y, f"{exp.description[:20]}")
        p.drawString(300, y, f"{exp.category}")
        p.drawString(450, y, f"Rs. {exp.amount}")
        y -= 20
        if y < 50: 
            p.showPage()
            p.setFont("Helvetica", 10)
            y = 750
            
    p.showPage()
    p.save()
    return response
