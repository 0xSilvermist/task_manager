# Calendar App - Индивидуален проект

## Описание

Календарно приложение за управление на задачи с React frontend, Node.js/Express backend, MySQL база данни, Nginx reverse proxy и SSL сертификати.

## Архитектура

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS (443)
       │ HTTP (80) → redirects to HTTPS
       ↓
┌─────────────┐
│    Nginx    │ (Reverse Proxy + SSL)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ↓       ↓
┌──────┐ ┌──────┐
│Front │ │ API  │
│end   │ │      │
└──────┘ └───┬──┘
             │
             ↓
        ┌────────┐
        │  MySQL │
        └────────┘
```

## Компоненти

### 1. Frontend (React)
- **Технология:** React + Vite + Tailwind CSS
- **Порт:** 3000 (вътрешен)
- **Функционалност:** Календар, CRUD операции за задачи

### 2. Backend API (Node.js/Express)
- **Технология:** Node.js + Express
- **Порт:** 3001 (вътрешен)
- **Функционалност:** RESTful API за управление на задачи

### 3. Database (MySQL)
- **Технология:** MySQL 8.0
- **Порт:** 3306
- **База данни:** calendar_db
- **Таблица:** tasks

### 4. Reverse Proxy (Nginx)
- **Технология:** Nginx
- **Портове:** 80 (HTTP), 443 (HTTPS)
- **Функционалност:** Reverse proxy, SSL/TLS, маршрутизация

### 5. SSL/TLS
- **Тип:** Self-signed сертификат
- **Валидност:** 365 дни
- **Файлове:** nginx/ssl/server.crt, nginx/ssl/server.key

## Стартиране

### Първоначална настройка

1. **Клониране/Изтегляне на проекта**
```bash
cd calendar_app
```

2. **Създаване на .env файл**
```bash
cat > .env << EOF
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=calendar_db
MYSQL_USER=appuser
MYSQL_PASSWORD=apppass
EOF
```

3. **Стартиране на контейнерите**
```bash
docker compose up -d --build
```

4. **Проверка на статуса**
```bash
docker compose ps
```

### Достъп до приложението

- **Frontend:** https://localhost (или http://localhost - автоматично пренасочва към HTTPS)
- **Backend API:** https://localhost/api/health

**Забележка:** При първо отваряне браузърът ще покаже предупреждение за self-signed сертификат. Това е нормално - изберете "Advanced" → "Proceed to localhost".

## Monitoring

### Използване на Docker Stats

```bash
# Реално време
./monitor.sh
# или
docker stats

# Еднократно изпълнение
docker stats --no-stream
```

За подробно обяснение вижте [MONITORING.md](./MONITORING.md)

## Документация

- [NGINX_SETUP.md](./NGINX_SETUP.md) - Обяснение на Nginx reverse proxy
- [SSL_SETUP.md](./SSL_SETUP.md) - Обяснение на SSL сертификатите
- [MONITORING.md](./MONITORING.md) - Обяснение на Docker Stats monitoring
- [TEST_API.md](./TEST_API.md) - Инструкции за тестване на API

## Структура на проекта

```
calendar_app/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── index.js     # API endpoints
│   │   └── db.js        # Database connection
│   └── Dockerfile
├── frontend/             # React приложение
│   ├── src/
│   │   ├── App.jsx      # Главен компонент
│   │   ├── api.js       # API функции
│   │   └── Modal.jsx    # Модални прозорци
│   └── Dockerfile
├── mysql/
│   └── init/
│       └── 01_schema.sql # Database schema
├── nginx/
│   ├── nginx.conf        # Nginx конфигурация
│   └── ssl/              # SSL сертификати
│       ├── server.crt
│       └── server.key
├── docker-compose.yml    # Docker Compose конфигурация
├── .env                  # Environment variables
├── monitor.sh            # Скрипт за monitoring
└── README.md            # Тази документация
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/tasks?month=YYYY-MM` - Списък с задачи (с опционален филтър по месец)
- `POST /api/tasks` - Създаване на задача
- `PUT /api/tasks/:id` - Редактиране на задача
- `DELETE /api/tasks/:id` - Изтриване на задача

## Изпълнени изисквания

✅ **Минимални условия:**
- Потребителски интерфейс за CRUD операции

✅ **Общ вид:**
- Docker Compose решение
- Load balancer (Nginx)
- Frontend (React)
- Backend (Node.js/Express)
- База данни (MySQL)
- Self-signed SSL сертификати
- Monitoring (Docker Stats)

## Команди

### Управление на контейнерите
```bash
# Стартиране
docker compose up -d

# Спиране
docker compose down

# Рестарт
docker compose restart

# Логове
docker compose logs -f
```

### Monitoring
```bash
# Реално време
./monitor.sh

# Конкретен контейнер
docker stats calendar-api
```

### Проверка
```bash
# Статус на контейнерите
docker compose ps

# Health check
curl -k https://localhost/api/health
```

## Технологии

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js 20, Express
- **Database:** MySQL 8.0
- **Reverse Proxy:** Nginx
- **Containerization:** Docker, Docker Compose
- **SSL/TLS:** Self-signed certificates
- **Monitoring:** Docker Stats

## Лиценз

Този проект е създаден за образователни цели.

