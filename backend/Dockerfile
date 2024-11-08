# Use Python 3.12 as the base image.
FROM python:3.12-slim

# Set environment variables.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory.
WORKDIR /code

# Install dependencies.
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code.
COPY . /code/

# Expose port 8000.
EXPOSE 8000

# Run the application.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
