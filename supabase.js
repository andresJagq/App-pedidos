const SUPABASE_URL = 'https://mmemkaqjdhqrwwmzqtki.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZW1rYXFqZGhxcnd3bXpxdGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjM0ODMsImV4cCI6MjA5MDk5OTQ4M30.ZSg7EWnNR7S-sT1VmtVmaf-LOVKvV1nuQZP7wzRq1lI'
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// ── NOTIFICACIONES ──────────────────────────────────────
// Guarda un aviso en la tabla `notificaciones` para que el admin lo vea en su
// panel (admin.html) en vez de recibirlo por correo.
// Tipos: 'soporte' | 'reset_solicitado' | 'password_cambiada' | 'registro'
async function notificar(tipo, datos = {}) {
  try {
    const { error } = await sb.from('notificaciones').insert({
      tipo,
      nombre: datos.nombre ? String(datos.nombre).substring(0, 100) : null,
      email: datos.email ? String(datos.email).substring(0, 200) : null,
      mensaje: datos.mensaje ? String(datos.mensaje).substring(0, 1000) : null,
      user_id: datos.user_id || null
    })
    return !error
  } catch (e) {
    return false
  }
}
