<div align="center">

<img src="public/images/mediflow-logo.png" alt="MediFlow" width="140" />

# MediFlow Frontend

**The admin console for a multi-tenant healthcare platform.**
Manage tenants, roles, permissions and master data from one clean, fast interface.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![Formik](https://img.shields.io/badge/Formik-2.4-2563eb)
![React Compiler](https://img.shields.io/badge/React%20Compiler-enabled-087ea4)

</div>

---

## Highlights

- **Multi-tenant by design** – every tenant gets its own branded login at `/<tenant-slug>/login`.
- **Tenant management** – create, edit and activate/deactivate tenants and assign plans. The slug is locked after creation.
- **Roles** – tenant-filtered list, add/edit drawer, status switch and pagination.
- **Permissions** – scope filter and badges, add/edit drawer, delete with confirmation modal.
- **Role ↔ permission mapping** – assign permissions to a role from a dedicated drawer.
- **Master codes** – browse the platform's lookup/reference data.
- **Secure session handling** – route guard on every `/admin` page, JWT expiry detection, automatic sign-out with a "session expired" notice, and a "Remember me" option (local vs. session storage).
- **Zero-dependency API client** – a small `fetch` wrapper with interceptors, timeouts, query-param building and a typed `ApiError`.

## Tech stack

| Area        | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | [Next.js 16](https://nextjs.org) (App Router)      |
| UI          | React 19 + React Compiler                          |
| Styling     | Bootstrap 5 + React-Bootstrap, React Icons         |
| Forms       | Formik + Yup                                       |
| Dates       | date-fns                                           |
| Linting     | ESLint 9 with `eslint-config-next`                 |

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A running MediFlow backend (a FastAPI service)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure the environment
#    create .env.local in the project root (see below)

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/login`.

### Environment variables

| Variable                   | Description                                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the MediFlow backend, e.g. `http://127.0.0.1:8000`. Falls back to the hosted backend if unset. |

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Scripts

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Create a production build        |
| `npm start`     | Serve the production build       |
| `npm run lint`  | Run ESLint                       |

## Routes

| Route                    | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `/login`                 | Generic sign-in                          |
| `/[tenant]/login`        | Tenant-branded sign-in                   |
| `/admin/dashboard`       | Admin landing page                       |
| `/admin/tenants`         | Tenant management                        |
| `/admin/master-codes`    | Master code browser                      |
| `/admin/roles`           | Role management                          |
| `/admin/permissions`     | Permission management                    |

All `/admin/*` routes are protected by a client-side guard (`src/app/admin/layout.js`).

## Project structure

```
src/
├── api/                  # Backend access, one folder per domain
│   ├── global/           #   apiHelper (fetch client), tokenStorage, useApi
│   ├── auth/             #   login, current user, session expiry
│   ├── tenant/           #   tenants CRUD + status
│   ├── role/             #   roles CRUD, status, role-permission mapping
│   ├── permission/       #   permissions CRUD
│   └── masterCode/       #   master codes
├── app/                  # Next.js App Router pages and layouts
│   ├── [tenant]/login/
│   ├── admin/            #   dashboard, tenants, roles, permissions, master-codes
│   └── login/
├── components/           # Shell (Header, Sidebar, Footer), drawers, modals, toasts, pagination
├── const/                # Navigation config that drives the sidebar and breadcrumbs
└── hooks/                # Reusable hooks (e.g. login)
```

## How it works

**Authentication.** On login the access token and tenant slug are stored in `localStorage` (Remember me) or `sessionStorage`. `apiHelper` reads the token on every request and attaches it automatically. A 401 triggers the unauthorized handler, which clears the session and redirects to the login page.

**API client.** `src/api/global/apiHelper.js` exposes `api.get/post/put/patch/delete`, request/response interceptors, a 15 s default timeout and normalised errors (`HTTP_ERROR`, `NETWORK_ERROR`, `TIMEOUT`, `ABORTED`). FastAPI `detail` messages are surfaced as readable error text.

```js
import api from "@/api/global/apiHelper";

const tenants = await api.get("/tenants/", { params: { skip: 0, limit: 10 } });
```

**Navigation.** Add a page to the sidebar and breadcrumb by adding an entry to `NAV_SECTIONS` in `src/const/navigation.js`.

## Deployment

The app deploys like any Next.js project (Vercel, Docker, or `npm run build && npm start`). Set `NEXT_PUBLIC_API_BASE_URL` in your hosting environment before building, since it is inlined at build time.

## License

Released under the [MIT License](LICENSE).

## Contributing

1. Create a feature branch from `main`.
2. Keep changes focused and run `npm run lint` before committing.
3. Open a pull request with a short description of what changed and why.
