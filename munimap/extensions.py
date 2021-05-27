from flask.ext.mail import Mail
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.assets import Environment as AssetsEnvironment, FlaskResolver
from flask.ext.login import LoginManager

__all__ = ['mail', 'db', 'assets', 'login_manager']

mail = Mail()
db = SQLAlchemy(session_options={'autocommit': False})

# Flask-Assets doesn't use url_for if a custom output directory is set.
# But we need to use url_for to get X-Script-Name to work.
# Use custom resolver that always uses the internal convert_item_to_flask_url
# method. resolve_output_to_path (with support for direcotry) is untouched.

class Resolver(FlaskResolver):

    def resolve_output_to_url(self, ctx, target):
        prefix = getattr(ctx.environment, 'static_url_prefix')
        if prefix:
            target = prefix + '/' + target
        return self.convert_item_to_flask_url(ctx, target)

class Environment(AssetsEnvironment):
    resolver_class = Resolver

assets = Environment()
login_manager = LoginManager()
