# Generated by Django 5.1.1 on 2024-09-30 13:50

import employees.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("employees", "0002_employee_image"),
    ]

    operations = [
        migrations.AlterField(
            model_name="employee",
            name="image",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="employee_images/",
                validators=[employees.models.validate_image],
            ),
        ),
    ]
