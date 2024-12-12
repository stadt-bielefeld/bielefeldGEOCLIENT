from flask_mailman  import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

__all__ = ['mail', 'db', 'login_manager']

mail = Mail()
db = SQLAlchemy(session_options={'autocommit': False})

login_manager = LoginManager()
