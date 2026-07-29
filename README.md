# Calculadora de Pedidos

App para calcular ganancias diarias y mensuales por SKUs, tramos y bonificaciones.

## Estructura

```
calculadora-pedidos/
├── index.html   ← Pantalla de login (selección de usuario)
├── app.html     ← Calculadora principal
└── README.md
```

## Cómo usar

1. Cada persona entra con su nombre → la app guarda sus datos por separado en el navegador
2. En la pestaña **Hoy**: ingresa los SKUs de cada pedido y guarda el día
3. En la pestaña **Mes**: marca las bonificaciones logradas y ve el resumen mensual
4. En la pestaña **Config**: ajusta el descuento y la base fija

## Panel de admin

`admin.html` está dividido en tres secciones, con navegación inferior:

| Sección | Qué tiene |
|---|---|
| 🔔 Avisos | Buzón de notificaciones, con contador de sin leer en la barra |
| 👥 Usuarios | Navegador de mes, lista con nombre + correo, estadísticas, botón de clave y de Excel |
| ⬇️ Exportar | Rango de fechas propio y exportación de todos a un Excel |

El rango de **Exportar** es independiente del mes que estés viendo en
**Usuarios**, para poder sacar un reporte de varios meses sin perder la vista.

### El correo en los perfiles

Para que el panel muestre el correo junto al nombre —y para poder identificar
quién pidió restablecer su contraseña— la tabla `profiles` necesita una columna
`email`. Se agrega ejecutando `supabase-email-perfiles.sql` una vez en el SQL
Editor. El archivo también rellena los correos de los usuarios que ya existen y
deja un trigger que la mantiene sincronizada con `auth.users`.

## Notificaciones en el panel admin

El panel de admin (`admin.html`) tiene un buzón 🔔 donde llegan los avisos, sin
necesidad de configurar ningún correo:

| Aviso | Cuándo aparece |
|---|---|
| 🆘 Mensaje de soporte | El usuario escribe desde el login o desde Ajustes |
| 🔑 Pidió restablecer su contraseña | Toca "¿Olvidaste tu contraseña?" |
| ✅ Cambió su contraseña | Terminó de elegir la contraseña nueva |
| 👤 Nuevo registro | Alguien crea una cuenta |

**Antes de usarlo, hay que crear la tabla una sola vez:**

1. Entrar a Supabase → **SQL Editor** → **New query**
2. Pegar todo el contenido de `supabase-notificaciones.sql`
3. Click en **Run**

El buzón se refresca solo cada minuto mientras el panel está abierto, y cruza
cada aviso con la lista de usuarios para mostrar el nombre y el correo aunque el
aviso llegue sin ellos.

### Sobre "olvidé mi contraseña"

Supabase responde **"correo enviado"** aunque la dirección no exista: es una
protección deliberada para que nadie pueda averiguar qué correos están
registrados probando uno por uno. Por eso el aviso se guarda igual.

Cuando el correo del aviso no coincide con ninguna cuenta, el buzón lo marca con
un ⚠️ y avisa que a esa persona **no le llegó ningún enlace** — casi siempre es
un correo mal escrito, y ahí conviene generarle una contraseña temporal desde
**Usuarios**.

## Restablecer la contraseña de alguien

En cada tarjeta de usuario del panel hay un botón **🔑 Clave**. Genera una
contraseña temporal tipo `Pedidos-4821`, la muestra una sola vez para copiarla y
dictársela a esa persona. La contraseña anterior deja de funcionar al instante.

Esto **no** se puede hacer desde el navegador: cambiarle la clave a otro usuario
exige la clave `service_role`, que nunca debe estar en el frontend. Por eso vive
en una Edge Function (`supabase/functions/reset-password/`) que corre en el
servidor de Supabase y comprueba que quien llama sea admin antes de actuar.

**Desplegarla desde el dashboard (una sola vez):**

1. Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**
2. Nombre: `reset-password` (exacto, en minúsculas)
3. Borrar el código de ejemplo y pegar todo `supabase/functions/reset-password/index.ts`
4. **Deploy**

No hay que configurar ninguna variable: Supabase inyecta `SUPABASE_URL`,
`SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` automáticamente.

**Con la CLI**, si la tienes instalada:

```bash
supabase functions deploy reset-password
```

## Deploy en Vercel (paso a paso)

### 1. Crear cuenta en GitHub
- Ir a https://github.com y crear una cuenta (si no tienes)

### 2. Crear repositorio
- Click en "New repository"
- Nombre: `calculadora-pedidos`
- Dejarlo en **Public**
- Click en "Create repository"

### 3. Subir los archivos
En tu computador, abre la terminal y ejecuta:

```bash
git init
git add .
git commit -m "primera version"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/calculadora-pedidos.git
git push -u origin main
```

(Reemplaza TU_USUARIO con tu nombre de GitHub)

### 4. Publicar en Vercel
- Ir a https://vercel.com
- Click en "Sign Up" → conectar con GitHub
- Click en "Add New Project"
- Seleccionar el repositorio `calculadora-pedidos`
- Click en **Deploy**
- Vercel te dará una URL del tipo: `https://calculadora-pedidos.vercel.app`

### 5. Compartir la URL
- Comparte la URL con cada persona
- Cada uno entra, escribe su nombre y tiene su propia calculadora
- Los datos se guardan en el navegador de cada persona

## Actualizar la app

Cuando hagas cambios:

```bash
git add .
git commit -m "descripcion del cambio"
git push
```

Vercel actualiza la app automáticamente.
