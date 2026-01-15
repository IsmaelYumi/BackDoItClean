# DoItClean - Backend API

Backend para sistema de gestión de lavandería con dispositivos inteligentes (lavadoras y secadoras), productos, usuarios y servicios.

## 🚀 Tecnologías

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Firebase Admin SDK** - Base de datos (Firestore)
- **dotenv** - Variables de entorno

## 📁 Estructura del Proyecto

```
src/
├── app.ts                    # Configuración de Express
├── index.ts                  # Punto de entrada
├── config/
│   └── dbconfig.config.ts    # Configuración Firebase
├── controllers/
│   ├── Device.controller.ts  # Controlador de dispositivos
│   ├── Product.controller.ts # Controlador de productos
│   ├── Service.controller.ts # Controlador de servicios
│   └── User.controller.ts    # Controlador de usuarios
├── services/
│   ├── Device.service.ts     # Lógica de dispositivos
│   ├── product.service.ts    # Lógica de productos
│   ├── Service.service.ts    # Lógica de servicios
│   └── user.service.ts       # Lógica de usuarios
├── routes/
│   ├── device.routes.ts      # Rutas de dispositivos
│   ├── product.routes.ts     # Rutas de productos
│   └── service.routes.ts     # Rutas de servicios
└── middleware/
    └── auth.middleware.ts    # Middleware de autenticación
```

## ⚙️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/BackDoItClean.git
cd BackDoItClean
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:

Crear archivo `.env` en la raíz del proyecto:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu clave privada aquí\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=tu-email@proyecto.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=tu-secret-key-super-segura

# Server Configuration
PORT=3000
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

## 📡 API Endpoints

### Dispositivos (Devices)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/devices` | Crear dispositivo |
| POST | `/api/devices/bulk` | Crear múltiples dispositivos |
| GET | `/api/devices` | Obtener todos los dispositivos |
| GET | `/api/devices/code/:code` | Obtener dispositivo por código |
| GET | `/api/devices/type/:type` | Filtrar por tipo (washer/dryer) |
| GET | `/api/devices/status/:status` | Filtrar por estado |
| PUT | `/api/devices/:code` | Actualizar dispositivo |
| DELETE | `/api/devices/:code` | Eliminar dispositivo |

**Ejemplo - Crear dispositivo:**
```json
POST /api/devices
{
  "id": 1,
  "code": "WASH-001",
  "type": "washer",
  "name": "Lavadora Industrial",
  "price": 5000,
  "brand": "Samsung",
  "description": "Lavadora de alta capacidad",
  "label": "Premium",
  "model": "X100",
  "category": "Industrial",
  "capacityKg": 20,
  "isVisible": true,
  "status": "online",
  "imageUrl": "https://..."
}
```

**Ejemplo - Crear múltiples dispositivos:**
```json
POST /api/devices/bulk
{
  "devices": [
    { /* dispositivo 1 */ },
    { /* dispositivo 2 */ }
  ]
}
```

### Productos (Products)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/products` | Crear producto |
| POST | `/api/products/bulk` | Crear múltiples productos |
| GET | `/api/products/:id` | Obtener producto por ID |
| DELETE | `/api/products/:id` | Eliminar producto |

**Ejemplo - Crear producto:**
```json
POST /api/products
{
  "id": 1,
  "Nombre": "Detergente Premium",
  "precio": 50,
  "categoria": "Limpieza",
  "imagenUrl": "https://...",
  "codigo": "DET-001",
  "isVisible": 1,
  "descripccion": "Detergente líquido"
}
```

### Servicios (Services)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/services` | Crear servicio/nota de venta |
| POST | `/api/services/validate-device` | Validar y actualizar estado de dispositivo |
| GET | `/api/services` | Obtener todos los servicios |
| GET | `/api/services/:id` | Obtener servicio por ID |
| GET | `/api/services/client/:clientId` | Obtener servicios por cliente |
| GET | `/api/services/user/:userId` | Obtener servicios por operario |
| GET | `/api/services/type/:type` | Filtrar por tipo de servicio |
| GET | `/api/services/date-range?startDate=...&endDate=...` | Filtrar por rango de fechas |

**Ejemplo - Crear servicio:**
```json
POST /api/services
{
  "IdCliente": "cliente123",
  "Fecha": "2026-01-15T10:30:00",
  "CartList": [
    {
      "deviceType": "lavadora",
      "deviceCode": "WASH-001",
      "deviceName": "Lavadora Premium",
      "quantity": 1
    },
    {
      "deviceType": "secadora",
      "deviceCode": "DRY-001"
    }
  ],
  "PaymentType": "Cash",
  "ServiceType": "AutoService",
  "IdUser": "operario456",
  "Total": 150.50
}
```

**Ejemplo - Validar y actualizar dispositivo:**
```json
POST /api/services/validate-device
{
  "transactionId": "Servicio_abc123xyz",
  "deviceCode": "WASH-001"
}
```

Este endpoint:
1. Valida que el dispositivo esté en la transacción
2. Actualiza el estado del dispositivo a `offline`

## 🗄️ Colecciones de Firestore

### Devices
- `code` (ID del documento)
- `id`, `type`, `name`, `price`, `brand`, `description`
- `label`, `model`, `category`, `capacityKg`
- `imageUrl`, `isVisible`, `status`, `error`
- `createdAt`, `updatedAt`

### Products
- `id` (ID del documento convertido a string)
- `name`, `precio`, `descripccion`, `category`
- `imaegURL`, `code`, `inVisible`
- `createdAt`, `updatedAt`

### Service
- ID autogenerado por Firestore
- `IdCliente`, `Fecha`, `CartList`, `PaymentType`
- `Sucursal` (siempre 1), `ServiceType`, `IdUser`, `Total`
- `createdAt`, `updatedAt`

### Users
- `userId` (ID del documento)
- Datos del usuario
- `rol` (para filtrar clientes)
- `createdAt`, `updatedAt`

## 📝 Enums

**DeviceType:**
- `WASHER` = 'washer'
- `DRYER` = 'dryer'

**DeviceStatus:**
- `ONLINE` = 'online'
- `OFFLINE` = 'offline'
- `MAINTENANCE` = 'maintenance'

**PaymentType:**
- `CASH` = 'Cash'
- `DEBIT_CREDIT_CARD` = 'Debit/Credit Card'
- `PHONE_PAY` = 'Phone Pay'

**ServiceType:**
- `AUTO_SERVICE` = 'AutoService'
- `ORDER` = 'Order'
- `DRY_CLEANING` = 'Dry Cleaning'

## 🔒 Seguridad

- Las credenciales de Firebase deben estar en el archivo `.env`
- El archivo `.env` debe estar en `.gitignore`
- No subir credenciales al repositorio

## 🛠️ Scripts

```bash
npm run dev      # Ejecutar en modo desarrollo
npm run build    # Compilar TypeScript
npm start        # Ejecutar en producción
```

## 📄 Licencia

MIT

## 👥 Autor

Yumi - DoItClean Backend
