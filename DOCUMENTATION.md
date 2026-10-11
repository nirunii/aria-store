# Aria Store: Complete Guide

Aria is a full online dress shop. Customers can browse dresses, filter and search, choose a size, fill a bag, create an account, place an order and see their order history. An admin can add dresses with photos and delete them. This guide explains every file, how the parts connect, how to run it, and how to add pictures.

"Aria" is a placeholder brand name. Change it any time (see section 11).

---

## 1. The big picture

An online shop has three parts that talk to each other:

```
 BROWSER (React)  --->  SERVER (Express/Node)  --->  DATABASE (PostgreSQL)
 what people see        the "brain" and rules        where data is stored
 client/ folder         server/ folder               database/ folder
```

1. **Frontend (React, in `client/`)**: the pages people see and click. It never touches the database directly.
2. **Backend (Express on Node.js, in `server/`)**: receives requests from the frontend ("give me all dresses", "place this order"), applies the rules (is the user logged in? is the item in stock?), and talks to the database.
3. **Database (PostgreSQL, in `database/`)**: stores users, products, orders. The backend reads and writes it using SQL.

Example: when someone opens the Shop page, React sends `GET /api/products`. Express runs a SQL `SELECT` on PostgreSQL, gets the dresses, and returns them as JSON. React draws them as cards.

---

## 2. Technology used and why

| Tool | What it does here |
|---|---|
| React 18 + Vite | Builds the pages. Vite is the dev tool that runs the site fast on your computer. |
| React Router | Lets the site have many pages (/shop, /cart) without reloading. |
| Node.js + Express | The backend web server and API. |
| PostgreSQL + `pg` | The database, and the library that lets Node talk to it. |
| `bcryptjs` | Scrambles passwords before saving them, so real passwords are never stored. |
| `jsonwebtoken` (JWT) | Creates a login "ticket" (token) that proves who a user is. |
| `multer` | Receives uploaded dress photos and saves them to disk. |
| `cors`, `dotenv` | Allows the frontend to call the backend; loads secret settings from `.env`. |

---

## 3. Folder structure: what every file does

```
aria-store/
├── DOCUMENTATION.md          This guide
├── .gitignore                Files Git should never upload (secrets, node_modules)
├── package.json              Shortcut commands: install-all, setup-db, server, client
├── database/
│   └── schema.sql            Creates all the tables
├── server/                   BACKEND
│   ├── package.json          Lists backend libraries and the commands (npm run ...)
│   ├── .env.example          Template for your secret settings (copy to .env)
│   ├── uploads/              Uploaded dress photos are saved here
│   └── src/
│       ├── index.js          Starts the server and connects all routes
│       ├── config.js         Loads your .env file and stops with a clear message if it is missing
│       ├── db.js             The shared connection to PostgreSQL
│       ├── explain.js        Turns database errors into plain advice
│       ├── setup.js          One-time script: creates the database, tables, sample dresses, admin
│       ├── middleware/
│       │   └── auth.js       Checks login tokens (requireAuth, requireAdmin)
│       └── routes/
│           ├── auth.js       Register, log in, who am I
│           ├── products.js   List/search dresses, categories, add/delete (admin)
│           └── orders.js     Place an order, list my orders
└── client/                   FRONTEND
    ├── package.json          Lists frontend libraries and commands
    ├── vite.config.js        Dev server settings + forwards /api to the backend
    ├── index.html            The single HTML page React fills in; loads fonts
    ├── public/               Files served as-is (put hero.jpg here)
    └── src/
        ├── main.jsx          Starts React and wraps the app in providers
        ├── App.jsx           Defines which page shows at which URL
        ├── api.js            Helper that calls the backend; money() formatter
        ├── styles.css        All the styling (colours, layout, mobile)
        ├── context/
        │   ├── AuthContext.jsx   Remembers who is logged in
        │   └── CartContext.jsx   Remembers what is in the bag
        ├── components/
        │   ├── Navbar.jsx        Top menu on every page
        │   └── ProductCard.jsx   A dress card + the picture/placeholder component
        └── pages/
            ├── Home.jsx      Hero, occasions, new arrivals
            ├── Shop.jsx      All dresses with filters, search, sort
            ├── Product.jsx   One dress: choose size, add to bag
            ├── Cart.jsx      The bag: change quantity, remove, total
            ├── Login.jsx     Log in and create account
            ├── Checkout.jsx  Delivery details and place order
            ├── Orders.jsx    The customer's past orders
            └── Admin.jsx     Admin only: add dresses with photos, delete
```

---

