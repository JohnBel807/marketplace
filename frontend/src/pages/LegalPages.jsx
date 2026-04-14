import { Mail, MessageCircle } from 'lucide-react'

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="font-display text-xl font-bold text-earth-900 mb-3">{title}</h2>
    <div className="text-earth-600 text-sm leading-relaxed space-y-2">{children}</div>
  </section>
)

export function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-earth-900 mb-2">Términos de uso</h1>
      <p className="text-earth-400 text-sm mb-10">Última actualización: enero 2025</p>

      <Section title="1. Aceptación">
        <p>Al usar VelezYRicaurte.com, aceptas estos términos. Si no estás de acuerdo, no uses el sitio. Nos reservamos el derecho de modificarlos con previo aviso de 15 días.</p>
      </Section>
      <Section title="2. Uso del servicio">
        <p>VelezYRicaurte.com es un marketplace donde usuarios publican y consultan anuncios de compra/venta de bienes y servicios en la región de Vélez, Santander.</p>
        <p>Está prohibido publicar: contenido ilegal, fraudulento, engañoso, pornográfico, o que viole derechos de terceros. Los anuncios deben corresponder a bienes o servicios reales y disponibles.</p>
      </Section>
      <Section title="3. Suscripciones y pagos">
        <p>Los planes de publicación se cobran mensualmente mediante Wompi. El pago da acceso al número de anuncios según el plan elegido durante 30 días calendario.</p>
        <p>No se realizan reembolsos salvo falla técnica comprobable atribuible a VelezYRicaurte.com. Las cancelaciones detienen la renovación pero no generan devolución del período ya pagado.</p>
      </Section>
      <Section title="4. Responsabilidad">
        <p>VelezYRicaurte.com actúa como intermediario. No somos parte de las transacciones entre usuarios. No garantizamos la calidad, legalidad ni veracidad de los anuncios publicados.</p>
        <p>El usuario es responsable del contenido que publica y de las transacciones que realiza. Recomendamos verificar identidades y bienes antes de cualquier pago.</p>
      </Section>
      <Section title="5. Propiedad intelectual">
        <p>El contenido del sitio (diseño, código, marca) es propiedad de Tecnoriente J.B. (NIT 910.168.07-8). Los anuncios son propiedad de sus respectivos autores.</p>
      </Section>
      <Section title="6. Legislación aplicable">
        <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa se resolverá ante los jueces competentes del municipio de Vélez, Santander.</p>
      </Section>

      <div className="mt-10 p-5 bg-earth-50 rounded-2xl text-sm text-earth-500">
        <strong className="text-earth-700">Tecnoriente J.B.</strong> · NIT 910.168.07-8 · Vélez, Santander, Colombia
        <br />
        Contacto: <a href="mailto:johnroa@velezyricaurte.com" className="text-brand-600 hover:underline">johnroa@velezyricaurte.com</a>
      </div>
    </div>
  )
}

