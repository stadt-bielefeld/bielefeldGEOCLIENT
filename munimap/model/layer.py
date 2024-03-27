from munimap.extensions import db

from sqlalchemy.orm import class_mapper

__all__ = ['ProtectedLayer']


layer_group = db.Table(
    'mm_layer_group', db.metadata,
    db.Column('mm_layer_id', db.Integer, db.ForeignKey('mm_layers.id')),
    db.Column('mb_group_id', db.Integer, db.ForeignKey('mb_group.mb_group_id'))
)


class ProtectedLayer(db.Model):
    __tablename__ = 'mm_layers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    title = db.Column(db.String, nullable=False)

    groups = db.relationship(
        'MBGroup',
        secondary=layer_group,
        backref='layers'
    )

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first_or_404()

    @classmethod
    def by_id_without_404(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()

    @classmethod
    def by_name(cls, name):
        q = cls.query.filter(cls.name == name)
        return q.first_or_404()

    @classmethod
    def by_name_without_404(cls, name):
        q = cls.query.filter(cls.name == name)
        return q.first()

    @classmethod
    def layer_names(cls):
        return [l.name for l in cls.query.all()]

    @classmethod
    def has_user_permission(cls, layer, user):
        sqlTpl = """
          SELECT 
            count(*) AS count 
          FROM 
            mm_layer_group lg
          JOIN public.mb_user_mb_group ug ON ug.fkey_mb_group_id = lg.mb_group_id
          WHERE 
            lg.mm_layer_id = :layerId
            AND ug.fkey_mb_user_id = :userId;
        """
        result = db.session.execute(sqlTpl, {"userId": user.id, "layerId": layer.id}, mapper=class_mapper(ProtectedLayer))

        return result.fetchone()[0] > 0

    def to_dict(self, layer_config_names):
        missing_config = self.name not in layer_config_names
        return dict(
            id=self.id,
            name=self.name,
            title=self.title,
            missingConfig=missing_config
        )
