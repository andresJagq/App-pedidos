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
