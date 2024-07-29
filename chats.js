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

const PAGE_TIMEOUT = 120000; // 2 minutos para cargar cada página
const BATCH_SIZE = 5; // Número de páginas a abrir simultáneamente
const RETRY_DELAY = 10000; // Retraso de 10 segundos entre reintentos

const openPageWithRetry = async (browser, nick, retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://html5-chat.com/chat/48967/65cace86434d3/${nick}`, {
        waitUntil: 'networkidle2',
        timeout: PAGE_TIMEOUT
      });
      console.log(`Página abierta para ${nick}`);
      return page;
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido para ${nick}:`, error);
      attempt++;
      await page.close(); // Cerrar la página en caso de error
      if (attempt < retries) {
        console.log(`Reintentando en ${RETRY_DELAY / 1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error(`No se pudo abrir la página para ${nick} después de ${retries} intentos.`);
      }
    }
  }
};

const openPagesInBatches = async (browser, nicks) => {
  const pages = [];
  for (let i = 0; i < nicks.length; i += BATCH_SIZE) {
    const batch = nicks.slice(i, i + BATCH_SIZE);
    try {
      const batchPages = await Promise.all(batch.map(nick => openPageWithRetry(browser, nick)));
      pages.push(...batchPages);
      console.log(`Lote de ${batch.length} nicks abierto.`);
      await new Promise(resolve => setTimeout(resolve, 30000)); // Espera 30 segundos entre lotes
    } catch (error) {
      console.error('Error al abrir el lote de páginas:', error);
    }
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
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const pages = await openPagesInBatches(browser, nicks);

    console.log('Todos
