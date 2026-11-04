# Contenido del perfil y matriz de evidencia

Este documento justifica cada afirmación del README. Regla: **si no hay evidencia, no se publica**. Revisión inicial: 2026-11-04.

## 1. Fuentes revisadas

| Fuente | Qué se comprobó |
|---|---|
| Cuenta GitHub `wilmer-FP` (API) | 0 repositorios propios (públicos y privados), 0 seguidores, cuenta creada 2026-04-27 |
| `SIGAT-UP/backend-sigat` (público) | 4 commits de Wilmer Florez (2026-11-03): migración 0004 (matriz de permisos por rol), migración 0005 (clasificación por escenario), pruebas de integración y de semillas. Stack: Python 3.12, FastAPI, PostgreSQL 16 + PostGIS, SQLAlchemy 2 async, Alembic, pytest, Docker Compose |
| Proyectos locales (sólo manifiestos y tipos de archivo) | Biblioteca (Node.js + Express + SWI-Prolog), app-bancaria (HTML/CSS/JS), POO_JAVA (Java), Paralela y Distribuida (C + OpenMP), Redes Neuronales (Jupyter, NumPy, pandas, Matplotlib), modelos relacionales (Excel) |
| Herramientas instaladas | Git, GitHub CLI, GitHub Desktop, Node.js 24, Docker Desktop, WSL, VS Code, Cursor, Python 3.12, JDK |

> Los repositorios de SIGAT son de un **proyecto académico en equipo** (organización `SIGAT-UP`); se presentan como tal y como **contribución**, no como producto propio ni comercial.

## 2. Clasificación de tecnologías

| Tecnología | Estado | Evidencia | ¿En el README? |
|---|---|---|---|
| Python | **Verificada** | Commits públicos en SIGAT; notebooks académicos | Sí |
| FastAPI | **Verificada (contribución)** | Proyecto SIGAT; tus commits son migraciones y pruebas dentro de la API | Sí |
| PostgreSQL / SQL | **Verificada** | Migraciones SQL/Alembic en SIGAT | Sí |
| SQLAlchemy / Alembic | **Verificada** | Migraciones 0004 y 0005 | Sí |
| pytest | **Verificada** | Pruebas de integración y de semillas | Sí |
| Git / GitHub | **Verificada** | Historial de commits | Sí |
| Node.js / Express | Académica (local) | `Biblioteca/backend/package.json` | Sí, marcada como académica |
| JavaScript | Académica (local) | app-bancaria, Biblioteca | Sí |
| Java | Académica (local) | POO_JAVA | Sí |
| C (OpenMP) | Académica (local) | Ejercicios de computación paralela | Sí |
| Jupyter · NumPy · pandas | Académica (local) | Redes Neuronales | Sí (herramientas) |
| Visual Studio Code | Instalada | Editor en el equipo | Sí (herramientas) |
| **TypeScript** | Pendiente de confirmación | Sólo existe un clon del frontend de SIGAT sin commits tuyos | **No** |
| **React** | Pendiente de confirmación | Igual que TypeScript | **No** |
| **Docker** | Pendiente de confirmación | Docker Desktop instalado; SIGAT usa Compose, pero no hay archivos Docker de tu autoría | **No** |
| **Linux** | Pendiente de confirmación | WSL instalado y scripts `.sh` académicos | **No** |
| **MySQL** | Pendiente de confirmación | Ninguna evidencia encontrada | **No** |
| Prolog (SWI) | Académica (local) | Proyecto Biblioteca | No (fuera del foco backend) |
| C# / Unity | Sin evidencia local | Mencionado en tu biografía actual de GitHub | No |

**Para pasar una tecnología de "pendiente" a "verificada":** publica un repositorio que la use, o confirma tu experiencia y añádela a `README.md` (sección *Tech stack*) y a esta tabla.

## 3. Textos aprobados

**Titular**
- EN: Backend Developer in progress · Systems Engineering Student · Colombia
- ES: Desarrollador backend en formación · Estudiante de Ingeniería de Sistemas · Colombia

**Mensajes**
- Principal: *Designing logic. Building solutions.*
- Secundario: *Engineering ideas into software.*

**Biografía corta (para el campo "Bio" de GitHub, ≤160 caracteres)** — propuesta, no aplicada:

```
Backend Developer in progress · Systems Engineering student · Python, FastAPI, PostgreSQL · Designing logic. Building solutions.
```

Tu biografía actual dice *"Unity Developer | C# | Game Systems & Mechanics…"*, lo que contradice el enfoque backend del perfil. Cambiarla es una configuración de cuenta: hazlo tú en **Settings → Public profile**, o autoriza explícitamente que se haga con `gh api -X PATCH user -f bio="…"`.

**Otros campos sugeridos de la cuenta** (no aplicados): Nombre `Wilmer Flórez` (con tilde) · Ubicación `Pamplona, Norte de Santander, Colombia` · Foto de perfil `assets/avatar.png`.

## 4. Pendiente de confirmar por ti

- [ ] ¿Publicar el correo `wilmer.florez07011@gmail.com` en el README? (ya es público en tu perfil de GitHub). Alternativa: quitar el botón de correo.
- [ ] LinkedIn u otros enlaces: no se añadió ninguno porque no se pudo verificar la URL.
- [ ] Nivel de inglés: el README dice "ES · EN" sin indicar nivel.
- [ ] Tecnologías pendientes de la tabla anterior.
- [ ] Sección *Currently learning*: se dedujo de tus proyectos (arquitectura por capas, SQLAlchemy async/PostGIS, CI, OpenMP). Ajusta si no coincide.
- [ ] Que SIGAT aparezca como proyecto destacado (es público y tienes commits, pero es de un equipo).
