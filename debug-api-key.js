/**
 * Debug detalhado da API Key
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

// Parse simples do .env.local
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["']|["']$/g, '') // Remove aspas
    envVars[key] = value
  }
})

const API_KEY = envVars.ASAAS_API_KEY

console.log('🔍 Debug da API Key')
console.log('=' .repeat(70))
console.log('Tamanho:', API_KEY?.length || 0, 'caracteres')
console.log('Primeiros 30 chars:', API_KEY?.substring(0, 30))
console.log('Últimos 30 chars:', API_KEY?.substring(API_KEY.length - 30))
console.log('Contém $?', API_KEY?.includes('$') ? 'SIM ⚠️' : 'NÃO ✅')
console.log('Contém aspas?', API_KEY?.includes('"') || API_KEY?.includes("'") ? 'SIM ⚠️' : 'NÃO ✅')
console.log('Contém espaços?', API_KEY?.includes(' ') ? 'SIM ⚠️' : 'NÃO ✅')
console.log('\nAPI Key completa (mascarada):')
console.log(API_KEY?.replace(/(.{20})(.*)(.{20})/, '$1' + '*'.repeat(20) + '$3'))
console.log('=' .repeat(70))

// Testa com fetch direto
async function testDirect() {
  console.log('\n📡 Testando com a chave atual...\n')

  const response = await fetch('https://sandbox.asaas.com/api/v3/customers?limit=1', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access_token': API_KEY,
    },
  })

  const data = await response.json()

  console.log('Status:', response.status)
  console.log('Resposta:', JSON.stringify(data, null, 2))

  if (!response.ok) {
    console.log('\n⚠️ A chave não está funcionando.')
    console.log('\n💡 Verifique se:')
    console.log('1. A chave foi copiada COMPLETA do painel Asaas')
    console.log('2. NÃO tem $ no início (deve começar com "aact_")')
    console.log('3. NÃO tem aspas ao redor')
    console.log('4. NÃO tem espaços ou quebras de linha')
  } else {
    console.log('\n✅ Chave funcionando!')
  }
}

testDirect()
