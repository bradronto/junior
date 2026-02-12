#!/bin/bash
echo "🚀 Starting Cloudflare Tunnel to expose Ollama..."
echo ""
echo "Make sure Ollama is running first: ollama serve"
echo ""
cloudflared tunnel --url http://localhost:11434
