from munimap.extensions import db

from sqlalchemy import and_

__all__ = ['ProjectSettings', 'ProjectDefaultSettings']


project_settings_user = db.Table(
    'mm_project_settings_user', db.metadata,
    db.Column('mm_project_settings_id', db.Integer, db.ForeignKey('mm_project_settings.id')),
    db.Column('mb_user_id', db.Integer, db.ForeignKey('mb_user.mb_user_id'))
)


class ProjectDefaultSettings(db.Model):
    __tablename__ = 'mm_project_default_settings'

    id = db.Column(db.Integer, primary_key=True)

    # TODO change to relation
    mm_project_id = db.Column(db.Integer, nullable=False)
    mm_project_settings_id = db.Column(db.Integer, nullable=False)
    mb_user_id = db.Column(db.Integer)

    def __init__(self, project, project_settings, user):
        self.mm_project_id = project.id
        self.mm_project_settings_id = project_settings.id
        self.mb_user_id = user.id

    @classmethod
    def by_project_and_user(cls, project, user):
        q = cls.query.filter(
            and_(cls.mm_project_id == project.id,
                cls.mb_user_id == user.id
            )
        )
        return q.first()

    @classmethod
    def by_user(cls, user):
        q = cls.query.filter(cls.mb_user_id == user.id)
        return q.all()

class ProjectSettings(db.Model):
    __tablename__ = 'mm_project_settings'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    project = db.Column(db.String, nullable=False)
    settings = db.Column(db.String)

    user = db.relationship(
        'MBUser',
        secondary=project_settings_user,
        backref='project_settings'
    )
    def __init__(self, name, project, settings):
        self.name = name
        self.project = project
        self.settings = settings

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first_or_404()

    @classmethod
    def by_name(cls, name):
        q = cls.query.filter(cls.name == name)
        return q.first_or_404()

    @classmethod
    def by_id_without_404(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()

    @classmethod
    def by_name_without_404(cls, name):
        q = cls.query.filter(cls.name == name)
        return q.first()

    @classmethod
    def by_user_by_name(cls, user, name):
        q = cls.query.filter(cls.name == name).filter(cls.user == user)
        return q.first()

    def __str__(self):
        return self.name
