# Configuración del Webhook de `/registro` en Google Sheets (0 €/mes)

Este sistema conecta el formulario estático [`src/pages/registro.astro`](../src/pages/registro.astro) con una hoja de cálculo de Google Drive mediante Google Apps Script, manteniendo el alojamiento en Vercel 100 % estático y sin coste fijo mensual.

## 1. Abrir la hoja de cálculo creada y desplegar Apps Script

1. Abre la hoja ya creada y preconfigurada en tu Google Drive (`javiersaezmozos@gmail.com`):
   - **URL directa**: https://docs.google.com/spreadsheets/d/1OJuf5EixstUJioKyWk5vRciyMIDXk6wpmNR2DoI-XF8/edit
   - Pestaña preparada: `Registros_Vol1` (9 columnas congeladas y estilizadas, acceso privado solo para tu cuenta).
2. En el menú superior abre **Extensiones → Apps Script**.
3. Borra el código de ejemplo y pega el contenido completo de [`google-apps-script-registro.gs`](./google-apps-script-registro.gs).
4. Guarda el proyecto (`Cmd + S`).
5. Pulsa **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Autoriza los permisos la primera vez (*Configuración avanzada → Ir a proyecto no seguro*) y copia la **URL de la aplicación web** (termina en `/exec`).

## 2. Configurar la variable de entorno sin exponerla en Git

- **En Vercel** (Producción y Preview):
  - Añade la variable de entorno `PUBLIC_REGISTRO_WEBHOOK_URL` con la URL `/exec` copiada y redespliega el proyecto.
- **En local** (opcional para pruebas):
  - Crea `.env` en la raíz de `web-cv` (el archivo `.gitignore` ya excluye `.env` y `.env.*`):
    ```bash
    PUBLIC_REGISTRO_WEBHOOK_URL="https://script.google.com/macros/s/TU_ID_DE_DESPLIEGUE/exec"
    ```

## 3. Notas de seguridad y funcionamiento

- El cliente envía `Content-Type: text/plain;charset=utf-8` para realizar una petición CORS simple sin *preflight* `OPTIONS`, evitando el bloqueo habitual de Google Apps Script en navegadores.
- Cada envío entra bajo `LockService` para prevenir sobrescritura de filas ante envíos simultáneos, y aplica `sanitizeCell()` frente a inyección de fórmulas (`=`, `+`, `-`, `@`) en Google Sheets.
- Si `PUBLIC_REGISTRO_WEBHOOK_URL` no está definida o falla la conexión, `/registro` muestra automáticamente un botón `mailto:info@javisaez.com` precargado con todos los datos validados.
