import smtplib
from email.message import EmailMessage
from settings import settings


def send_reset_email(to_email: str, reset_token: str) -> None:
    if not settings.smtp_user or not settings.smtp_password:
        print(f"[EMAIL] Would send reset email to {to_email} with token {reset_token}")
        return

    reset_link = f"{settings.frontend_url}/reset-password/{reset_token}"

    msg = EmailMessage()
    msg["Subject"] = "Password Reset Request"
    msg["From"] = settings.smtp_from_email
    msg["To"] = to_email
    msg.set_content(
        f"Click the link below to reset your password:\n\n{reset_link}\n\n"
        f"This link expires in 60 minutes."
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
