# HostGator deployment

The application is configured for HostGator cPanel's Phusion Passenger Application Manager and MySQL/MariaDB.

## Server configuration

- Application root: `/home2/obtaylor/06coins.com`
- Domain: `06coins.com`
- Startup file: `dist/index.js`
- Runtime: Node.js 22 or the newest Node.js version offered by Application Manager
- Database: cPanel MySQL database and restricted database user

Set these environment variables in Application Manager:

- `NODE_ENV=production`
- `DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/DATABASE`
- `SESSION_SECRET` with at least 32 random characters
- `CREDENTIAL_ENCRYPTION_KEY` with 64 hexadecimal characters
- `PUBLIC_BASE_URL=https://06coins.com`

Run `npm ci --omit=dev`, apply `deploy-migrations/0000_mysql_hostgator.sql`, and restart the Passenger application. The MySQL session table is created automatically.

## DNS and SSL

At GoDaddy, point the root `A` record to `192.185.63.172` and set `www` as a CNAME to `06coins.com`. After DNS propagation, run cPanel AutoSSL and enable Force HTTPS Redirect.

## Stripe

After HTTPS works, sign in at `/admin`, open **Settings → Payments**, and enter the live publishable key, secret key, and webhook signing secret. Create the Stripe webhook endpoint `https://06coins.com/api/webhooks/stripe` for `payment_intent.succeeded`.
