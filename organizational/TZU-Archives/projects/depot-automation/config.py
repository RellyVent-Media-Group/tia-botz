"""
Configuration Management for Depot Automation System
"""

import os
import json
from typing import Dict, Any


# Load environment variables at module level
def _load_env_file(env_file: str = '.env'):
    """Load environment variables from .env file"""
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

# Load environment variables when module is imported
_load_env_file()


class Config:
    """Base configuration class"""

    # Base paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.environ.get('DATA_DIR', os.path.join(BASE_DIR, 'data'))
    LOG_DIR = os.path.join(BASE_DIR, 'logs')

    # Depot configurations
    CASHINGHOUSE_DATA_PATH = os.path.join(DATA_DIR, 'cashinghouse_financial_data.json')
    CONSORT_DATA_PATH = os.path.join(DATA_DIR, 'consort_content_pipeline.json')
    HOLDINGS_DATA_PATH = os.path.join(DATA_DIR, 'holdings_asset_data.json')
    SCRIBE_DATA_PATH = os.path.join(DATA_DIR, 'scribe_document_data.json')

    # Notification configuration
    EMAIL_CONFIG = {
        'smtp_server': os.environ.get('SMTP_SERVER', 'smtp.gmail.com'),
        'smtp_port': int(os.environ.get('SMTP_PORT', 587)),
        'sender': os.environ.get('EMAIL_SENDER', 'noreply@tiapmaatzu.com'),
        'username': os.environ.get('EMAIL_USERNAME', ''),
        'password': os.environ.get('EMAIL_PASSWORD', '')
    }

    # Webhook configuration
    WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'default-secret-change-in-production')
    WEBHOOK_URL = os.environ.get('WEBHOOK_URL', '')

    # Automation settings
    SCHEDULER_ENABLED = os.environ.get('SCHEDULER_ENABLED', 'true').lower() == 'true'
    NOTIFICATION_ENABLED = os.environ.get('NOTIFICATION_ENABLED', 'true').lower() == 'true'

    # API settings
    API_HOST = os.environ.get('API_HOST', '0.0.0.0')
    API_PORT = int(os.environ.get('API_PORT', 8000))
    API_DEBUG = os.environ.get('API_DEBUG', 'false').lower() == 'true'

    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    # Performance thresholds
    REVENUE_TARGET = float(os.environ.get('REVENUE_TARGET', 1000.0))
    ENGAGEMENT_RATE_TARGET = float(os.environ.get('ENGAGEMENT_RATE_TARGET', 5.0))
    ROI_TARGET = float(os.environ.get('ROI_TARGET', 10.0))
    
    @classmethod
    def ensure_directories(cls):
        """Ensure all required directories exist"""
        os.makedirs(cls.DATA_DIR, exist_ok=True)
        os.makedirs(cls.LOG_DIR, exist_ok=True)

        # Create data files if they don't exist
        for data_path in [cls.CASHINGHOUSE_DATA_PATH, cls.CONSORT_DATA_PATH,
                         cls.HOLDINGS_DATA_PATH, cls.SCRIBE_DATA_PATH]:
            if not os.path.exists(data_path):
                with open(data_path, 'w') as f:
                    json.dump({}, f)

    @classmethod
    def get_config_dict(cls) -> Dict[str, Any]:
        """Get configuration as dictionary"""
        return {
            'data_dir': cls.DATA_DIR,
            'log_dir': cls.LOG_DIR,
            'email_config': cls.EMAIL_CONFIG,
            'webhook_url': cls.WEBHOOK_URL,
            'scheduler_enabled': cls.SCHEDULER_ENABLED,
            'notification_enabled': cls.NOTIFICATION_ENABLED,
            'api_host': cls.API_HOST,
            'api_port': cls.API_PORT,
            'log_level': cls.LOG_LEVEL,
            'performance_thresholds': {
                'revenue_target': cls.REVENUE_TARGET,
                'engagement_rate_target': cls.ENGAGEMENT_RATE_TARGET,
                'roi_target': cls.ROI_TARGET
            }
        }


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    API_DEBUG = True
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    API_DEBUG = False
    LOG_LEVEL = 'WARNING'
    
    # Override with production-specific settings
    EMAIL_CONFIG = {
        'smtp_server': os.environ.get('SMTP_SERVER', 'smtp.production.com'),
        'smtp_port': int(os.environ.get('SMTP_PORT', 587)),
        'sender': os.environ.get('EMAIL_SENDER', 'alerts@tiapmaatzu.com'),
        'username': os.environ.get('EMAIL_USERNAME', ''),
        'password': os.environ.get('EMAIL_PASSWORD', '')
    }


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATA_DIR = '/tmp/depot_test_data'
    LOG_DIR = '/tmp/depot_test_logs'


def get_config(env: str = 'development') -> Config:
    """Get configuration based on environment"""
    config_map = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': TestingConfig
    }
    return config_map.get(env, DevelopmentConfig)


if __name__ == "__main__":
    # Test configuration
    config = get_config('development')
    config.ensure_directories()
    
    print("Configuration Test:")
    print(json.dumps(config.get_config_dict(), indent=2))