## 4. The database (`database/schema.sql`)

Five tables. Each is like a spreadsheet; each row is one record.

- **users**: `id`, `name`, `email` (unique), `password_hash` (scrambled), `is_admin` (true for shop staff).
- **categories**: `id`, `name` (Evening), `slug` (evening, used in web addresses).
- **products**: `id`, `name`, `description`, `price`, `image_url`, `category_id` (links to categories), `sizes` (list like XS,S,M), `stock`.
- **orders**: `id`, `user_id` (who bought), `total`, `status` (pending), delivery name, address, phone.
- **order_items**: one row per dress in an order: `order_id`, `product_id`, `name`, `size`, `quantity`, `unit_price`.

Why `order_items` copies the name and price: if you later rename a dress or change its price, old orders must still show what the customer actually bought and paid.

Key SQL ideas used: `PRIMARY KEY` (unique id), `REFERENCES` (link to another table), `CHECK (price >= 0)` (stops bad data), `CREATE TABLE IF NOT EXISTS` (so running it twice is safe).

---

## 5. How to run it (step by step, Windows)

### 5.0 Unzip it correctly (this avoids the most common mistake)
1. Right-click `aria-store.zip`, choose **Extract All**, and extract it. You get **one** folder named `aria-store`.
2. Open it. You must see `client`, `server`, `database` and `DOCUMENTATION.md` **directly inside**. If you see another folder called `aria-store` inside it, you have a double folder. Move up one level and use the inner one.
3. Open VS Code, choose **File, Open Folder**, and pick that `aria-store` folder (the one that directly contains `client` and `server`).
4. Open a terminal inside VS Code: **Terminal, New Terminal**. It starts in the right folder. Always run the commands below from this terminal. Never keep two copies of the project.

### 5.1 Install the tools once
1. **Node.js** (LTS, version 18 or newer): https://nodejs.org. Check with `node -v`.
2. **PostgreSQL**: https://www.postgresql.org/download/. During install you set a password for the user `postgres`. Remember it. Keep the default port 5432.

### 5.2 Create your settings file
In the `server` folder, make a copy of `.env.example` named `.env`. In the VS Code terminal:
```
copy server\.env.example server\.env
```
Open `server\.env` and change **only** this line, using the PostgreSQL password you chose:
```
DB_PASSWORD=your-postgres-password-here
```
Rules: type the password exactly as it is. A password with `@` is fine here. No quotes and no spaces around `=`. (If the password contains a `#`, wrap it in quotes.) You should also change `JWT_SECRET` to any long random text. **Save the file with Ctrl+S.**

The database itself is created automatically in the next step, so you do not need pgAdmin for it.

### 5.3 Install the libraries (once)
From the main `aria-store` folder:
```
npm run install-all
```
This installs the backend and frontend libraries. It takes a minute or two.

### 5.4 Create the database, tables, sample dresses and the admin
```
npm run setup-db
```
Success looks like:
```
Database ready.
Admin login: admin@aria.test / admin12345
```
If it fails, read the message. It tells you in plain words what to fix (wrong password, PostgreSQL not running, missing `.env`).

### 5.5 Start the backend
```
npm run server
```
You should see `API running on http://localhost:5000` and `Database connected.` Leave this terminal open. Test it by opening http://localhost:5000/api/products in your browser. You should see the dresses as JSON.

### 5.6 Start the frontend
Click the **+** in the terminal panel to open a **second** terminal (it starts in the same folder), then run:
```
npm run client
```
Open http://localhost:5173. The shop is live.

### 5.7 Try everything
1. Browse Shop, filter by occasion, search, sort.
2. Open a dress, choose a size, Add to bag.
3. Log in, then "Create account", and register as a customer.
4. Check out, place the order, and see it under My orders.
5. Log out and log in as the admin (`admin@aria.test` / `admin12345`). An **Admin** link appears. Add a dress with a photo.

To use different admin details, change `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` **before** the first `npm run setup-db`.

---

## 6. How the pieces connect

**Frontend to backend.** In development, the frontend runs on port 5173 and the backend on 5000. In `client/vite.config.js`, the `proxy` setting forwards any request starting with `/api` or `/uploads` to port 5000. So the frontend just calls `/api/products` and it reaches Express. In `api.js`, every call goes through one function that adds the login token.

**Backend to database.** `server/src/db.js` creates a connection pool using the `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` settings from `.env`. Route files import it and call `pool.query('SQL here', [values])`. The `$1, $2` placeholders keep user input separate from the SQL, which blocks SQL injection attacks. Never build SQL by joining strings with user input.

