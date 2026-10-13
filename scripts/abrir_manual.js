// Uso: node abrir_manual.js <nome>   (ex.: node abrir_manual.js produto8)
// Abre o link de links/<nome> numa janela normal do Chrome (com imagens) para você
// resolver o captcha à mão. Quando a página do produto carregar, salva links/<nome>.html,
// que o extrator-tiktok usa no lugar do link. Limite: 10 minutos.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PERFIL, CHROME, UA } = require('./comum');
(async () => {
  const nome = process.argv[2];
  const arq = path.join(__dirname, '..', 'links', nome);
  const url = fs.readFileSync(arq, 'utf-8').split('\n')[0].trim();
  const ctx = await chromium.launchPersistentContext(PERFIL, {
    headless: false, executablePath: CHROME, locale: 'pt-BR', userAgent: UA,
    viewport: null, args: ['--disable-blink-features=AutomationControlled', '--start-maximized'],
  });
  let fechou = false; ctx.on('close', () => { fechou = true; });
  const p = ctx.pages()[0] || await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('Janela aberta. Se aparecer captcha, resolva na janela; eu espero a página do produto carregar.');
  let ok = false;
  for (let i = 0; i < 300 && !fechou; i++) {
    await p.waitForTimeout(2000);
    const t = await p.title().catch(() => '');
    if (/\/login/.test(p.url())) { console.log('PRECISA_LOGIN: entre na conta na janela.'); continue; }
    if (t && !/Security Check/i.test(t) && /\/pdp\//.test(p.url())) { ok = true; break; }
  }
  if (!ok) { console.log('NAO_CARREGOU: janela fechada ou tempo esgotado.'); if (!fechou) await ctx.close(); process.exit(1); }
  await p.waitForTimeout(4000);
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 1500); await p.waitForTimeout(700); }
  const destino = arq + '.html';
  fs.writeFileSync(destino, await p.content());
  console.log('SALVO: ' + destino + ' (' + await p.title() + ')');
  await ctx.close();
})().catch(e => { console.error('ERRO: ' + e.message); process.exit(1); });
