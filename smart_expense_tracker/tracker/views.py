import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, login
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from django.db.models import Sum
from datetime import date, timedelta
from .models import Expense
from .utils import predict_category, generate_csv, generate_pdf

# 🔹 Insight Logic
def get_spending_insight(total_spending, budget=5000):
    if total_spending == 0:
        return "Start tracking your expenses to see insights!", "info"
    if total_spending > budget:
        return "Needs Improvement: You are over budget!", "danger"
    elif total_spending > budget * 0.8:
        return "Warning: You are reaching your limit.", "warning"
    else:
        return "Good: Your spending is healthy.", "success"

# 🔹 Dashboard (FINAL CORRECTED VERSION)
@login_required
def dashboard(request):
    user_expenses = Expense.objects.filter(user=request.user).order_by('-date')
    
    # 🔍 Search Logic
    search_query = request.GET.get('search', '')
    if search_query:
        user_expenses = user_expenses.filter(description__icontains=search_query)

    # 📅 Filter Logic
    filter_type = request.GET.get('filter')
    filtered_expenses = user_expenses

    if filter_type == 'today':
        filtered_expenses = user_expenses.filter(date=date.today())
    elif filter_type == 'week':
        week_ago = date.today() - timedelta(days=7)
        filtered_expenses = user_expenses.filter(date__gte=week_ago)

    # 💰 Totals Calculations
    total_amount = filtered_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
    # Floating point calculation for average
    daily_avg = round(float(total_amount) / 30, 2)

    # 📊 Monthly Summary
    current_month = date.today().month
    monthly_total = user_expenses.filter(date__month=current_month).aggregate(Sum('amount'))['amount__sum'] or 0

    # 💡 Insight Message
    insight_message, insight_status = get_spending_insight(monthly_total)

    # 📊 Pie Chart Data (Grouping Auto/Bus into "Travel" etc.)
    # .values('category') use pannuvadhaal unique categories mattum aggregate aagum
    category_qs = filtered_expenses.values('category').annotate(total=Sum('amount'))
    
    labels = [item['category'] for item in category_qs]
    values = [float(item['total']) for item in category_qs]

    # 📈 Monthly Trends Data (For the trendChart)
    # Kadandha 6 maasathukana spending trend logic
    trend_labels = []
    trend_values = []
    for i in range(5, -1, -1):
        target_date = date.today() - timedelta(days=i*30)
        month_name = target_date.strftime("%b %Y")
        month_sum = user_expenses.filter(date__month=target_date.month, date__year=target_date.year).aggregate(Sum('amount'))['amount__sum'] or 0
        trend_labels.append(month_name)
        trend_values.append(float(month_sum))
    
    context = {
        'expenses': user_expenses,
        'total_amount': total_amount,
        'daily_avg': daily_avg,
        'monthly_total': monthly_total,
        'budget': 5000,
        'labels': labels,  
        'values': values,  
        'trend_labels': trend_labels,
        'trend_values': trend_values,
        'insight_message': insight_message,
        'insight_status': insight_status,
        'search_query': search_query,
    }

    return render(request, 'dashboard.html', context)

# 🔹 Add Expense
@login_required
def add_expense(request):
    if request.method == "POST":
        desc = request.POST.get('description')
        amt = request.POST.get('amount')
        dt = request.POST.get('date')
        
        # predict_category function 'bus' nu vandha 'Travel' nu return panna num
        cat = predict_category(desc)
        
        Expense.objects.create(
            user=request.user,
            description=desc,
            amount=amt,
            date=dt,
            category=cat
        )
    return redirect('dashboard')

# 🔹 Delete Expense
@login_required
def delete_expense(request, pk):
    expense = get_object_or_404(Expense, pk=pk, user=request.user)
    expense.delete()
    return redirect('dashboard')

# 🔹 Export Report
@login_required
def export_report(request, format):
    expenses = Expense.objects.filter(user=request.user)
    if format == 'csv':
        return generate_csv(expenses)
    return generate_pdf(expenses)

# 🔹 Auth Views
def logout_view(request):
    logout(request)
    return redirect('login')

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, "Account created successfully!")
            login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})