// Abre o Chromium visível para você entrar na sua conta do TikTok uma vez.
// A sessão fica salva em scripts/.perfil-tiktok e é reutilizada pelo ler_produto.js.
const { chromium } = require('playwright');
const { PERFIL, CHROME, UA } = require('./comum');
(async () => {
  const ctx = await chromium.launchPersistentContext(PERFIL, {
    headless: false, executablePath: CHROME, locale: 'pt-BR', userAgent: UA,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const p = ctx.pages()[0] || await ctx.newPage();
  await p.goto('https://www.tiktok.com/login');
  console.log('Faça login na janela do navegador. Ela fecha sozinha quando o login for detectado (limite: 10 min).');
  let fechou = false; ctx.on('close', () => { fechou = true; });
  for (let i = 0; i < 300 && !fechou; i++) {
    const ck = await ctx.cookies('https://www.tiktok.com').catch(() => []);
    if (ck.some(c => c.name === 'sessionid' && c.value)) {
      console.log('LOGIN OK - sessão salva.');
      await new Promise(r => setTimeout(r, 3000));
      await ctx.close(); return;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('LOGIN NAO DETECTADO - janela fechada ou tempo esgotado.');
  if (!fechou) await ctx.close();
  process.exit(1);
})();
