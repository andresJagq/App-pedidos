// ═══════════════════════════════════════════════════════════════════
//  reset-password — genera una contraseña temporal para un usuario
//
//  Vive en el servidor de Supabase, NO en el navegador: es el único
//  lugar donde puede usarse la clave service_role sin exponerla.
//  Antes de tocar nada verifica que quien llama sea administrador.
// ═══════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Contraseña fácil de dictar por teléfono: sin caracteres ambiguos.
function generarPassword(): string {
  const palabras = ['Pedidos', 'Entrega', 'Reparto', 'Ruta', 'Bodega', 'Cliente', 'Camino']
  const buf = new Uint32Array(2)
  crypto.getRandomValues(buf)
  const palabra = palabras[buf[0] % palabras.length]
  const numero = 1000 + (buf[1] % 9000)
  return `${palabra}-${numero}`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' }
    })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Falta la sesión' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SB_SECRET_KEY')!

    // 1. ¿Quién está llamando?
    const llamante = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    })
    const { data: { user }, error: userErr } = await llamante.auth.getUser()
    if (userErr || !user) return json({ error: 'Sesión inválida o expirada' }, 401)

    // 2. ¿Es administrador? Se consulta con service_role para no depender de RLS.
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: perfil } = await admin
      .from('profiles').select('es_admin').eq('id', user.id).single()
    if (!perfil?.es_admin) return json({ error: 'Solo un administrador puede hacer esto' }, 403)

    // 3. ¿A quién le cambiamos la contraseña?
    let body: { user_id?: string }
    try { body = await req.json() } catch { return json({ error: 'Petición inválida' }, 400) }

    const userId = body.user_id
    if (!userId) return json({ error: 'Falta el usuario' }, 400)
    if (userId === user.id) {
      return json({ error: 'Para tu propia clave usa "¿Olvidaste tu contraseña?" en el login' }, 400)
    }

    const { data: objetivo, error: objErr } = await admin.auth.admin.getUserById(userId)
    if (objErr || !objetivo?.user) return json({ error: 'Ese usuario no existe' }, 404)

    // 4. Cambiar la contraseña
    const password = generarPassword()
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password })
    if (updErr) return json({ error: 'No se pudo cambiar la contraseña' }, 500)

    // 5. Dejar registro en el buzón (ya leída: la hizo el propio admin)
    const { data: perfilObjetivo } = await admin
      .from('profiles').select('nombre').eq('id', userId).single()
    await admin.from('notificaciones').insert({
      tipo: 'reset_admin',
      nombre: perfilObjetivo?.nombre ?? null,
      email: objetivo.user.email ?? null,
      user_id: userId,
      mensaje: 'El administrador le generó una contraseña temporal.',
      leida: true
    })

    return json({ password, email: objetivo.user.email ?? null })
  } catch (_e) {
    return json({ error: 'Error inesperado en el servidor' }, 500)
  }
})
