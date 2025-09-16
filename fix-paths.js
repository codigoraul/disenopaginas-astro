import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas principales que necesitan ser manejadas
const mainRoutes = ['servicios', 'tarifas', 'portafolio', 'blog', 'contacto'];

// Función para procesar un archivo HTML o JavaScript
function processHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Determinar la profundidad del archivo (cuántos niveles de subdirectorio)
    const relativePath = path.relative('./dist', filePath);
    const depth = relativePath.split(path.sep).length - 1;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    // 1. Manejar los assets (siempre relativos)
    content = content.replace(/(href=["'])\/assets\//g, `$1${prefix}assets/`);
    content = content.replace(/(src=["'])\/assets\//g, `$1${prefix}assets/`);
    content = content.replace(/(url\([\"']?)\/assets\//g, `$1${prefix}assets/`);
    
    // 1.1. Manejar favicon y otros recursos del root
    content = content.replace(/(href=["'])\/favicon\.ico/g, `$1${prefix}favicon.ico`);
    content = content.replace(/(href=["'])\/([^"']*\.css)/g, `$1${prefix}$2`);
    content = content.replace(/(src=["'])\/([^"']*\.js)/g, `$1${prefix}$2`);
    
    // 1.2. Corregir rutas que usan ./ cuando deberían usar ../
    if (depth > 0) {
      content = content.replace(/(href=["'])\.\//g, `$1${prefix}`);
      content = content.replace(/(src=["'])\.\//g, `$1${prefix}`);
    }
    
    // 1.3. Corregir rutas CSS dentro de archivos CSS
    if (filePath.endsWith('.css')) {
      content = content.replace(/url\(["']?\/assets\//g, `url("${prefix}assets/`);
      content = content.replace(/url\([\"']?assets\//g, `url("${prefix}assets/`);
    }
    
    // 2. Manejar rutas principales
    mainRoutes.forEach(route => {
      // Para enlaces que terminan con /ruta o /ruta#hash
      content = content.replace(
        new RegExp(`(href=["'])\/${route}([\"'#])`, 'g'),
        `$1${prefix}${route}/index.html$2`
      );
      
      // Para enlaces que terminan con /ruta/
      content = content.replace(
        new RegExp(`(href=["'])\/${route}\/(["'])`, 'g'),
        `$1${prefix}${route}/index.html$2`
      );
    });
    
    // 3. Manejar rutas específicas de blog con subdirectorios
    content = content.replace(
      /(href=["'])\/blog\/([^"']+)([\"'])/g,
      (match, p1, slug, p3) => {
        // Si ya termina con index.html, no cambiar
        if (slug.endsWith('index.html')) {
          return `${p1}${prefix}blog/${slug}${p3}`;
        }
        // Si es solo el slug, agregar /index.html
        return `${p1}${prefix}blog/${slug}/index.html${p3}`;
      }
    );
    
    // 4. Manejar la ruta raíz
    content = content.replace(/(href=["'])\/"(?!\/)/g, `$1${prefix}index.html"`);
    content = content.replace(/(href=["'])\/"(?!\/)/g, `$1${prefix}index.html"`);
    
    // 5. Manejar recursos sin barra inicial
    content = content.replace(/(href=["'])assets\//g, `$1${prefix}assets/`);
    content = content.replace(/(src=["'])assets\//g, `$1${prefix}assets/`);
    content = content.replace(/(url\([\"']?)assets\//g, `$1${prefix}assets/`);
    
    // 6. Corregir rutas CSS
    content = content.replace(/(url\([\"']?)\.\.\//g, `$1${prefix}`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Procesado: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error);
  }
}

// Función para procesar directorios recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      processHtmlFile(fullPath);
    }
  });
}

// Directorio del build
const buildDir = './dist';

console.log('🚀 Configurando rutas para producción...');

if (fs.existsSync(buildDir)) {
  processDirectory(buildDir);
  console.log('✨ Proceso completado. Las rutas han sido actualizadas.');
} else {
  console.error('❌ Error: No se encontró el directorio de build. Ejecuta `npm run build` primero.');
  process.exit(1);
}
