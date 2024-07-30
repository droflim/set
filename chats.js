const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const nicks = [
  // Lista de nicks
];

const PAGE_TIMEOUT = 120000; // 2 minutos para cargar cada página
const BATCH_SIZE = 5; // Número de páginas a abrir simultáneamente
const RETRY_DELAY = 10000; // Retraso de 10 segundos entre reintentos
const ACTIVITY_INTERVAL = 30000; // 30 segundos entre actividades

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
    const tasks = pages.map(async (page) => {
      try {
        await page.evaluate(() => {
          window.scrollBy(0, 1); // Simular desplazamiento para mantener la conexión
        });
      } catch (error) {
        console.error('Error al mantener la actividad:', error);
      }
    });

    // Esperar a que todas las tareas de actividad se completen
    await Promise.all(tasks);

    // Esperar antes de la próxima ronda de actividad
    await new Promise(resolve => setTimeout(resolve, ACTIVITY_INTERVAL));
  }
};

(async () => {
  try {
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

  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
})();
