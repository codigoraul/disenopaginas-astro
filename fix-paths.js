import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para procesar un archivo HTML o JavaScript
function processHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Determinar la profundidad del archivo (cuántos niveles de subdirectorio)
    const relativePath = path.relative('./dist', filePath);
    const depth = relativePath.split(path.sep).length - 1;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    // RUTAS RELATIVAS: Ajustar según profundidad
    content = content.replace(/href="\/assets\//g, `href="${prefix}assets/`);
    content = content.replace(/src="\/assets\//g, `src="${prefix}assets/`);
    content = content.replace(/url\(\/assets\//g, `url(${prefix}assets/`);
    
    // Convertir links de navegación según profundidad
    if (depth > 0) {
      // Para páginas en subdirectorios, usar ../ para volver a la raíz
      content = content.replace(/href="\/servicios"/g, 'href="../servicios.html"');
      content = content.replace(/href="\/tarifas"/g, 'href="../tarifas.html"');
      content = content.replace(/href="\/portafolio"/g, 'href="../portafolio.html"');
      content = content.replace(/href="\/blog"/g, 'href="../blog.html"');
      content = content.replace(/href="\/contacto"/g, 'href="../contacto.html"');
      content = content.replace(/href="\/"/g, 'href="../index.html"');
    } else {
      // Para páginas en la raíz, usar ./
      content = content.replace(/href="\/servicios"/g, 'href="./servicios.html"');
      content = content.replace(/href="\/tarifas"/g, 'href="./tarifas.html"');
      content = content.replace(/href="\/portafolio"/g, 'href="./portafolio.html"');
      content = content.replace(/href="\/blog"/g, 'href="./blog.html"');
      content = content.replace(/href="\/contacto"/g, 'href="./contacto.html"');
      content = content.replace(/href="\/"/g, 'href="./index.html"');
    }
    
    // Convertir rutas absolutas generales a relativas
    content = content.replace(/href="\/(?!\.)/g, `href="${prefix}`);
    content = content.replace(/src="\/(?!\.)/g, `src="${prefix}`);
    content = content.replace(/url\(\/(?!\.)/g, `url(${prefix}`);
    
    // Asegurar que assets sin barra inicial tenga el prefijo correcto
    content = content.replace(/href="assets\//g, `href="${prefix}assets/`);
    content = content.replace(/src="assets\//g, `src="${prefix}assets/`);
    content = content.replace(/url\(assets\//g, `url(${prefix}assets/`);
    
    // Escribir el archivo modificado
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Procesado: ${filePath} (Profundidad: ${depth}, Prefijo: ${prefix})`);
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

// Función para procesar directorios recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Procesar subdirectorios
      processDirectory(fullPath);
    } else if (item.endsWith('.html') || item.endsWith('.js')) {
      // Procesar archivos HTML y JavaScript
      processHtmlFile(fullPath);
    }
  });
}

// Directorio del build
const buildDir = './dist';

console.log('🚀 Iniciando corrección automática de rutas...');
console.log(`📁 Procesando directorio: ${buildDir}`);

// Verificar que existe el directorio dist
if (!fs.existsSync(buildDir)) {
  console.error('❌ Error: No existe el directorio dist/');
  console.log('💡 Ejecuta primero: npm run build');
  process.exit(1);
}

// Procesar todos los archivos HTML y JavaScript
processDirectory(buildDir);

console.log('🎉 ¡Corrección de rutas completada!');
console.log('✅ Todas las rutas ahora son relativas (./) para funcionar localmente');
