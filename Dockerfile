FROM node:22-slim

WORKDIR /app

COPY mcp-server/package*.json ./
RUN npm ci --omit=dev

COPY mcp-server/src ./src

ENV HERMES_BASE_URL=https://hermesplant.com
ENV HERMES_MCP_URL=https://hermesplant.com/mcp

CMD ["node", "src/server.js"]
