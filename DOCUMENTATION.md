# Aria Store

A full-stack fashion e-commerce web app. Customers can browse dresses, filter, search and sort, choose a size, keep a bag between visits, create an account, place an order and see their order history. An admin can add dresses with photos and delete them.

**Live demo:** https://nirunii.github.io/aria-store/
(The backend runs on a free host, so the first load can take about a minute.)

## Tech stack
React 18, Vite, React Router, Node.js, Express, PostgreSQL, JWT, bcrypt, multer

## Key features
- Category filtering, search and sorting
- Bag saved in the browser, so it survives a refresh
- Sign-up and login with JWT and hashed passwords
- Admin dashboard with photo uploads
- Orders saved in one database transaction, with row locking
- Prices, stock and sizes checked on the server, never trusted from the browser

## How it works
React frontend (`client/`) -> Express API (`server/`) -> PostgreSQL (`database/`)

## Run it locally
Needs Node.js 18+ and PostgreSQL.

1. Copy `server/.env.example` to `server/.env`, then set `DB_PASSWORD` and a long random `JWT_SECRET`.
2. From the main folder, run:

   npm run install-all
   npm run setup-db
   npm run server

3. In a second terminal, run `npm run client`.
4. Open http://localhost:5173

## Notes
Orders are pay-on-delivery. Payments are not built yet.
