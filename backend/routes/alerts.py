import os
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class TelegramAlertRequest(BaseModel):
    risk_level: str
    message: str
    zone: str
    risk_score: float

@router.post("/api/alerts/telegram")
async def send_telegram_alert(alert: TelegramAlertRequest):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    if not bot_token or not chat_id:
        logger.warning("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured.")
        return {"status": "skipped", "reason": "Credentials not configured"}
        
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    emoji = "🚨" if alert.risk_level == "CRITICAL" else "⚠️"
    text = (
        f"{emoji} <b>MineSense AI Alert</b> {emoji}\n\n"
        f"<b>Level:</b> {alert.risk_level}\n"
        f"<b>Zone:</b> {alert.zone}\n"
        f"<b>Risk Score:</b> {alert.risk_score:.1f}/100\n\n"
        f"{alert.message}"
    )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "HTML"
                },
                timeout=5.0
            )
            response.raise_for_status()
            return {"status": "success"}
    except Exception as e:
        logger.error(f"Failed to send Telegram alert: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send Telegram alert: {e}")
