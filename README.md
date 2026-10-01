# 🎟️ EventHub — Plataforma Profesional de Ticketing & Control de Acceso

EventHub es una plataforma SaaS comercial de creación, publicación, venta y validación de entradas para eventos masivos, festivales, recitales y conferencias. Diseñada con arquitectura de alta concurrencia, transacciones atómicas y seguridad estricta para evitar la sobreventa y el doble check-in de accesos.

---

## 🚀 Flujo Core del Sistema

```
Usuario descubre evento 
   → Selecciona tipo de entrada (General, VIP, Early Bird)
   → Checkout con bloqueo transaccional de stock
   → Emisión de tickets nominativos individuales (cada uno con ticket_code y qr_token únicos)
   → Presenta su pase con código QR en su celular
   → Staff escanea con la cámara del dispositivo móvil
   → Procedimiento PostgreSQL valida y bloquea atómicamente la entrada
   → Entrada queda quemada como 'used'
   → Segundo intento es inmediatamente RECHAZADO
```

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Frontend & UI:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **QR Engine:** `qrcode.react` (Generación SVG de alta densidad) & `html5-qrcode` (Lector móvil con cámara frontal/trasera)
- **Base de Datos & Backend:** Supabase, PostgreSQL 15+, Row Level Security (RLS)
- **Transacciones Atómicas:** Stored Procedures (`process_checkout`, `validate_and_checkin_ticket`) con bloqueos pesimistas `SELECT ... FOR UPDATE`

---

## 👥 Sistema de Roles y Permisos (RBAC)

| Rol | Capacidades |
|---|---|
| **USER** | Explorar eventos, comprar entradas, ver billetera `/mis-entradas` con código QR, editar perfil. |
| **ORGANIZER** | Crear eventos, fijar precios y cupos, ver dashboard financiero, consultar asistentes y auditar accesos en `/organizer/access`. |
| **STAFF** | Terminal de escáner en puerta `/staff/scan` con lectura de cámara, validación instantánea y registro de check-in. |
| **ADMIN** | Control global de la plataforma `/admin/dashboard`, usuarios, eventos, órdenes y auditoría. |

*Nota:* La aplicación incluye un **Selector Rápido de Roles** en la barra superior para probar instantáneamente la experiencia de cada actor durante demostraciones.

---

## 🔐 Integridad y Concurrencia

### 1. Prevención de Sobreventa (Anti-Overselling)
En `process_checkout`, cada tipo de entrada se bloquea mediante `SELECT * FROM ticket_types WHERE id = ... FOR UPDATE`. Si múltiples usuarios intentan comprar la última entrada disponible en el mismo milisegundo, PostgreSQL serializa las transacciones y rechaza la compra excedente mediante la restricción:
```sql
CONSTRAINT check_ticket_stock CHECK (sold_quantity <= quantity)
```

### 2. Prevención de Doble Check-in (Anti-Double Scan)
En `validate_and_checkin_ticket`, el ticket se bloquea atómicamente con `SELECT * FROM tickets WHERE qr_token = ... FOR UPDATE`. Si dos guardias escanean el mismo ticket simultáneamente en puertas distintas, el primer escaneo marca el estado como `used`, registra el check-in y el segundo escaneo recibe un rechazo categórico con la hora exacta del primer ingreso.

---

## 📁 Estructura del Proyecto

```
eventhub/
├── supabase/
│   ├── complete_schema_and_seed.sql   # Script SQL consolidado listo para Supabase
│   └── migrations/                    # Migraciones modulares (tablas, funciones, RLS, seed)
├── src/
│   ├── app/
│   │   ├── (auth)/login & register/   # Autenticación
│   │   ├── eventos/                   # Cartelera y explorador interactivo
│   │   │   └── [slug]/                # Detalle del evento y selector de tickets
│   │   │       └── checkout/          # Pasarela y emisión de tickets con confeti
│   │   ├── mis-entradas/              # Billetera con diseño físico de pase y QR
│   │   ├── organizer/                 # Dashboard, creación de eventos y accesos
│   │   ├── staff/scan/                # Terminal de escáner móvil con cámara
│   │   ├── admin/dashboard/           # Panel administrativo global
│   │   └── perfil/                    # Perfil de usuario
│   ├── components/                    # Componentes UI modulares
│   ├── context/                       # AuthContext y ToastContext
│   ├── lib/services/                  # Servicios de datos, checkout y validación
│   └── types/                         # Definiciones de TypeScript y Base de Datos
```

---

## ⚙️ Configuración y Ejecución Local

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/tu-usuario/eventhub.git
cd eventhub
npm install
```

### 2. Variables de Entorno
Copia `.env.example` a `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Configuración de Base de Datos en Supabase
1. Ingresá a tu consola de [Supabase](https://app.supabase.com).
2. Abrí el **SQL Editor**.
3. Pegá y ejecutá el contenido de [`supabase/complete_schema_and_seed.sql`](supabase/complete_schema_and_seed.sql).
4. El script configurará automáticamente las 13 tablas, índices, procedimientos atómicos, políticas RLS y datos demo realistas.

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🎥 Guía de Demostración Rápida

1. **Exploración:** Ingresá a `/eventos` y filtrá por festival o categoría.
2. **Compra:** Seleccioná *Neon Echoes: Sunset Festival 2026*, elegí 2 entradas VIP y avanzá al Checkout.
3. **Cupón:** Aplicá el código `EVENTHUB20` para obtener 20% de descuento y confirmá la compra.
4. **Ver Pases:** Abrí `/mis-entradas`, hacé clic en tu ticket para ver el pase con código QR ampliable.
5. **Control de Acceso:** En la barra superior, cambiá al rol **STAFF** e ingresá a `/staff/scan`.
6. **Validación:** Ingresá el código o mostrá el QR a la cámara. El sistema responderá:
   `✅ ENTRADA VÁLIDA — Acceso Autorizado`.
7. **Prueba de Doble Escaneo:** Volvé a ingresar el mismo código en el escáner. El sistema responderá:
   `❌ ENTRADA YA UTILIZADA — Acceso Denegado (Muestra hora del 1er ingreso)`.
8. **Métricas en Vivo:** Cambiá al rol **ORGANIZER** y observá cómo `/organizer/access` y `/organizer/dashboard` reflejan la asistencia actualizada.



