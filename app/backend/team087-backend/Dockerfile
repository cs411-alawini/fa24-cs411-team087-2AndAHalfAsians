FROM python:3.9

WORKDIR /app

# Copy the requirements and install dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the application source code, including `query_loader.py`
COPY ./src /app/src

# Expose the application port
EXPOSE 8080

# Set the default command
CMD ["fastapi", "run", "src/main.py", "--port", "8080"]
