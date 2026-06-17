from django.db import models
from django.contrib.auth.models import User


class Expense(models.Model):

    # Using TextChoices is the professional way to handle categories
    class Category(models.TextChoices):
        FOOD = 'Food', 'Food'
        TRAVEL = 'Travel', 'Travel'
        SHOPPING = 'Shopping', 'Shopping'
        BILLS = 'Bills', 'Bills'
        ENTERTAINMENT = 'Entertainment', 'Entertainment'
        OTHERS = 'Others', 'Others'

    # Fields
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.OTHERS
    )

    date = models.DateField()

    monthly_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount}"