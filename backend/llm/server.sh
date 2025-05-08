#!/usr/bin/env bash
cd "$(dirname "$0")/../.."          # корень проекта
./llama.cpp/server \
  -m backend/llm/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf \
  -c 4096 -ngl 32 -t 6              # context=4096, GPU‑offload=32 layers, 6 потоков
