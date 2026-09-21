FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
