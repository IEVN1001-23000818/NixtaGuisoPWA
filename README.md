# NixtaGuiso · PWA

Cocina tradicional con modelo Dark Kitchen en León, Guanajuato. Proyecto final con **Angular 22**, **Flask** y **MySQL**.

## Estructura

```
NixtaGuisoPWA/            ← Frontend Angular (PWA)
├── src/app/
│   ├── modulos/          ← pantallas de los 10 módulos
│   ├── compartidos/      ← barra inferior, barra superior y menú lateral
│   ├── servicios/        ← comunicación con Flask
│   └── guards/           ← protección de pantallas (cliente / administrador)
├── public/               ← logos, íconos y manifest de la PWA
└── nixtoflask/
    ├── database/         ← nixtaguiso.sql (base de datos completa)
    └── flask/            ← API REST
        ├── blueprints/   ← rutas por módulo (pantallas/ = rutas del frontend)
        └── utils/        ← reglas del negocio
```

## Requisitos

Laragon (MySQL), Python 3.11, Node.js y Angular CLI 22.

## Instalación (una sola vez)

1. **Base de datos:** Laragon → Start All → phpMyAdmin → Importar → `nixtoflask/database/nixtaguiso.sql`.
2. **Flask:**
   ```cmd
   cd nixtoflask\flask
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   copy config.example.py config.py
   ```
   Escribe tu usuario y contraseña de MySQL en `config.py`.
3. **Angular** (en la raíz del proyecto):
   ```cmd
   npm install
   ```

## Ejecutar (cada vez)

**Terminal 1 (Flask):**
```cmd
cd nixtoflask\flask
venv\Scripts\activate
py app.py
```

**Terminal 2 (Angular):**
```cmd
ng serve
```

Abrir `http://localhost:4200` (usar `localhost`, no `127.0.0.1`).

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@nixtaguiso.mx | Admin123* |
| Cliente Hogar | judith@ejemplo.com | Cliente123* |
| Cliente Negocio | tacoseltomy@ejemplo.com | Cliente123* |

## Probar la PWA (instalable)

```cmd
ng build
npx http-server dist/nixtaguiso/browser -p 4200 -c-1 -P http://localhost:4200?
```
