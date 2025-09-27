# Multi-Tenant SaaS Notes Application

A fully functional multi-tenant notes application built with Next.js, Prisma, and PostgreSQL, deployed on Vercel.

---

## 🚀 Live Application

**URL:** `https://saas-notes-app-blue.vercel.app/`

---

## ✨ Core Features

* **Multi-Tenancy:** Complete data isolation between different companies (tenants).
* **Authentication:** Secure JWT-based login system.
* **Role-Based Access:** Separate permissions for 'Admin' and 'Member' roles.
* **Subscription Plans:** 'Free' tier with a 3-note limit and a 'Pro' tier with unlimited notes.
* **Full CRUD API:** Secure endpoints to create, read, update, and delete notes.

---

## 🧪 How to Test the Application

The password for all test accounts is **`password`**.

### 🏢 Tenant 1: Acme
* **Plan:** FREE
* **Limitation:** Can only create a maximum of 3 notes.
* **Test Accounts:**
    * `admin@acme.test` (Role: Admin)
    * `user@acme.test` (Role: Member)

### 🏢 Tenant 2: Globex
* **Plan:** FREE
* **Limitation:** Can only create a maximum of 3 notes.
* **Test Accounts:**
    * `admin@globex.test` (Role: Admin)
    * `user@globex.test` (Role: Member)

### 🏢 Tenant 3: Stark Industries
* **Plan:** PRO
* **Limitation:** Can create **unlimited** notes.
* **Test Accounts:**
    * `tony@stark.test` (Role: Admin)
    * `pepper@stark.test` (Role: Member)

---

## 💳 How to Upgrade a Tenant from FREE to PRO

The UI does not have an upgrade button. The plan can be upgraded by an **Admin** using an API tool like Postman.

1.  **Get Admin Token:** First, log in as an Admin of a FREE tenant (e.g., `admin@acme.test`) using the `POST /api/auth/login` endpoint to get a JWT.
2.  **Send Upgrade Request:** Use that Admin token to send a `POST` request to the following endpoint, replacing `{slug}` with the company's slug (e.g., `acme`):
    `POST /api/tenants/{slug}/upgrade`

---

## 🛠️ Technical Approach for Multi-Tenancy

This application uses a **Shared Schema with a Tenant ID** approach.
* All data for all tenants is stored in the same database tables.
* Data isolation is enforced by adding a `tenantId` column to critical tables like `User` and `Note`.
* Every database query is filtered by the `tenantId` of the currently logged-in user to ensure a tenant can never access another tenant's data.
