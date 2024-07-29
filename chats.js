const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const nicks = [
  'maria', 'diego', 'ana', 'juan', 'luisa', 'pedro', 'carla', 'jose', 'rosa', 'jorge',
  'lina', 'manuel', 'sandra', 'alberto', 'sofia', 'oscar', 'carmen', 'raul', 'valeria', 'andres',
  'veronica', 'marco', 'natalia', 'sebastian', 'isabella', 'martin', 'paola', 'felipe', 'camila', 'julian',
  'elena', 'ricardo', 'claudia', 'sergio', 'silvia', 'andrea', 'juanita', 'javier', 'patricia', 'manuel',
  'camilo', 'ana-maria', 'jessica', 'mario', 'valentina', 'martinez', 'ana-silvia', 'veronica', 'miguel', 'johana'
];

const MAX_RETRIES = 3; // Número máximo de reintentos
const PAGE_TIMEOUT = 120000; // 120 segundos
const BATCH_SIZE = 10; // Número de páginas a abrir simultáneamente

const openPageWithRetry = async (browser, nick, retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://html5-chat.com/chat/48967/65cace86434d3/${nick}`, {
        waitUntil: 'networkidle2',
        timeout: PAGE_TIMEOUT
      });
      return page;
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido para ${nick}:`, error);
      attempt++;
      await page.close(); // Cerrar la página en caso de error
      if (attempt >= retries) {
        console.error(`No se pudo abrir la página para ${nick} después de ${retries} intentos.`);
        throw error; // Lanzar el error si se agotaron los reintentos
      }
    }
  }
};

const openPagesInBatches = async (browser, nicks) => {
  const pages = [];
  for (let i = 0; i < nicks.length; i += BATCH_SIZE) {
    const batch = nicks.slice(i, i + BATCH_SIZE);
    const batchPages = await Promise.all(batch.map(nick => openPageWithRetry(browser, nick)));
    pages.push(...batchPages);
    await new Promise(resolve => setTimeout(resolve, 10000)); // Espera 10 segundos entre lotes
  }
  return pages;
};

const maintainActivity = async (pages) => {
  while (true) {
    for (const page of pages) {
      try {
        await page.evaluate(() => {
          window.scrollBy(0, 1); // Simular desplazamiento para mantener la conexión
        });
      } catch (error) {
        console.error('Error al mantener la actividad:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 30000)); // Ejecutar cada 30 segundos
  }
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const pages = await openPagesInBatches(browser, nicks);

  console.log('Todos los nicks están ahora conectados.');

  // Mantener la actividad en las páginas abiertas
  maintainActivity(pages);

  // Mantener el script en ejecución indefinidamente
  await new Promise(resolve => {}); // Mantener el script en ejecución indefinidamente

  // Cerrar todas las páginas (esto solo se ejecutará si se termina el script)
  for (const page of pages) {
    await page.close();
  }

  await browser.close();
})();