**Login flow.**
1. User submits email and password to `POST /api/auth/login`.
2. Server finds the user, compares the password with `bcrypt.compare` against the stored scrambled version.
3. If it matches, server creates a JWT token containing the user id and admin flag, signed with `JWT_SECRET`, valid for 7 days.
4. Frontend saves the token in `localStorage` and sends it as `Authorization: Bearer <token>` on later requests.
5. `middleware/auth.js` verifies the token on protected routes. If it is missing or fake, the server answers 401.

**Order flow.** The bag lives in the browser (`CartContext`, saved to `localStorage`). On checkout, the browser sends only product ids, sizes and quantities. The server looks up the real prices from the database, checks stock, and saves everything inside a database **transaction** (`BEGIN ... COMMIT`): either the whole order is saved and stock reduced, or nothing is (`ROLLBACK`). This stops customers from editing prices in their browser and stops two people buying the last item.

---

## 7. API reference (backend endpoints)

| Method | URL | Who | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | Create account, returns token and user |
| POST | `/api/auth/login` | anyone | Log in, returns token and user |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/products` | anyone | List dresses. Options: `?category=evening&search=silk&sort=price_asc&limit=4` (sort: `new`, `price_asc`, `price_desc`) |
| GET | `/api/products/categories` | anyone | All categories |
| GET | `/api/products/:id` | anyone | One dress |
| POST | `/api/products` | admin | Add a dress (form data, optional `image` file) |
| DELETE | `/api/products/:id` | admin | Delete a dress and its photo file |
| POST | `/api/orders` | logged in | Place an order |
| GET | `/api/orders/mine` | logged in | My orders with their items |
| GET | `/api/health` | anyone | Simple "is the server alive" check |

---

## 8. What the code does, file by file

### Backend
- **`index.js`**: creates the Express app. `app.use(cors(...))` lets the frontend call it. `express.json()` reads JSON bodies. `express.static` makes the `uploads` folder viewable at `/uploads/...`. Each `app.use('/api/...', router)` attaches a route file. `app.listen` starts the server.
- **`config.js`**: finds and loads `server/.env` from an exact location, so it works from any folder. If the file is missing, it prints how to fix it.
- **`db.js`**: exports one `Pool` (a reusable set of database connections) built from the `DB_*` settings.
- **`explain.js`**: turns errors like a wrong password or a stopped database into plain advice.
- **`middleware/auth.js`**: `requireAuth` reads the token and sets `req.user`. `requireAdmin` runs `requireAuth` then checks `is_admin`. Add either one before a route handler to protect it.
- **`routes/auth.js`**: `register` hashes the password with bcrypt and inserts a user. If the email already exists, PostgreSQL error code `23505` is turned into a friendly message. `login` compares passwords. The user object sent back never includes the password hash.
- **`routes/products.js`**: the `GET /` handler builds its SQL step by step from the optional filters. The `sort` value is looked up in a fixed list, never pasted into SQL directly. `POST /` uses `upload.single('image')` from multer, which saves the file to `server/uploads` before your code runs, then stores `/uploads/<filename>` in the `image_url` column.
- **`routes/orders.js`**: described in section 6.
- **`setup.js`**: creates the database if it does not exist, reads `schema.sql` and runs it, inserts categories and six sample dresses (only if there are no products), and creates the admin user (only if that email does not exist yet).

### Frontend
- **`main.jsx`**: renders `<App />` inside `BrowserRouter` (page routing), `AuthProvider` (login state) and `CartProvider` (bag state), so any component can use them.
- **`App.jsx`**: the list of routes. `Protected` redirects to login if you are not logged in, and away from Admin if you are not an admin. Note that this only hides pages for convenience. The real protection is on the server.
- **`context/AuthContext.jsx`**: holds `user`, and the functions `login`, `register`, `logout`. Components read them with `useAuth()`.
- **`context/CartContext.jsx`**: holds `items` and functions `add`, `setQty`, `remove`, `clear`, plus `count` and `total`. Read with `useCart()`. A `useEffect` copies the bag into `localStorage` whenever it changes.
- **`api.js`**: `api(path, options)` wraps `fetch`: adds the token, sends JSON (or form data for uploads), and throws an error with the server's message if something fails. `money()` formats prices.
- **Pages**: each page uses `useState` for its data and `useEffect` to fetch it when the page opens. Shop keeps its filters in the URL (`/shop?category=evening`), so links can be shared and the back button works.
- **`styles.css`**: colours are CSS variables at the top (`--lav`, `--ink`, `--coral`). One media query near the bottom handles phones.

---

## 9. How to add pictures

There are three kinds of pictures.

**A. Dress photos (recommended): through Admin.** Log in as admin, open Admin, fill the form, choose a photo in the "Photo" field, click Add dress. The browser sends the file to the server, multer saves it into `server/uploads/`, and the database stores its path. Use JPG or WebP, portrait shape (3:4), under 5 MB. The cards crop to 3:4 automatically.

**B. Dress photos: by web link.** Edit the `image_url` column of a product in pgAdmin to a full link such as `https://example.com/dress.jpg`. Works with any image host.

