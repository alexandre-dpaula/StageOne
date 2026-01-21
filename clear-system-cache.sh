#!/bin/bash

# ============================================================================
# LIMPAR CACHES DO SISTEMA - NEXT.JS, NODE, NPM, VERCEL
# ============================================================================
# Este script limpa todos os caches do ambiente de desenvolvimento
# Execute com: bash clear-system-cache.sh ou chmod +x clear-system-cache.sh && ./clear-system-cache.sh
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         🧹 LIMPEZA DE CACHES DO SISTEMA 🧹                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# 1. LIMPAR CACHE DO NEXT.JS
# ============================================================================
echo "🗑️ [1/8] Limpando cache do Next.js..."

if [ -d ".next" ]; then
    rm -rf .next
    echo "   ✅ Pasta .next removida"
else
    echo "   ⚠️ Pasta .next não encontrada (ok)"
fi

# ============================================================================
# 2. LIMPAR NODE_MODULES (opcional - comentado por padrão)
# ============================================================================
echo "🗑️ [2/8] Verificando node_modules..."

# Descomente a linha abaixo se quiser deletar node_modules também
# rm -rf node_modules
# echo "   ✅ node_modules removido"

echo "   ⏭️ node_modules mantido (descomente no script para remover)"

# ============================================================================
# 3. LIMPAR CACHE DO NPM
# ============================================================================
echo "🗑️ [3/8] Limpando cache do npm..."

npm cache clean --force 2>/dev/null || echo "   ⚠️ npm não disponível"
echo "   ✅ Cache do npm limpo"

# ============================================================================
# 4. LIMPAR CACHE DO YARN (se estiver usando)
# ============================================================================
echo "🗑️ [4/8] Limpando cache do yarn..."

if command -v yarn &> /dev/null; then
    yarn cache clean 2>/dev/null || echo "   ⚠️ Falha ao limpar cache do yarn"
    echo "   ✅ Cache do yarn limpo"
else
    echo "   ⏭️ Yarn não instalado (ok)"
fi

# ============================================================================
# 5. LIMPAR CACHE DO TURBOPACK/SWC
# ============================================================================
echo "🗑️ [5/8] Limpando cache do Turbopack/SWC..."

if [ -d ".turbo" ]; then
    rm -rf .turbo
    echo "   ✅ Pasta .turbo removida"
else
    echo "   ⏭️ Pasta .turbo não encontrada (ok)"
fi

if [ -d ".swc" ]; then
    rm -rf .swc
    echo "   ✅ Pasta .swc removida"
else
    echo "   ⏭️ Pasta .swc não encontrada (ok)"
fi

# ============================================================================
# 6. LIMPAR ARQUIVOS TEMPORÁRIOS
# ============================================================================
echo "🗑️ [6/8] Limpando arquivos temporários..."

# Remover arquivos .DS_Store (macOS)
find . -name ".DS_Store" -type f -delete 2>/dev/null
echo "   ✅ Arquivos .DS_Store removidos"

# Remover logs antigos
find . -name "*.log" -type f -delete 2>/dev/null
echo "   ✅ Arquivos .log removidos"

# ============================================================================
# 7. LIMPAR CACHE DO VERCEL (local)
# ============================================================================
echo "🗑️ [7/8] Limpando cache do Vercel local..."

if [ -d ".vercel" ]; then
    rm -rf .vercel/.cache 2>/dev/null
    echo "   ✅ Cache do Vercel limpo"
else
    echo "   ⏭️ Pasta .vercel não encontrada (ok)"
fi

# ============================================================================
# 8. LIMPAR CACHE DO TYPESCRIPT
# ============================================================================
echo "🗑️ [8/8] Limpando cache do TypeScript..."

if [ -f "tsconfig.tsbuildinfo" ]; then
    rm tsconfig.tsbuildinfo
    echo "   ✅ tsconfig.tsbuildinfo removido"
else
    echo "   ⏭️ tsconfig.tsbuildinfo não encontrado (ok)"
fi

# ============================================================================
# RESUMO FINAL
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         ✅ LIMPEZA CONCLUÍDA COM SUCESSO! ✅              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 CACHES LIMPOS:"
echo "   ✓ Next.js (.next)"
echo "   ✓ npm cache"
echo "   ✓ yarn cache (se instalado)"
echo "   ✓ Turbopack/SWC (.turbo, .swc)"
echo "   ✓ Arquivos temporários (.DS_Store, *.log)"
echo "   ✓ Cache do Vercel local"
echo "   ✓ TypeScript build info"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "   1. Se removeu node_modules: npm install"
echo "   2. Reinicie o servidor de desenvolvimento: npm run dev"
echo "   3. Limpe o cache do navegador (Cmd+Shift+R)"
echo ""
echo "🎉 Pronto!"
echo ""
