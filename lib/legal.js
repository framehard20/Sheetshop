// The three legal pages (aviso legal, términos de uso, privacidad), rendered
// on the server so the owner's details in lib/titular.js appear the moment
// they're filled in. Spanish: the reference text in Spain; English visitors get
// a one-line note. Served at /aviso-legal, /terminos and /privacidad.
import { CONTACT_EMAIL, hayTitular, LEGAL_ACTUALIZADO, SITE_DOMAIN, TITULAR } from "./titular.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const mail = `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`;
const titularLines = () =>
  hayTitular()
    ? `<li><b>Titular:</b> ${esc(TITULAR.nombre)}</li><li><b>NIF:</b> ${esc(TITULAR.nif)}</li><li><b>Domicilio:</b> ${esc(TITULAR.domicilio)}</li>`
    : "";

const PAGES = {
  "aviso-legal": {
    title: "Aviso legal",
    description: "Quién está detrás de Masterspread, a qué se dedica y cómo contactar.",
    body: () => `
<h2>Datos del titular</h2>
<ul>${titularLines()}<li><b>Email de contacto:</b> ${mail}</li><li><b>Web:</b> ${SITE_DOMAIN}</li></ul>
<h2>A qué se dedica</h2>
<p>Masterspread es un buscador y catálogo de productos que reúne listas públicas de terceros (hojas de cálculo con enlaces a tiendas en línea) y las muestra ordenadas, con su foto, su precio aproximado y su enlace de compra. Masterspread no vende ni envía ningún producto. Se financia con las comisiones de programas de afiliados de agentes de compra, como se explica en los <a href="/terminos">Términos de uso</a>.</p>
<h2>Condiciones y privacidad</h2>
<p>El uso de la web se rige por los <a href="/terminos">Términos de uso</a>. Cómo se tratan los datos personales y qué se guarda en tu navegador está en la <a href="/privacidad">Política de privacidad</a>.</p>
<h2>Propiedad intelectual</h2>
<p>El diseño, los textos y el código de Masterspread son de su titular. Las marcas, logotipos, nombres de producto y fotos de terceros pertenecen a sus dueños. Si crees que algún contenido infringe un derecho tuyo, escribe a ${mail} y lo revisaremos.</p>
<h2>Ley aplicable</h2>
<p>Este aviso legal se rige por la ley española.</p>`,
  },

  terminos: {
    title: "Términos de uso",
    description: "Qué es Masterspread, qué puedes esperar de sus enlaces y cuáles son las reglas de uso.",
    body: () => `
<h2>1. Qué regulan</h2>
<p>Estos términos se aplican a quien visita ${SITE_DOMAIN}. Usar la web es gratis y no hace falta registrarse. Quién está detrás está en el <a href="/aviso-legal">Aviso legal</a>.</p>
<h2>2. Qué es Masterspread</h2>
<p>Masterspread reúne listas públicas de productos de terceros y las muestra con su foto, su precio aproximado y su enlace. Masterspread no fabrica, vende ni envía ningún producto. Cuando compras, lo haces con el agente de compras o la tienda, con sus condiciones, sus precios y su política de privacidad; Masterspread no es parte de esa compra.</p>
<h2>3. La información de la web</h2>
<ul>
<li>Los productos, fotos, precios y enlaces salen de listas de terceros y se actualizan a menudo, pero pueden tener errores o cambiar sin aviso. Las categorías se asignan de forma automática y pueden equivocarse.</li>
<li>Los precios en otras monedas son aproximados, con el cambio del día. «Lo más popular» se ordena por cuántas personas pulsan «Comprar» en cada producto, no por ventas.</li>
<li>Antes de comprar, comprueba en la tienda el producto, el precio, la talla y los gastos de envío.</li>
<li>Masterspread no garantiza la calidad, la autenticidad, la disponibilidad ni el envío de los productos de terceros, ni responde de retrasos, pérdidas o retenciones en aduana, que dependen de la tienda, del agente de compras y del transportista.</li>
</ul>
<h2>4. Enlaces de afiliado</h2>
<p>Los enlaces a los agentes de compra llevan nuestro código de referido. Si te registras o compras a través de ellos, el agente nos puede pagar una comisión. A ti no te cuesta más. El descuento por registrarte lo da el agente según sus propias condiciones, que pueden cambiar.</p>
<h2>5. Tus compras</h2>
<p>Eres responsable de lo que compras y de cumplir las leyes de tu país, incluidas las de aduanas, importación y propiedad industrial. Algunos productos pueden no estar permitidos donde vives.</p>
<h2>6. Uso permitido</h2>
<p>No está permitido:</p>
<ul><li>copiar el catálogo de forma masiva o con programas automáticos;</li><li>intentar dañar o saturar la web, o entrar en partes que no son públicas;</li><li>usar la web para algo ilegal.</li></ul>
<h2>7. Propiedad intelectual e industrial</h2>
<p>El diseño, los textos y el código de Masterspread son de su titular. Las marcas, logotipos, nombres de producto y fotos de terceros pertenecen a sus dueños; aparecen solo para identificar los productos de las listas, y eso no significa que colaboren con Masterspread ni lo patrocinen.</p>
<p>Si eres titular de un derecho y crees que algo de la web lo infringe, escribe a ${mail} diciendo qué contenido es y por qué. Lo revisaremos y, si procede, lo retiraremos lo antes posible.</p>
<h2>8. Responsabilidad</h2>
<p>Masterspread responde de la web conforme a la ley española. No responde del contenido de las webs de terceros a las que enlaza, salvo que sepa que es ilícito y no retire el enlace con diligencia. Nada de estos términos limita los derechos que la ley te da como consumidor ni la responsabilidad por dolo o culpa grave.</p>
<h2>9. Cambios</h2>
<p>Estos términos pueden actualizarse si cambia la web o la ley. La fecha de arriba indica la versión vigente, que se aplica desde que se publica y nunca hacia atrás.</p>
<h2>10. Ley y tribunales</h2>
<p>Estos términos se rigen por la ley española. Si eres consumidor, puedes acudir a los juzgados de tu domicilio.</p>
<h2>11. Contacto</h2>
<p>Para cualquier duda, escribe a ${mail}.</p>`,
  },

  privacidad: {
    title: "Política de privacidad",
    description: "Qué datos trata Masterspread, para qué, cuánto tiempo y cómo ejercer tus derechos.",
    body: () => `
<h2>Quién trata tus datos</h2>
<p>${hayTitular() ? `<b>${esc(TITULAR.nombre)}</b>, NIF ${esc(TITULAR.nif)}, ${esc(TITULAR.domicilio)}. ` : `El titular de ${SITE_DOMAIN} (ver el <a href="/aviso-legal">Aviso legal</a>). `}Para cualquier cosa sobre tus datos, escribe a ${mail}.</p>
<h2>Qué datos tratamos y para qué</h2>
<ul>
<li><b>Visitas.</b> Contamos las visitas y los clics en los enlaces de registro con Umami: qué se ve y se pulsa, el país aproximado y el tipo de dispositivo y navegador, siempre en conjunto, sin cookies y sin guardar tu IP ni nada que te identifique. Sirve para saber cuánta gente usa la web y qué funciona.</li>
<li><b>«Lo más popular».</b> Cuando pulsas «Comprar» en un producto, sumamos uno a ese producto. Para no contar dos veces a la misma persona el mismo día, guardamos durante unas 25 horas un código calculado a partir de tu dirección IP con una clave secreta; de ese código no se puede sacar tu IP, y se borra solo. El recuento de cada producto no guarda nada tuyo.</li>
<li><b>Si nos escribes.</b> Usamos tu email y tu mensaje solo para responderte, y los borramos cuando ya no hacen falta y, como máximo, a los 12 meses.</li>
</ul>
<p>La base legal de las estadísticas y de «Lo más popular» es nuestro interés legítimo en saber cómo se usa la web y en ordenar el catálogo (art. 6.1.f del RGPD), sin identificarte; puedes oponerte escribiendo a ${mail}. Masterspread no tiene registro de usuarios ni formularios, no hace perfiles y no toma decisiones automatizadas sobre ti.</p>
<h2>Con quién se comparten</h2>
<p>No vendemos ni cedemos datos a nadie. La web funciona con proveedores que solo tratan datos por cuenta nuestra: Vercel (alojamiento), Upstash (la base de datos del recuento), Umami y Supabase (estadísticas) y Google (el correo de contacto). Pueden guardarlos fuera de la Unión Europea; en ese caso la transferencia se ampara en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo aprobadas por la Comisión Europea.</p>
<h2>Tus derechos</h2>
<p>Puedes pedir acceder a tus datos, corregirlos, borrarlos, oponerte a su uso, limitarlo o llevártelos, escribiendo a ${mail}. Si crees que no los hemos tratado bien, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">aepd.es</a>). Si tienes menos de 14 años, no nos envíes datos tuyos.</p>
<h2>Cookies y almacenamiento en tu navegador</h2>
<p>La tienda no usa cookies. Solo guarda en tu propio navegador lo que eliges (idioma, moneda, modo claro u oscuro, tus favoritos y si ya viste un aviso), para que la próxima vez se vea igual; eso no nos llega a nosotros. El panel de administración, que solo usa el titular, pone una cookie técnica para mantener su sesión. Por eso no hace falta un aviso de cookies.</p>
<h2>Enlaces a otras webs</h2>
<p>Al pulsar «Comprar» o «Regístrate» vas a la web del agente de compras o de la tienda, que tienen sus propias condiciones y su propia política de privacidad.</p>`,
  },
};

export const LEGAL_PAGES = Object.keys(PAGES);

/** The full HTML page, or null for an unknown name. */
export function renderLegal(name) {
  const page = PAGES[name];
  if (!page) return null;
  const nav = [["aviso-legal", "Aviso legal"], ["terminos", "Términos de uso"], ["privacidad", "Privacidad"]]
    .map(([p, t]) => (p === name ? `<b>${t}</b>` : `<a href="/${p}">${t}</a>`)).join(" · ");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${page.title} · Masterspread</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="https://www.${SITE_DOMAIN}/${name}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
<script>try{var m=JSON.parse(localStorage.getItem("sheetshop:theme")||'"auto"');if(m==="dark"||m==="light")document.documentElement.dataset.theme=m}catch(e){}</script>
</head>
<body class="legal-page">
<main class="legal">
<a class="legal-back" href="/">← Masterspread</a>
<h1>${page.title}</h1>
<p class="legal-updated">Última actualización: ${LEGAL_ACTUALIZADO}</p>
<p class="legal-en">This page is in Spanish, the reference language for the site's legal texts.</p>
${page.body()}
<p class="legal-nav">${nav}</p>
</main>
</body>
</html>`;
}
