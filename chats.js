const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Usa el plugin de stealth para evitar ser detectado como un bot
puppeteer.use(StealthPlugin());

const nicks = [
  'maria', 'diego', 'ana', 'juan', 'luisa', 'pedro', 'carla', 'jose', 'rosa', 'jorge',
  'lina', 'manuel', 'sandra', 'alberto', 'sofia', 'oscar', 'carmen', 'raul', 'valeria', 'andres',
  'veronica', 'marco', 'natalia', 'sebastian', 'isabella', 'martin', 'paola', 'felipe', 'camila', 'julian',
  'elena', 'ricardo', 'claudia', 'sergio', 'silvia', 'javier', 'veronica', 'carlos', 'beatriz', 'felipe',
  'amanda', 'jorge', 'marta', 'victor', 'natalia', 'gabriel', 'lina', 'juliana', 'angelica', 'diego',
  'jesus', 'silvana', 'santiago', 'laura', 'manuel', 'adriana', 'gabriela', 'ivan', 'paola', 'diana'
];

const MAX_CONCURRENT_PAGES = 5; // Número máximo de páginas en paralelo

const openPageWithRetry = async (browser, nick, retries = 3) => {
  const page = await browser.newPage();
  let attempt = 0;
  while (attempt < retries) {
    try {
      await page.goto(`https://html5-chat.com/chat/48967/65cace86434d3/${nick}`, {
        waitUntil: 'networkidle2',
        timeout: 60000 // Tiempo de espera de 60 segundos
      });
      return page;
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido para ${nick}:`, error);
      attempt++;
      if (attempt >= retries) {
        await page.close();
        throw error;
      }
    }
  }
};

const openPages = async (browser, nicks) => {
  const pages = [];
  for (let i = 0; i < nicks.length; i += MAX_CONCURRENT_PAGES) {
    const batch = nicks.slice(i, i + MAX_CONCURRENT_PAGES);
    const batchPages = await Promise.all(batch.map(nick => openPageWithRetry(browser, nick)));
    pages.push(...batchPages);
  }
  return pages;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const pages = await openPages(browser, nicks);

  const maintainActivity = async () => {
    for (const page of pages) {
      try {
        await page.evaluate(() => {
          window.scrollBy(0, 1); // Simular desplazamiento para mantener la conexión
        });
      } catch (error) {
        console.error('Error al mantener la actividad:', error);
      }
    }
  };

  // Mantener la actividad cada 30 segundos
  setInterval(maintainActivity, 30000); // Ejecutar cada 30 segundos

  // Mantener el script en ejecución indefinidamente
  console.log('Todos los nicks están ahora conectados y la actividad se mantiene.');
  await new Promise(resolve => {}); // Mantener el script en ejecución indefinidamente

  // Cerrar todas las páginas (esto solo se ejecutará si se termina el script)
  for (const page of pages) {
    await page.close();
  }

  await browser.close();
})();
