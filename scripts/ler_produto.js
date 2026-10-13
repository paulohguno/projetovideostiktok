// Uso: node ler_produto.js "<link do TikTok Shop>"
// Usa navegador visível (fora da tela), pois o headless cai em captcha.
// Imprime o texto da página do produto (sem imagens). Sai com código 2 se precisar de login.
const { chromium } = require('playwright');
const { PERFIL, CHROME, UA } = require('./comum');
(async () => {
  const url = process.argv[2];
  const ctx = await chromium.launchPersistentContext(PERFIL, {
    headless: false, executablePath: CHROME, locale: 'pt-BR', userAgent: UA,
    viewport: { width: 1366, height: 900 }, args: ['--disable-blink-features=AutomationControlled'],
  });
  await ctx.route('**/*', r => ['image', 'media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());
  const p = ctx.pages()[0] || await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(6000);
  if (/Security Check/i.test(await p.title())) {
    console.log('CAPTCHA: o TikTok pediu verificação. Tente de novo mais tarde.');
    await ctx.close(); process.exit(3);
  }
  if (/\/login/.test(p.url())) {
    console.log('PRECISA_LOGIN: rode "node scripts/login.js" e entre na conta do TikTok.');
    await ctx.close(); process.exit(2);
  }
  // rola a página para carregar descrição e especificações
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 1500); await p.waitForTimeout(700); }
  const texto = await p.evaluate(() => document.body.innerText);
  console.log('TITULO DA PAGINA: ' + await p.title());
  console.log('URL FINAL: ' + p.url());
  console.log('---- TEXTO DA PAGINA ----');
  console.log(texto.replace(/\n{2,}/g, '\n').slice(0, 20000));
  await ctx.close();
})().catch(e => { console.error('ERRO: ' + e.message); process.exit(1); });
