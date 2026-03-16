目录结构：

```
flask-server/
  app.py                # 入口（使用工厂创建 app）
  app_factory.py        # App Factory，注册蓝图，初始化数据库
  models.py             # Model（SQLAlchemy ORM）
  controllers/          # Controller（Flask Blueprints）
    users.py
    mentors.py
    appointments.py
```

1. 数据库
- 安装 MySQL，并在 `app_factory.py` 中修改 `SQLALCHEMY_DATABASE_URI`
- 首次运行会自动建表（`db.create_all()`）

2. 安装依赖
`pip install -r requirements.txt`


3. 配置文件
- 在 `flask-server/config.yml` 提供配置，应用启动时加载；文件缺失会报错。
- 示例：

```
SECRET_KEY: "secret"
SQLALCHEMY_DATABASE_URI: "mysql://root:123456@localhost/mentor_booking_system"
SQLALCHEMY_TRACK_MODIFICATIONS: false
SQLALCHEMY_POOL_RECYCLE: 299
```

- 说明：
  - `SECRET_KEY`: Flask/JWT 密钥，生产环境请更换为强随机值。
  - `SQLALCHEMY_DATABASE_URI`: 数据库连接串。
  - 其余项可选，不配置则使用默认值（`TRACK_MODIFICATIONS=false`，`POOL_RECYCLE=299`）。

4. 开发运行
`python app.py`

5. 健康检查
GET `/health` 返回 `{ "status": "ok" }`

6. 接口测试
- 注册（POST `/api/users/register`）

```
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"Passw0rd!","first_name":"Alice","last_name":"Lee"}'
```

- 登录（POST `/api/users/login`）

```
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Passw0rd!"}'
```

 

- 查看个人信息（GET `/api/users/me`）

```
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <JWT>"
```

 

- 更新个人信息（PUT `/api/users/me`）

```
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Alice","last_name":"Wang","email":"alice_new@example.com"}'
```

 