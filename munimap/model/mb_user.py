import hashlib
import uuid
import datetime

from flask_login import UserMixin, AnonymousUserMixin as LoginAnonymousUser
from flask import current_app, url_for
from munimap.extensions import db
from sqlalchemy import func

__all__ = ['MBUser', 'AnonymousUser', 'DummyUser', 'EmailVerification']

mb_user_mb_group = db.Table(
    'mb_user_mb_group', db.metadata,
    db.Column('fkey_mb_user_id', db.Integer, db.ForeignKey('mb_user.mb_user_id', name='fkey_mb_user_mb_group_user_id'), nullable=False),
    db.Column('fkey_mb_group_id', db.Integer, db.ForeignKey('mb_group.mb_group_id', name='fkey_mb_user_mb_group_group_id'), nullable=False)
)

RECOVER_VALID_FOR = datetime.timedelta(days=1)

class AnonymousUser(LoginAnonymousUser):
    """
    AnonymousUser to load permissions or group
    if the user is not logged in
    """

    @property
    def permissions(self):
        return []

    @property
    def alkis_legimation_modal(self):
        return False

    @property
    def groups_list(self):
        return []

class DummyUser(UserMixin):
    """
    DummyUser used for static requests
    """
    def __init__(self, id):
        self.id = id


class MBUser(db.Model, UserMixin):
    __tablename__ = 'mb_user'

    mb_user_id = db.Column(db.Integer(), primary_key=True)
    mb_user_name = db.Column(db.String(), nullable=False)
    mb_user_password = db.Column(db.String(), nullable=False)
    mb_user_active = db.Column(db.Boolean, default=True)
    mb_user_idm_managed = db.Column(db.Boolean, default=True)
    mb_user_owner = db.Column(db.Integer(), nullable=False, default=0)
    mb_user_description = db.Column(db.String())
    mb_user_login_count = db.Column(db.Integer(), nullable=False, default=0)
    mb_user_email = db.Column(db.String())
    mb_user_phone = db.Column(db.String())
    mb_user_department = db.Column(db.String())
    mb_user_organisation_name = db.Column(db.String())
    mb_user_position_name = db.Column(db.String())
    mb_user_facsimile = db.Column(db.String())
    mb_user_delivery_point = db.Column(db.String())
    mb_user_city = db.Column(db.String())
    mb_user_postal_code = db.Column(db.Integer())
    mb_user_country = db.Column(db.String())
    mb_user_street = db.Column(db.String())
    mb_user_housenumber = db.Column(db.String())
    mb_user_valid_from = db.Column(db.Date())
    mb_user_valid_to = db.Column(db.Date())
    mb_user_firstname = db.Column(db.String(), default='')
    mb_user_lastname = db.Column(db.String(), default='')
    mb_user_academictitle = db.Column(db.String(), default='')
    mb_user_dienstkey = db.Column(db.String())

    groups = db.relationship(
        'MBGroup',
        secondary=mb_user_mb_group,
        backref='users'
    )

    email_verification = db.relationship(
        'EmailVerification',
        backref='user',
        cascade='all, delete'
    )

    @property
    def is_disabled(self):
        if not self.mb_user_active:
            return True
        if self.mb_user_valid_to is not None and datetime.date.today() > self.mb_user_valid_to:
            return True
        return False

    @property
    def id(self):
        return self.mb_user_id

    @property
    def name(self):
        return self.mb_user_name

    @property
    def groups_list(self):
        group_names = []
        for group in self.groups:
            group_names.append(group.name)
        return group_names

    @property
    def alkis_legimation_modal(self):
        if current_app.config.get('ALKIS_LEGITIMATION_GROUP') in self.groups_list:
            return True
        return False

    @property
    def with_alkis_owner(self):
        if current_app.config.get('ALKIS_WITH_OWNER_GROUP') in self.groups_list or current_app.config.get('ALKIS_WITH_OWNER_OFFICIAL') in self.groups_list:
            return True
        return False

    @property
    def with_alkis_official(self):
        if current_app.config.get('ALKIS_WITH_OWNER_OFFICIAL') in self.groups_list:
            return True
        return False

    @property
    def email(self):
        return self.mb_user_email

    @property
    def valid_to(self):
        if self.mb_user_valid_to:
            return self.mb_user_valid_to.strftime("%d.%m.%Y")
        return None

    @property
    def valid_from(self):
        if self.mb_user_valid_from:
            return self.mb_user_valid_from.strftime("%d.%m.%Y")
        return None

    @property
    def projects(self):
        projects = []
        for group in self.groups:
            for project in group.projects:
                if project not in projects:
                    projects.append(project)
        return projects

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.mb_user_id == id)
        return q.first_or_404()

    @classmethod
    def by_email(cls, email):
        q = cls.query.filter(func.lower(cls.mb_user_email) == func.lower(email))
        return q.first()

    @classmethod
    def by_name(cls, username):
        q = cls.query.filter(func.lower(cls.mb_user_name) == func.lower(username))
        return q.first()

    @classmethod
    def by_id_without_404(cls, id):
        q = cls.query.filter(cls.mb_user_id == id)
        return q.first()

    def update_password(self, password):
        if not password:
            raise ValueError("Password must be non empty.")
        self.mb_user_password = hashlib.md5(password.encode('utf-8')).hexdigest()

    def check_password(self, password):
        if not self.mb_user_password:
            return False
        _hash = hashlib.md5(password.encode('utf-8')).hexdigest()
        if _hash == self.mb_user_password:
            return True
        return False

    def to_dict(self):
        return dict(
            id=self.id,
            name=self.name,
            status=self.mb_user_active,
            department=self.mb_user_department,
            valid_to=self.valid_to,
            email=self.email,
            groups=[{'id': g.id, 'name': g.name} for g in self.groups]
        )

    def to_mb_dict(self):
        return dict(
            mb_user_id = self.mb_user_id,
            mb_user_name = self.mb_user_name,
            mb_user_active = self.mb_user_active,
            mb_user_idm_managed = self.mb_user_idm_managed,
            mb_user_description = self.mb_user_description,
            mb_user_login_count = self.mb_user_login_count,
            mb_user_email = self.mb_user_email,
            mb_user_phone = self.mb_user_phone,
            mb_user_department = self.mb_user_department,
            mb_user_organisation_name =self. mb_user_organisation_name,
            mb_user_position_name = self.mb_user_position_name,
            mb_user_facsimile = self.mb_user_facsimile,
            mb_user_delivery_point = self.mb_user_delivery_point,
            mb_user_city = self.mb_user_city,
            mb_user_postal_code = self.mb_user_postal_code,
            mb_user_country = self.mb_user_country,
            mb_user_street = self.mb_user_street,
            mb_user_housenumber = self.mb_user_housenumber,
            mb_user_valid_to = self.valid_to,
            mb_user_valid_from = self.valid_from,
            mb_user_firstname = self.mb_user_firstname,
            mb_user_lastname = self.mb_user_lastname,
            mb_user_academictitle = self.mb_user_academictitle,
            mb_user_dienstkey = self.mb_user_dienstkey,
            groups=[{'id': g.id, 'name': g.name} for g in self.groups]
        )


class EmailVerification(db.Model):
    __tablename__ = 'password_recovery'

    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String, unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('mb_user.mb_user_id'))
    valid_till = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.UTC) + RECOVER_VALID_FOR
    )

    @classmethod
    def by_hash(cls, hash):
        q = EmailVerification.query.filter(EmailVerification.hash == hash)
        recover = q.first()
        return recover

    @classmethod
    def recover(cls, user):
        return EmailVerification(user_id=user.id, hash=str(uuid.uuid4()))

    @property
    def url(self):
        return url_for('user.set_new_password', uuid=self.hash, _external=True)

    @property
    def expired(self):
        if datetime.datetime.now(datetime.UTC) < self.valid_till:
            return False
        return True