**C. The home page hero picture.** Save a cut-out or portrait photo as `client/public/hero.jpg`. It fills the arch shape in the middle of the big ARIA word. If the file does not exist, a lavender arch shows instead. For the "model in front of the wordmark" look, use a photo with the background removed (PNG works too: change `hero.jpg` to `hero.png` in `styles.css`).

Where do uploaded pictures live? In `server/uploads/`. **Back this folder up**, and note that many hosting services wipe the disk on each deploy. For a live shop, use cloud storage such as Cloudinary or Amazon S3 (see section 12).

---

## 10. Security notes (what is already done)

- Passwords are hashed with bcrypt. Never stored as plain text.
- All SQL uses placeholders (`$1`), preventing SQL injection.
- Prices and stock are checked on the server, not trusted from the browser.
- Admin routes are protected by `requireAdmin` on the server.
- Uploads accept images only and are limited to 5 MB.
- `.env` is in `.gitignore`, so your secrets are not uploaded to Git.

Still to do before going live: use HTTPS, rate-limit login attempts, and use a strong `JWT_SECRET`.

---

## 11. Common changes

- **Brand name**: replace `ARIA` in `Navbar.jsx`, `App.jsx` (footer), `Home.jsx`/`styles.css` (the big hero word is in `Home.jsx`), and the `<title>` in `index.html`.
- **Currency**: edit the `money` function in `client/src/api.js` (for example `'Rs ' + Number(n).toFixed(2)`).
- **Colours**: edit the variables at the top of `styles.css`.
- **Categories**: add rows to the `categories` table in pgAdmin, or edit the list at the top of `setup.js` before first running it.
- **Sizes**: each product has a `sizes` list in the database (default XS to XL). Edit it in pgAdmin for a specific dress.
- **Order status** (pending, shipped...): change the `status` column in pgAdmin for now. An admin orders screen is listed below as a next step.

---

## 12. Next steps for a real launch

1. **Payments**: add Stripe Checkout (cards) or PayHere (popular in Sri Lanka). The order is currently pay-on-delivery.
2. **Admin orders screen**: list all orders and change status; email customers.
3. **Edit products**: add a PUT route and edit form.
4. **Cloud image storage**: Cloudinary or S3 instead of the local `uploads` folder.
5. **Email**: order confirmations with a service like Resend or SendGrid.
6. **Deploy**: frontend to Vercel or Netlify (`npm run build` makes the `client/dist` folder); backend to Render, Railway or a VPS; database to Neon, Supabase or Railway Postgres. After deploying, set `CLIENT_URL` on the backend to your real site address, and make the frontend call the real backend address instead of the dev proxy.
7. **Wishlist, reviews, discount codes, product images gallery**.

---

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| `PostgreSQL rejected the password` | `DB_PASSWORD` in `server/.env` is wrong, or you forgot to save the file (Ctrl+S). Use the password you set when installing PostgreSQL. |
| `Missing file ... .env` | You have not created `server/.env`. See 5.2. |
| `Cannot reach PostgreSQL` / `ECONNREFUSED` | PostgreSQL is not running. Start the PostgreSQL service (Start menu, Services). |
| `Cannot find module` | Libraries are not installed. Run `npm run install-all` from the main `aria-store` folder. |
| Edits seem ignored / same error again | You probably have two copies of the project (a double `aria-store` folder). Use one copy only, open that folder in VS Code and run commands from its terminal. |
| Shop shows "No dresses yet" | Run `npm run setup-db` in `server/`, and make sure the backend is running. |
| Browser shows network errors | Backend not running, or not on port 5000. |
| `jwt secret` error / login fails | `JWT_SECRET` is missing in `.env`. Restart the backend after editing `.env`. |
| Photo upload does nothing | You are not logged in as admin, or the file is not an image / over 5 MB. |
| Photos disappear after deploy | The host wipes local files. Use cloud storage (section 12). |
| Changes to `.env` ignored | Stop and restart `npm run dev`. |

