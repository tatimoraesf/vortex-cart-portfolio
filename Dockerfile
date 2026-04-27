# Usando a versão 'bookworm' (mais atualizada que a padrão)
FROM node:20-bookworm

# Instala ferramentas essenciais de compilação
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia os arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Faz o build do TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]