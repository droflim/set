const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const nicks = [
  'maria28', 'diego__', 'analinda', 'juan', 'luisa', 'pedro', 'carla', 'josecarma', 'rositaa', 'jorge',
  'linaCaxonda', 'manuel', 'Sandra', 'alberto', 'SofitaHot', 'oscar', 'carmen', 'raul', 'valeria', 'andres',
  'Verito', 'marco', 'Naty', 'sebastian', 'isis--', 'martin', 'Paolita', 'felipe', 'camila', 'julian',
  'ElenisCam', 'ricardo', 'claudis', 'sergio', 'Silvina'
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const pages = [];

  // Abrir una nueva página para cada nick en paralelo
  for (const nick of nicks) {
    const page = await browser.newPage();
    await page.goto(`https://html5-chat.com/chat/48967/65cace86434d3/${nick}`, { waitUntil: 'networkidle2' });

    // Agregar la página a la lista de páginas
    pages.push(page);
  }

  // Función para mantener la actividad en todas las páginas
  const maintainActivity = async () => {
    for (const page of pages) {
      try {
        // Simular una actividad ligera, como un pequeño desplazamiento
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
