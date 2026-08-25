# 🚀 Despliegue en Vercel — Contabilidad Ferretería

La app ya compila y funciona (Next.js 14, build verificado). Sigue estos pasos:

## 1. Sube el código a GitHub
Este repositorio ya contiene todo. Si trabajas desde la rama de Arena, haz **merge a `main`** (o crea un PR y apruébalo).

## 2. Importa el proyecto en Vercel
1. Entra a **https://vercel.com/new** (inicia sesión con tu cuenta de GitHub).
2. Importa el repo **`juanpablogallegolive-tech/pagina-libromono`**.
3. Vercel detecta Next.js automáticamente — **no cambies nada** de Framework/Preset ni Root Directory (debe quedar `/`).
4. Antes de desplegar, abre **Environment Variables** y agrega:

| Variable | Valor |
|---|---|
| `NEXTAUTH_SECRET` | (valor de abajo) |
| `NEXTAUTH_URL` | `https://TU-PROYECTO.vercel.app` (la URL que Vercel asigne) |
| `LLM_API_KEY` | *(opcional)* clave de tu API de IA compatible con OpenAI |
| `LLM_BASE_URL` | *(opcional)* p. ej. la URL de Abacus |
| `LLM_MODEL` | *(opcional)* p. ej. `gpt-4.1-mini` |

> `NEXTAUTH_SECRET` listo para usar (generado aleatoriamente):
> ```
> FNOrLc6mKNEnrA3AdENu6UuVQI9ysoxQ0MooZAM7gVU=
> ```
> Si prefieres el tuyo: `openssl rand -base64 32`

5. Pulsa **Deploy**. En ~1 minuto tendrás la app corriendo.

## 3. Si la URL cambia (dominio propio, rename del proyecto)
Actualiza `NEXTAUTH_URL` en Vercel → Settings → Environment Variables y haz **Redeploy**.

## 4. Inicia sesión
Con cualquier usuario demo (`admin@ferreteria.com` / `admin123`) o crea usuarios reales en `/admin/usuarios`.

## Preguntas frecuentes
- **¿GitHub Pages?** No es adecuado para esta app: tiene login, API routes y generación de archivos (necesita servidor). Por eso el destino correcto es Vercel.
- **¿Los datos se guardan?** Esta versión usa datos de demostración en memoria (se reinician al reiniciar el servidor). Para datos reales, crea una DB gratis en [Neon](https://neon.tech) y reemplaza `src/lib/store.ts` por consultas a PostgreSQL/Prisma — toda la app ya consume ese único módulo.
- **¿Los chats IA funcionan sin API key?** Sí: usan el modo offline con los datos reales del sistema. Con `LLM_API_KEY` usan tu modelo GPT.
