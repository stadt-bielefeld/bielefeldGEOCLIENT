import md5

from .mb_group import MBGroup
from .mb_user import MBUser
from .layer import ProtectedLayer
from .project import ProtectedProject


def test_data():
    admin_group = MBGroup()
    admin_group.name = 'admin_group'
    admin_group.title = 'Admin Group'
    admin_group.description = 'Administrators'

    admin_user = MBUser()
    admin_user.mb_user_name = 'admin'
    admin_user.mb_user_email = 'admin@example.org'
    admin_user.mb_user_password = md5.new('secure').hexdigest()
    admin_group.users.append(admin_user)

    user_group = MBGroup()
    user_group.name = 'user group'
    user_group.title = 'User Group'
    user_group.description = 'Users'

    user = MBUser()
    user.mb_user_name = 'user'
    user.mb_user_email = 'user@example.org'
    user.mb_user_password = md5.new('secure').hexdigest()
    user_group.users.append(user)

    # layer names have to match layers in test/data/test_layers_conf.yaml
    wms_layer = ProtectedLayer()
    wms_layer.name = 'wms_protected'
    wms_layer.title = 'Protected WMS'
    user_group.layers.append(wms_layer)

    wmts_layer = ProtectedLayer()
    wmts_layer.name = 'wmts_protected'
    wmts_layer.title = 'Protected WMTS'
    user_group.layers.append(wmts_layer)

    # project names have to match app in test/data/app/
    protected_app = ProtectedProject()
    protected_app.name = 'protected_app'
    user_group.projects.append(protected_app)

    return [admin_group, user_group]