export function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-earth-900 mb-2">Política de privacidad</h1>
      <p className="text-earth-400 text-sm mb-10">Conforme a la Ley 1581 de 2012 (Habeas Data) · Última actualización: enero 2025</p>

      <Section title="1. Responsable del tratamiento">
        <p><strong>Tecnoriente J.B.</strong>, NIT 910.168.07-8, con domicilio en Vélez, Santander, Colombia, es responsable del tratamiento de los datos personales recolectados en VelezYRicaurte.com.</p>
        <p>Contacto del responsable: <a href="mailto:johnroa@velezyricaurte.com" className="text-brand-600">johnroa@velezyricaurte.com</a></p>
      </Section>
      <Section title="2. Datos que recolectamos">
        <p>Recolectamos: nombre completo, correo electrónico, número de teléfono/WhatsApp, municipio de residencia, y datos de uso del sitio (páginas visitadas, anuncios publicados).</p>
        <p>No recolectamos datos sensibles (salud, filiación política, origen étnico, orientación sexual).</p>
      </Section>
      <Section title="3. Finalidad del tratamiento">
        <p>Usamos tus datos para: gestionar tu cuenta y anuncios, procesar pagos de suscripción, enviarte notificaciones del servicio, y mejorar la plataforma.</p>
        <p>No vendemos ni compartimos tus datos con terceros, salvo procesadores de pago (Wompi) y almacenamiento de imágenes (Cloudinary), bajo sus propias políticas de privacidad.</p>
      </Section>
      <Section title="4. Tus derechos (Habeas Data)">
        <p>Tienes derecho a: conocer, actualizar, rectificar y suprimir tus datos; revocar la autorización de tratamiento; presentar quejas ante la Superintendencia de Industria y Comercio.</p>
        <p>Para ejercer estos derechos, escríbenos a <a href="mailto:johnroa@velezyricaurte.com" className="text-brand-600">johnroa@velezyricaurte.com</a>. Respondemos en un plazo máximo de 15 días hábiles.</p>
      </Section>
      <Section title="5. Cookies">
        <p>Usamos cookies de sesión (autenticación) y de preferencias (filtros de búsqueda). No usamos cookies de seguimiento publicitario.</p>
      </Section>
      <Section title="6. Vigencia">
        <p>Los datos se conservan mientras tu cuenta esté activa. Al eliminar tu cuenta, tus datos se borran en un plazo de 30 días, salvo obligación legal de conservación.</p>
      </Section>
    </div>
  )
}

export function PQRPage() {
  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const tipo = data.get('tipo')
    const nombre = data.get('nombre')
    const email = data.get('email')
    const mensaje = data.get('mensaje')
    const waMsg = `PQR - ${tipo}\nNombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`
    window.open(`https://wa.me/573116861370?text=${encodeURIComponent(waMsg)}`, '_blank')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-earth-900 mb-2">PQR</h1>
      <p className="text-earth-400 text-sm mb-8">Peticiones, Quejas y Reclamos. Respondemos en máximo 15 días hábiles conforme a la Ley 1755 de 2015.</p>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Tipo de solicitud *</label>
            <select name="tipo" className="input" required>
              <option value="">Seleccionar...</option>
              <option value="Petición">Petición</option>
              <option value="Queja">Queja</option>
              <option value="Reclamo">Reclamo</option>
              <option value="Sugerencia">Sugerencia</option>
              <option value="Ejercicio Habeas Data">Ejercicio Habeas Data</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre completo *</label>
              <input name="nombre" type="text" className="input" placeholder="Tu nombre" required />
            </div>
            <div>
              <label className="label">Correo electrónico *</label>
              <input name="email" type="email" className="input" placeholder="tu@correo.com" required />
            </div>
          </div>
          <div>
            <label className="label">Descripción *</label>
            <textarea name="mensaje" rows={5} className="input resize-none"
              placeholder="Describe tu solicitud con el mayor detalle posible..." required />
          </div>
          <p className="text-xs text-earth-400">
            Al enviar este formulario autorizas el tratamiento de tus datos conforme a nuestra{' '}
            <a href="/privacidad" className="text-brand-600 hover:underline">Política de privacidad</a>.
          </p>
          <button type="submit" className="btn-primary w-full justify-center py-3">
            Enviar solicitud por WhatsApp
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-earth-100 space-y-2 text-sm text-earth-500">
          <p className="flex items-center gap-2">
            <Mail size={15} className="text-brand-400" />
            <a href="mailto:johnroa@velezyricaurte.com" className="hover:text-brand-600">johnroa@velezyricaurte.com</a>
          </p>
          <p className="flex items-center gap-2">
            <MessageCircle size={15} className="text-green-500" />
            <a href="https://wa.me/573116861370" target="_blank" rel="noreferrer" className="hover:text-brand-600">WhatsApp directo</a>
          </p>
        </div>
      </div>
    </div>
  )
}
