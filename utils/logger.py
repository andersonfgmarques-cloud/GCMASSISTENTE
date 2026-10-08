"""
GCM DIGITAL 153 - Módulo de Logging Estruturado
"""

import sys
import logging
from config.settings import settings

def setup_logger() -> logging.Logger:
    """Configura o logger principal da aplicação GCM Digital 153."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    logger_instance = logging.getLogger("GCM_DIGITAL_153")
    logger_instance.setLevel(log_level)

    # Evita duplicidade de handlers
    if not logger_instance.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s [%(filename)s:%(lineno)d] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)
        logger_instance.addHandler(console_handler)

    return logger_instance


logger = setup_logger()
