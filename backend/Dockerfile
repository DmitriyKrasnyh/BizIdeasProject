FROM python:3.11-slim

# -- системные либы для llama.cpp
RUN apt-get update && apt-get install -y build-essential libopenblas-dev git curl && \
    rm -rf /var/lib/apt/lists/*

# -- директории
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# -- собрать / установить llama-cpp-python
RUN pip install --no-cache-dir llama-cpp-python[server]==0.2.66 fastapi uvicorn

# -- скачать модель (4 GB) во время билда
# (Render билд-шагу дают ~45 мин и 7 GB RAM – OK)
RUN mkdir -p /models && \
    curl -L -o /models/mistral.gguf \
    https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf

COPY llm/serve.py /app/serve.py

EXPOSE 8001
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8001"]
