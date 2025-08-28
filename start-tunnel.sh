#!/bin/bash
# Start Cloudflare tunnel for invoice-how

if ! command -v cloudflared &> /dev/null && [ ! -f "$HOME/bin/cloudflared" ]; then
    echo "cloudflared not found. Please install it first."
    exit 1
fi

# Use cloudflared from PATH or home bin
CLOUDFLARED=$(command -v cloudflared || echo "$HOME/bin/cloudflared")

echo "Starting Cloudflare tunnel..."
$CLOUDFLARED tunnel run invoice-how