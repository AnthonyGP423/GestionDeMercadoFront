# 🏪 AdminMarket — Frontend

> Interfaz web del **Sistema de Gestión de Mercado Mayorista**, desarrollada como parte del Proyecto de Titulación (PPI).
<img width="1896" height="956" alt="image" src="https://github.com/user-attachments/assets/9b8d36ef-09e7-4d49-8d73-d2018a359077" />

---

## 📋 Descripción

AdminMarket es una plataforma Full Stack orientada a la administración financiera y operativa de un mercado mayorista. Este repositorio contiene el **frontend web** que consume la API REST del backend, permitiendo la interacción entre administradores, supervisores, socios y clientes.

---

## 🚀 Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.2 | Librería UI |
| TypeScript | 5.2 | Tipado estático |
| Vite | 5.2 | Bundler y dev server |
| MUI (Material UI) | 7.3 | Componentes de interfaz |
| React Router DOM | 7.9 | Enrutamiento |
| React QR Code | 2.0 | Generación de códigos QR |
| Emotion | 11.14 | Estilos en componentes |

---

## ✨ Funcionalidades

- 🔐 **Autenticación** con JWT y control de acceso por roles (ADMIN, SUPERVISOR, SOCIO, CLIENTE)
- 👥 **Gestión de usuarios** — creación, edición, cambio de estado y asignación de roles
- 🏬 **Gestión de stands** — registro, categorización y asignación a socios
- 📦 **Gestión de productos** — CRUD con control de precios, ofertas y visibilidad pública
- 💳 **Cuotas y pagos** — seguimiento de pagos, deudas y generación de reportes
- 🚨 **Incidencias** — registro y seguimiento de incidencias operativas
- ⭐ **Calificaciones** — visualización de valoraciones de stands
- 📲 **Credenciales QR** — generación y validación de credenciales para socios
- 🗂️ **Directorio público** — exploración de stands y productos sin necesidad de login

---

## 🗂️ Estructura del Proyecto

```
src/
├── assets/          # Imágenes y recursos estáticos
├── components/      # Componentes reutilizables
├── pages/           # Vistas por módulo (usuarios, stands, productos...)
├── router/          # Configuración de rutas
├── services/        # Llamadas a la API (fetch / axios)
├── types/           # Tipos e interfaces TypeScript
└── main.tsx         # Punto de entrada
```

---

## ⚙️ Instalación y Ejecución

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Backend corriendo en `http://localhost:8080` ([ver repositorio backend](https://github.com/jesuslink1/GestionMercadoMayorista))

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/OmarGDev/GestionDeMercadoFront.git
cd GestionDeMercadoFront

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 4. Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con HMR
npm run build     # Build de producción
npm run preview   # Vista previa del build
npm run lint      # Análisis estático del código
```

---

## 🔧 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080
```

> ⚠️ **Importante:** No subas el archivo `.env` con credenciales reales al repositorio. Usa `.env.example` como plantilla.

---

## 🔗 Repositorio Backend

El backend está desarrollado en **Java 21 + Spring Boot** y expone una API REST documentada con Swagger.

➡️ [GestionMercadoMayorista (Spring Boot)](https://github.com/jesuslink1/GestionMercadoMayorista)

Una vez que el backend esté corriendo, puedes acceder a la documentación en:
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## 👥 Equipo

| Nombre | Rol | GitHub |
|---|---|---|
| Luis Aguilar | Líder del proyecto | |
| Omar G. | Frontend Developer |[@OmarGDev](https://github.com/OmarGDev) |
| Jesús Ramos | Backend Developer | [@jesuslink1](https://github.com/jesuslink1) |
| André León | Soporte y documentación  | |

---

## 📄 Licencia

Proyecto académico desarrollado como parte del **Proyecto de Titulación (PPI)**.
