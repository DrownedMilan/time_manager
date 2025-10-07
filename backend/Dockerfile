FROM python:3.13-slim-bookworm

ENV  PYTHONUNBUFFERED 1 \
	PYTHONDONTWRITEBYTECODE 1

RUN mkdir /app

WORKDIR /app

RUN pip install --upgrade pip

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]