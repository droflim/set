const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Usa el plugin de stealth para evitar ser detectado como un bot
puppeteer.use(StealthPlugin());

// Lista de 50 nicks
const nicks = [
  'maria', 'diego', 'ana', 'juan', 'luisa', 'pedro', 'carla', 'jose', 'rosa', 'jorge',
  'lina', 'manuel', 'sandra', 'alberto', 'sofia', 'oscar', 'carmen', 'raul', 'valeria', 'andres',
  'veronica', 'marco', 'natalia', 'sebastian', 'isabella', 'martin', 'paola', 'felipe', 'camila', 'julian',
  'elena', 'ricardo', 'claudia', 'sergio', 'silvia', 'javier', 'veronica', 'carlos', 'beatriz', 'felipe',
  'amanda', 'jorge', 'marta', 'victor', 'natalia', 'gabriel', 'lina', 'juliana', 'angelica', 'diego',
  'jesus', 'silvana', 'santiago', 'laura', 'manuel', 'adriana', 'gabriela', 'ivan', 'paola', 'diana'
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const pages = [];

  // Abrir una nueva página para cada nick en paralelo
  for (const nick of nicks) {
    const page = await browser.newPage();
    await page.goto(`https://html5-chat.com/chat/48967/65cace86434d3/${nick}`, { waitUntil: 'networkidle2' });

    // Agregar la página a la lista de páginas
    pages.push(page);

    // Esperar un breve intervalo antes de abrir la siguiente página
    await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
  }

  // Función para mantener la actividad en todas las páginas
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

  // Nota: Este código no llegará a ejecutar la parte de cierre ya que el script no terminará
})();
