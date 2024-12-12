from flask_mailman  import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_assets import Environment as AssetsEnvironment, FlaskResolver
from flask_login import LoginManager

__all__ = ['mail', 'db', 'login_manager']

mail = Mail()
db = SQLAlchemy(session_options={'autocommit': False})

# But we need to use url_for to get X-Script-Name to work.
# Use custom resolver that always uses the internal convert_item_to_flask_url
# method. resolve_output_to_path (with support for direcotry) is untouched.

class Resolver(FlaskResolver):

    def resolve_output_to_url(self, ctx, target):
        prefix = getattr(ctx.environment, 'static_url_prefix')
        if prefix:
            target = prefix + '/' + target
        return self.convert_item_to_flask_url(ctx, target)

login_manager = LoginManager()
