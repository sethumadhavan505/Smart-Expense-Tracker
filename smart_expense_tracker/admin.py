from django.contrib import admin
from .tracker.models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    # Columns to display in the list view
    list_display = ('date', 'description', 'category', 'amount', 'user')
    
    # Enable filtering by category and date on the right sidebar
    list_filter = ('category', 'date', 'user')
    
    # Add a search bar to find expenses by description
    search_fields = ('description', 'notes')
    
    # Organize fields when editing an expense
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'description', 'amount', 'category', 'date')
        }),
        ('Additional Details', {
            'fields': ('notes',),
            'classes': ('collapse',) # Hides notes by default for a cleaner look
        }),
    )

    # Automatically set the user to the currently logged-in admin user
    def save_model(self, request, obj, form, change):
        if not obj.user:
            obj.user = request.user
        super().save_model(request, obj, form, change)