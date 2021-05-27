from munimap.extensions import db

__all__ = ['MBGroup']


class MBGroup(db.Model):
    __tablename__ = 'mb_group'
    __bind_key__ = 'mapbender'

    mb_group_id = db.Column(db.Integer(), primary_key=True)
    mb_group_name = db.Column(db.String, nullable=False)
    mb_group_owner = db.Column(db.Integer())
    mb_group_description = db.Column(db.String(), nullable=False, default='')
    mb_group_title = db.Column(db.String(), nullable=False, default='')
    mb_group_ext_id = db.Column(db.Integer())
    mb_group_address = db.Column(db.String(), nullable=False, default='')
    mb_group_postcode = db.Column(db.String(), nullable=False, default='')
    mb_group_city = db.Column(db.String(), nullable=False, default='')
    mb_group_stateorprovince = db.Column(db.String(), nullable=False, default='')
    mb_group_country = db.Column(db.String(), nullable=False, default='')
    mb_group_voicetelephone = db.Column(db.String(), nullable=False, default='')
    mb_group_facsimiletelephone = db.Column(db.String(), nullable=False, default='')
    mb_group_email = db.Column(db.String(), nullable=False, default='')
    mb_group_logo_path = db.Column(db.String(), nullable=False, default='')
    mb_group_homepage = db.Column(db.String(), nullable=False, default='')

    @property
    def id(self):
        return self.mb_group_id

    @property
    def name(self):
        return self.mb_group_name

    @name.setter
    def name(self, v):
        self.mb_group_name = v

    @property
    def title(self):
        return self.mb_group_title

    @title.setter
    def title(self, v):
        self.mb_group_title = v

    @property
    def description(self):
        return self.mb_group_description

    @description.setter
    def description(self, v):
        self.mb_group_description = v

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.mb_group_id == id)
        return q.first_or_404()

    @classmethod
    def by_id_without_404(cls, id):
        q = cls.query.filter(cls.mb_group_id == id)
        return q.first()

    @classmethod
    def by_name(cls, name):
        q = cls.query.filter(cls.mb_group_name == name)
        return q.first()

    def to_dict(self):
        return dict(
            id=self.id,
            name=self.name,
            title=self.title,
            description=self.description,
            users=[u.id for u in self.users],
            layers=[l.name for l in self.layers],
            projects=[p.name for p in self.projects]
        )

    def __repr__(self):
        return '<Group name=%s title="%s">' % (
            self.mb_group_name, self.mb_group_title
        )

    def __str__(self):
        return self.mb_group_title
