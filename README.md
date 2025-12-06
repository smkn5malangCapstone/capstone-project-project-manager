<p align="center">
  <a href="https://github.com/WisnuIbnu/project-manager">
    <h1 align="center" style="color: #4B47FF">CAPSTONE PROJECT</h1>
  </a>
</p>

## 📌 Project Manager — API Client

Repository ini berisi kumpulan fungsi **API Client** berbasis `axios` untuk berkomunikasi dengan backend aplikasi **Project Manager**.
Fitur mencakup **Authentication**, **User Profile**, **Workspace**, **Projects**, **Tasks**, serta **Role–Permission System**.

---

## 🚀 Tech Stack

| Teknologi      | Peran                                                      |
| -------------- | ---------------------------------------------------------- |
| **MongoDB**    | Penyimpanan data aplikasi                                  |
| **Express.js** | Backend REST API                                           |
| **React.js**   | Frontend aplikasi (dengan React Query untuk data fetching) |
| **Node.js**    | Runtime server                                             |
| **Axios**      | HTTP Client untuk komunikasi ke backend                    |
| **TypeScript** | Static typing untuk keamanan dan reliability               |

---

## 🔗 List API

1. **AUTH — Authentication**
   Mencakup:

   * Login, Register, & Logout dengan email
   * Login, Register, & Logout dengan akun Google

2. **USER PROFILE — Profil Pengguna**
   Mencakup:

   * Mendapatkan data user saat ini
   * Update nama user
   * Update password user

3. **WORKSPACE — Manajemen Workspace**
   Mencakup:

   * Membuat workspace
   * Update workspace
   * Mendapatkan seluruh workspace yang diikuti user
   * Mendapatkan detail workspace berdasarkan ID
   * Mendapatkan seluruh member dalam workspace
   * Mengubah role member workspace
   * Statistik & analytics workspace
   * Menghapus workspace --> Menghapus seluruh project dan task di project tersebut

4. **PROJECT — Manajemen Project**
   Mencakup:

   * Membuat project
   * Update project
   * Mendapatkan seluruh project dalam workspace
   * Mendapatkan project berdasarkan ID
   * Statistik & analytics project
   * Menghapus project --> Menghapus seluruh task di project tersebut

5. **TASK — Manajemen Task**
   Mencakup:

   * Membuat task
   * Edit task
   * Lihat task
   * Filtering berdasarkan keyword, priority, status, due date, assignedTo, project
   * Pagination task
   * Menghapus task

---

## DB Structure
![db structure](https://github.com/WisnuIbnu/project-manager/blob/main/frontend/public/images/mongoDB.png?raw=true)


---

## 🧩 Roles & Permissions

Sistem akses menggunakan **Role-Based Access Control (RBAC)** — setiap user di workspace memiliki role yang menentukan tindakan apa saja yang diperbolehkan.

---

### 👤 Daftar Role

```ts
export const Roles = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type RoleType = keyof typeof Roles;
```

| Role       | Hak Akses                                                            |
| ---------- | -------------------------------------------------------------------- |
| **OWNER**  | Akses penuh seluruh workspace, projek, member, dan task              |
| **ADMIN**  | Mengelola project & task                                             |
| **MEMBER** | Hanya mengelola task                                                 |

### 🔐 Daftar Permissions

```ts
export const Permissions = {
  CREATE_WORKSPACE: "CREATE_WORKSPACE",
  DELETE_WORKSPACE: "DELETE_WORKSPACE",
  EDIT_WORKSPACE: "EDIT_WORKSPACE",
  MANAGE_WORKSPACE_SETTINGS: "MANAGE_WORKSPACE_SETTINGS",

  ADD_MEMBER: "ADD_MEMBER",
  CHANGE_MEMBER_ROLE: "CHANGE_MEMBER_ROLE",
  REMOVE_MEMBER: "REMOVE_MEMBER",

  CREATE_PROJECT: "CREATE_PROJECT",
  EDIT_PROJECT: "EDIT_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",

  CREATE_TASK: "CREATE_TASK",
  EDIT_TASK: "EDIT_TASK",
  DELETE_TASK: "DELETE_TASK",

  VIEW_ONLY: "VIEW_ONLY",
} as const;
```

---
