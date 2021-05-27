from munimap.extensions import db

__all__ = ['ProtectedProject']


project_group = db.Table(
    'mm_project_group', db.metadata,
    db.Column('mm_project_id', db.Integer, db.ForeignKey('mm_projects.id')),
    db.Column('mb_group_id', db.Integer, db.ForeignKey('mb_group.mb_group_id')),
    info={'bind_key': 'mapbender'}
)

class ProtectedProject(db.Model):
    __tablename__ = 'mm_projects'
    __bind_key__ = 'mapbender'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)

    groups = db.relationship(
        'MBGroup',
        secondary=project_group,
        backref='projects'
    )

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

    def to_dict(self, project_names):
        missing_config = self.name not in project_names
        return dict(
            id=self.id,
            name=self.name,
            missingConfig=missing_config
        )
