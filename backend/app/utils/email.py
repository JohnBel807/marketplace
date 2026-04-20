import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_email(to: str, subject: str, html_body: str) -> bool:
    """Envía un correo HTML. Retorna True si fue exitoso."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP no configurado — correo no enviado")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"VelezYRicaurte <{settings.SMTP_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        if settings.SMTP_PORT == 465:
            # SSL directo (Zoho, algunos otros)
            import ssl
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, to, msg.as_string())
        else:
            # STARTTLS (Gmail, Zoho 587)
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.ehlo()
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, to, msg.as_string())

        logger.info(f"✅ Email enviado a {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"❌ Error enviando email a {to}: {e}")
        return False


def send_welcome_email(full_name: str, email: str, trial_days: int = 30) -> bool:
    """Correo de bienvenida con info de ambos portales y el trial."""
    first_name = full_name.split()[0]
    subject = f"¡Bienvenido a VelezYRicaurte, {first_name}! 🎉 Tienes {trial_days} días gratis"
    html = f"""
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#ea580c,#c2410c);padding:40px 40px 32px;text-align:center;">
          <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="color:#fff;font-size:28px;font-weight:700;">V</span>
          </div>
          <h1 style="color:#fff;margin:0 0 8px;font-size:26px;font-weight:700;">¡Bienvenido, {first_name}!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:0;font-size:15px;">Tu cuenta en el ecosistema VelezYRicaurte está lista</p>
        </td></tr>

        <!-- Trial badge -->
        <tr><td style="padding:32px 40px 0;">
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:20px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#ea580c;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Tu regalo de bienvenida</p>
            <p style="margin:0;font-size:36px;font-weight:700;color:#c2410c;">{trial_days} días GRATIS</p>
            <p style="margin:4px 0 0;font-size:14px;color:#9a3412;">en ambos portales — sin tarjeta de crédito</p>
          </div>
        </td></tr>

        <!-- Portales -->
        <tr><td style="padding:28px 40px 0;">
          <p style="margin:0 0 20px;font-size:16px;color:#292524;font-weight:600;">Con un solo registro tienes acceso a dos portales:</p>

          <!-- Portal 1 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:16px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:18px;">🏠</p>
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#166534;">velezyricaurte.com</p>
              <p style="margin:0 0 8px;font-size:13px;color:#15803d;">Portal Inmobiliario Regional</p>
              <p style="margin:0;font-size:14px;color:#166534;">Compra, vende y arrienda <strong>casas, fincas, lotes y apartamentos</strong> en la provincia de Vélez, Santander. El directorio inmobiliario más completo de la región.</p>
              <a href="https://www.velezyricaurte.com" style="display:inline-block;margin-top:12px;background:#16a34a;color:#fff;text-decoration:none;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;">Explorar propiedades →</a>
            </td></tr>
          </table>

          <!-- Portal 2 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:18px;">🛒</p>
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#9a3412;">velezyricaurte.info</p>
              <p style="margin:0 0 8px;font-size:13px;color:#ea580c;">Marketplace Regional</p>
              <p style="margin:0;font-size:14px;color:#9a3412;">Compra y vende <strong>vehículos, maquinaria agrícola, ganado, electrodomésticos, repuestos</strong> y mucho más. También encuentra <strong>empleos y servicios</strong> locales.</p>
              <a href="https://www.velezyricaurte.info" style="display:inline-block;margin-top:12px;background:#ea580c;color:#fff;text-decoration:none;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;">Explorar marketplace →</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Cómo funciona -->
        <tr><td style="padding:28px 40px 0;">
          <p style="margin:0 0 16px;font-size:16px;color:#292524;font-weight:600;">¿Cómo aprovechar tu prueba gratis?</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0 8px 0 0;" width="33%">
                <div style="background:#f5f5f4;border-radius:10px;padding:16px;text-align:center;">
                  <p style="font-size:24px;margin:0 0 8px;">1️⃣</p>
                  <p style="margin:0;font-size:13px;color:#44403c;font-weight:600;">Inicia sesión</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#78716c;">Usa el mismo correo en ambos portales</p>
                </div>
              </td>
              <td style="padding:0 4px;" width="33%">
                <div style="background:#f5f5f4;border-radius:10px;padding:16px;text-align:center;">
                  <p style="font-size:24px;margin:0 0 8px;">2️⃣</p>
                  <p style="margin:0;font-size:13px;color:#44403c;font-weight:600;">Publica anuncios</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#78716c;">Hasta 3 anuncios gratis durante el trial</p>
                </div>
              </td>
              <td style="padding:0 0 0 8px;" width="33%">
                <div style="background:#f5f5f4;border-radius:10px;padding:16px;text-align:center;">
                  <p style="font-size:24px;margin:0 0 8px;">3️⃣</p>
                  <p style="margin:0;font-size:13px;color:#44403c;font-weight:600;">Vende más</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#78716c;">Activa un plan desde $19.900/mes</p>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 40px;border-top:1px solid #e7e5e4;margin-top:28px;">
          <p style="margin:0 0 8px;font-size:13px;color:#78716c;text-align:center;">¿Tienes preguntas? Escríbenos</p>
          <p style="margin:0;font-size:13px;color:#78716c;text-align:center;">
            📧 <a href="mailto:johnroa@velezyricaurte.com" style="color:#ea580c;">johnroa@velezyricaurte.com</a>
            &nbsp;|&nbsp;
            💬 <a href="https://wa.me/573116861370" style="color:#16a34a;">WhatsApp</a>
          </p>
          <p style="margin:16px 0 0;font-size:11px;color:#a8a29e;text-align:center;">
            Tecnoriente J.B. · NIT 910.168.07-8 · Vélez, Santander, Colombia
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""
    return send_email(email, subject, html)