---

## 14. Commands cheat sheet

```
# From the main aria-store folder
npm run install-all   install backend + frontend libraries (once)
npm run setup-db      create database, tables, sample dresses, admin (once)
npm run server        start the backend (http://localhost:5000)
npm run client        start the website (http://localhost:5173)

# Making the production website (inside client/)
npm run build         creates client/dist
```

---

## 15. Putting the shop online (GitHub + GitHub Pages + free hosting)

**Important:** GitHub Pages can only host static files, so it hosts the **frontend only**. A working shop online needs three pieces:

| Part | Where | Free options (check current limits) |
|---|---|---|
| Frontend (`client/`) | GitHub Pages | GitHub |
| Backend (`server/`) | Node host | Render, Railway |
| Database | Hosted PostgreSQL | Neon, Supabase, Render Postgres |

The project already contains the changes needed for this: `HashRouter` (so page links work on Pages), the `VITE_BASE` and `VITE_API_URL` settings, hosted-database support through `DATABASE_URL`, and the workflow file `.github/workflows/deploy.yml`.

### 15.1 Push the code to GitHub
1. Install **Git**: https://git-scm.com/download/win. Create a free account at https://github.com.
2. On github.com click **+**, **New repository**. Name it (for example `aria-store`), keep it **Public** (free Pages needs public on most plans), and do NOT add a README. Click **Create repository**.
3. In the VS Code terminal, inside the main `aria-store` folder:
```
git init
git add .
git commit -m "Aria store"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/aria-store.git
git push -u origin main
```
`.gitignore` already blocks `server/.env` (your secrets) and `node_modules`. Check on GitHub that **no `.env` file** was uploaded. If Git asks you to log in, use the browser sign-in window.

### 15.2 Create the hosted database
1. Create a free PostgreSQL database at https://neon.tech (or Supabase / Render).
2. Copy its **connection string**. It looks like `postgresql://user:password@host/dbname`.
3. Choose a **strong admin password** first. In `server/.env` set `ADMIN_PASSWORD=` to something private. The default `admin12345` must never be used on a public site.
4. Temporarily add this line to `server/.env`, using your connection string:
```
DATABASE_URL=postgresql://user:password@host/dbname
```
5. Run `npm run setup-db`. It creates the tables, sample dresses and the admin account in the hosted database.
6. Delete or comment out (`#`) that `DATABASE_URL` line again so your local work uses your local database.

### 15.3 Host the backend (Render example)
1. Sign in at https://render.com with GitHub. Click **New**, **Web Service**, and pick your repository.
2. Settings: **Root Directory** `server`, **Build Command** `npm install`, **Start Command** `npm start`.
3. Under **Environment**, add:
   - `DATABASE_URL` = your connection string
   - `JWT_SECRET` = a long random text
   - `CLIENT_URL` = `https://YOUR-USERNAME.github.io` (no slash at the end, no repository name)
4. Deploy. Render gives you an address like `https://aria-api.onrender.com`. Open `https://aria-api.onrender.com/api/products`. You should see the dresses.

Free hosts may "sleep" when unused, so the first visit can take about a minute to wake up.

### 15.4 Publish the frontend on GitHub Pages
1. On GitHub open your repository: **Settings, Pages**. Under **Source** choose **GitHub Actions**.
2. Go to **Settings, Secrets and variables, Actions, Variables tab, New repository variable**. Name: `VITE_API_URL`. Value: your backend address, for example `https://aria-api.onrender.com` (no slash at the end).
3. Go to the **Actions** tab, open **Deploy frontend to GitHub Pages**, and click **Run workflow** (it also runs on every push to `main`). Wait for the green tick.
4. Your live link is `https://YOUR-USERNAME.github.io/aria-store/`.

To update the site later: change code, then `git add .`, `git commit -m "message"`, `git push`.

### 15.5 Things to know
- **Uploaded photos:** free backends erase local files when they restart, so photos uploaded through Admin will disappear. For a live shop, paste permanent image links into the `image_url` field (pgAdmin or the hosted database's dashboard), or ask for Cloudinary storage to be added.
- **Links look like `/#/shop`:** that is normal. It makes page links work on GitHub Pages.
- **Login or products fail on the live site:** check that `VITE_API_URL` is set and has no slash at the end, that `CLIENT_URL` on the backend is exactly `https://YOUR-USERNAME.github.io`, and re-run the workflow after changing the variable.
- **Real customers:** add HTTPS-only payment (Stripe/PayHere) and a proper domain before taking real orders.
