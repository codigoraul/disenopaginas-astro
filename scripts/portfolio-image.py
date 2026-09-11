#!/usr/bin/env python3
"""
Convierte una captura de pantalla en la imagen .webp lista para el portafolio
de diseñopaginas.cl (mismo tamaño/estilo que las demás tarjetas: 480x285px).

Uso:
  python3 scripts/portfolio-image.py entrada.png nombre-cliente
  python3 scripts/portfolio-image.py entrada.png nombre-cliente --calidad 65

Genera: public/assets/img/portafolio/nombre-cliente.webp
"""
import sys
import argparse
from pathlib import Path
from PIL import Image

ANCHO, ALTO = 480, 285
RATIO = ANCHO / ALTO
CARPETA_DESTINO = Path(__file__).resolve().parent.parent / "public/assets/img/portafolio"

def procesar(entrada, slug, calidad):
    im = Image.open(entrada).convert("RGB")
    w, h = im.size
    cur_ratio = w / h

    # Recorta desde arriba (donde suele estar el logo/hero) manteniendo el ratio 480:285
    if cur_ratio > RATIO:
        new_w = int(h * RATIO)
        left = (w - new_w) // 2
        im = im.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / RATIO)
        im = im.crop((0, 0, w, new_h))

    im = im.resize((ANCHO, ALTO), Image.LANCZOS)

    destino = CARPETA_DESTINO / f"{slug}.webp"
    im.save(destino, "WEBP", quality=calidad, method=6)
    peso_kb = destino.stat().st_size / 1024
    print(f"OK -> {destino}  ({ANCHO}x{ALTO}px, {peso_kb:.1f} KB)")
    if peso_kb > 40:
        print("Aviso: quedó más pesada que el promedio del portafolio (~10-30KB). Prueba con --calidad 55 o 60.")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada", help="Ruta de la captura de pantalla (png/jpg)")
    ap.add_argument("slug", help="Nombre de archivo sin espacios, ej: tornomatica")
    ap.add_argument("--calidad", type=int, default=65, help="Calidad webp 1-100 (default 65)")
    args = ap.parse_args()
    procesar(args.entrada, args.slug, args.calidad)
