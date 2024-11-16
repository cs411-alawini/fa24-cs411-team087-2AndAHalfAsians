
FROM python:3.9


WORKDIR /app


COPY ./requirements.txt /app/requirements.txt


RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

EXPOSE 8080

COPY ./src /app/src


CMD ["fastapi", "run", "src/main.py", "--port", "8080"]