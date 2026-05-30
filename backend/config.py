import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    ESP32_IP: str = os.getenv("ESP32_IP", "192.168.1.100")
    ESP32_PORT: int = int(os.getenv("ESP32_PORT", "81"))
    CAMERA_INDEX: int = int(os.getenv("CAMERA_INDEX", "0"))
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.65"))
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "EcoSwap2024!")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-this-to-a-long-random-secret-string")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/best.pt")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))


settings = Settings()
