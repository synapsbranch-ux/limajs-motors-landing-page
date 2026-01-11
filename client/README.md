# 🚀 LimaJS Motors - AI Prompt Engineering System

## Overview

Ce document contient les **mega-prompts** complets pour générer les 3 applications frontend de LimaJS Motors :

1. **Admin Dashboard** - React Vite + TypeScript
2. **Passenger App** - React Native (Expo)
3. **Driver App** - React Native (Expo)

---

## 🛠️ MCP Servers à Configurer

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@anthropic/shadcn-mcp-server@latest"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "supabase-mcp-server@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropic/sequential-thinking-mcp@latest"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@anthropic/brave-search-mcp-server@latest"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

---

## 📡 API Configuration

```
BASE_URL: https://api.limajsmotors.com
APP_URL: https://app.limajsmotors.com
AUTH: Bearer JWT Token (from /auth/login)
```

---
