# Configuración de `/registro` Antifraude + Gemini Vision + Google Sheets (0 €/mes)

Este sistema conecta [`src/pages/registro.astro`](../src/pages/registro.astro) con Google Sheets, Google Drive y Gemini Vision (`gemini-2.5-flash`) mediante Google Apps Script:

- Aprueba y responde **automáticamente** en su idioma (`es`, `en`, `de`, `it`) cuando Gemini confirma un recibo auténtico.
- Guarda todas las capturas en una carpeta privada de Google Drive (`Recibos_Trombon_Flexibilidad`).
- Bloquea **duplicados** por número de pedido normalizado y por huella **SHA-256** de la imagen.
- Envía a tu correo **únicamente los casos dudosos** (o si no hay clave configurada) con la foto adjunta para revisión manual.

## 1. Actualizar el código en Google Apps Script

1. Abre tu hoja de cálculo:
   - https://docs.google.com/spreadsheets/d/1OJuf5EixstUJioKyWk5vRciyMIDXk6wpmNR2DoI-XF8/edit
2. Entra en **Extensiones → Apps Script** y reemplaza todo el código por el de [`google-apps-script-registro.gs`](./google-apps-script-registro.gs).
3. Pulsa **Guardar (`Cmd + S`)**.

## 2. Configurar las Propiedades del Script (Privadas, nunca en el código)

En el editor de Apps Script, abre el icono de rueda dentada **Configuración del proyecto** (menú izquierdo) → abajo en **Propiedades del script → Añadir propiedad del script**:

1. **`GEMINI_API_KEY`**: Pega tu clave gratuita obtenida en [Google AI Studio](https://aistudio.google.com/apikey).
2. **`ADMIN_REVIEW_EMAIL`** *(opcional)*: `orders@javisaez.com` (una vez creada la redirección en DonDominio hacia tu Gmail; si no se añade, usará automáticamente tu cuenta `javiersaezmozos@gmail.com`).

## 3. Publicar nueva versión en Apps Script

Cada vez que modifiques el código en Apps Script debes actualizar la implementación para que la web use la versión nueva (conservando la misma URL `/exec` de Vercel):

1. Pulsa **Implementar → Gestionar implementaciones**.
2. Pulsa el icono del **lápiz (Editar)** arriba a la derecha de tu implementación activa.
3. En **Versión**, selecciona **Nueva versión** y pulsa **Implementar**.
4. Acepta los nuevos permisos de **Google Drive** y **Correo (MailApp)** si te los solicita la primera vez.
