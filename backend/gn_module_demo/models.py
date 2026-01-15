
from geonature.utils.env import DB

class Demo(DB.Model):
    __tablename__ = "t_demos"
    __table_args__ = {"schema": "gn_demo"}

    id_demo = DB.Column(
        "id_demo",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )
