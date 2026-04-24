import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Envía un correo HTML via Resend API."""
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY no configurada — correo no enviado")
        return False
    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": f"VelezYRicaurte <{settings.SMTP_USER or 'noreply@velezyricaurte.info'}>",
                "to": [to],
                "subject": subject,
                "html": html_body,
            },
            timeout=15.0
        )
        if response.status_code in (200, 201):
            logger.info(f"✅ Email enviado a {to}: {subject}")
            return True
        else:
            logger.error(f"❌ Resend error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Error enviando email a {to}: {e}")
        return False


def send_password_reset_email(full_name: str, email: str, reset_url: str) -> bool:
    """Correo con link para restablecer contraseña."""
    first_name = full_name.split()[0]
    subject = "Restablecer tu contraseña — VelezYRicaurte"
    html = f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#ea580c,#c2410c);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:24px;">Restablecer contraseña</h1>
<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">VelezYRicaurte — Marketplace Regional</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:16px;color:#44403c;">Hola <strong>{first_name}</strong>,</p>
<p style="font-size:15px;color:#57534e;line-height:1.6;">
Recibimos una solicitud para restablecer la contraseña de tu cuenta.
Haz clic en el botón para crear una nueva contraseña.
</p>
<div style="text-align:center;margin:32px 0;">
<a href="{reset_url}" style="background:#ea580c;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;">
Restablecer contraseña
</a>
</div>
<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin:24px 0;">
<p style="margin:0;font-size:13px;color:#9a3412;">
⏰ <strong>Este enlace expira en 30 minutos.</strong><br>
Si no solicitaste restablecer tu contraseña, ignora este correo.
</p>
</div>
<p style="font-size:13px;color:#a8a29e;">Si el botón no funciona copia este enlace:<br>
<a href="{reset_url}" style="color:#ea580c;word-break:break-all;">{reset_url}</a></p>
</td></tr>
<tr><td style="padding:24px 40px;border-top:1px solid #e7e5e4;text-align:center;">
<p style="margin:0;font-size:13px;color:#78716c;">
<a href="mailto:johnroa@velezyricaurte.com" style="color:#ea580c;">johnroa@velezyricaurte.com</a>
</p>
<p style="margin:8px 0 0;font-size:11px;color:#a8a29e;">Tecnoriente J.B. · NIT 910.168.07-8 · Vélez, Santander</p>
</td></tr>
</table></td></tr></table>
</body></html>"""
    return send_email(email, subject, html)


def send_welcome_email(full_name: str, email: str, trial_days: int = 30) -> bool:
    """Correo de bienvenida con info de ambos portales y el trial."""
    first_name = full_name.split()[0]
    subject = f"¡Bienvenido a VelezYRicaurte, {first_name}! 🎉 Tienes {trial_days} días gratis"
    html = f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#ea580c,#c2410c);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:26px;">¡Bienvenido, {first_name}!</h1>
<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Tu cuenta en el ecosistema VelezYRicaurte está lista</p>
</td></tr>
<tr><td style="padding:32px 40px 0;">
<div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:20px;text-align:center;">
<p style="margin:0;font-size:13px;color:#ea580c;font-weight:600;text-transform:uppercase;">Tu regalo de bienvenida</p>
<p style="margin:4px 0;font-size:36px;font-weight:700;color:#c2410c;">{trial_days} días GRATIS</p>
<p style="margin:0;font-size:14px;color:#9a3412;">en ambos portales — sin tarjeta de crédito</p>
</div>
</td></tr>
<tr><td style="padding:28px 40px 0;">
<p style="font-size:16px;color:#292524;font-weight:600;">Con un solo registro accedes a dos portales:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:16px;">
<tr><td style="padding:20px;">
<p style="margin:0;font-size:16px;font-weight:700;color:#166534;">🏠 velezyricaurte.com</p>
<p style="margin:4px 0;font-size:13px;color:#15803d;">Portal Inmobiliario — casas, fincas, lotes, apartamentos</p>
<a href="https://www.velezyricaurte.com" style="display:inline-block;margin-top:8px;background:#16a34a;color:#fff;text-decoration:none;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;">Explorar propiedades →</a>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
<tr><td style="padding:20px;">
<p style="margin:0;font-size:16px;font-weight:700;color:#9a3412;">🛒 velezyricaurte.info</p>
<p style="margin:4px 0;font-size:13px;color:#ea580c;">Marketplace — vehículos, ganado, maquinaria, empleos y más</p>
<a href="https://www.velezyricaurte.info" style="display:inline-block;margin-top:8px;background:#ea580c;color:#fff;text-decoration:none;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;">Explorar marketplace →</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px;border-top:1px solid #e7e5e4;text-align:center;margin-top:24px;">
<p style="margin:0;font-size:13px;color:#78716c;">
📧 <a href="mailto:johnroa@velezyricaurte.com" style="color:#ea580c;">johnroa@velezyricaurte.com</a>
&nbsp;|&nbsp;
💬 <a href="https://wa.me/573116861370" style="color:#16a34a;">WhatsApp</a>
</p>
<p style="margin:8px 0 0;font-size:11px;color:#a8a29e;">Tecnoriente J.B. · NIT 910.168.07-8 · Vélez, Santander</p>
</td></tr>
</table></td></tr></table>
</body></html>"""
    return send_email(email, subject, html)