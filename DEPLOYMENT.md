# Deploying iMiklomelo kaDakamela Cultural Festival to DigitalOcean

## Prerequisites

- [DigitalOcean account](https://cloud.digitalocean.com)
- [doctl CLI](https://docs.digitalocean.com/reference/doctl/how-to/install/) (optional, for CLI deployment)
- Git repository pushed to GitHub/GitLab

---

## 1. Create a Managed PostgreSQL Database

1. Go to **Databases** → **Create Database Cluster**
2. Choose **PostgreSQL 16**, select a region (e.g. `nyc3`)
3. Pick the **Basic** plan ($15/mo) for starting out
4. Once created, copy the **Connection String** (use the "Public Network" one for now)
5. Run database migrations:
   ```bash
   DATABASE_URL="your-connection-string" npx drizzle-kit push
   ```

## 2. Create a DigitalOcean Space (Object Storage)

1. Go to **Spaces Object Storage** → **Create a Space**
2. Choose a region (e.g. `nyc3`), give it a name like `imiklomelo-uploads`
3. **Enable CDN** for faster global delivery
4. Go to **API** → **Spaces Keys** → **Generate New Key**
5. Save the **Key** and **Secret** — you'll need them for `DO_SPACES_KEY` and `DO_SPACES_SECRET`
6. Set CORS on the Space:
   - **Origin**: `*` (or your domain)
   - **Allowed Methods**: `GET`, `PUT`
   - **Allowed Headers**: `*`
   - **Max Age**: `3600`

## 3. Deploy via App Platform

### Option A: From the Dashboard

1. Go to **App Platform** → **Create App**
2. Connect your GitHub/GitLab repo
3. It will auto-detect the `Dockerfile`
4. Set the **HTTP Port** to `5000`
5. Add all environment variables from `.env.example` under **Environment Variables**
6. Deploy!

### Option B: Using doctl CLI

```bash
doctl apps create --spec .do/app.yaml
```

### Option C: Deploy to a Droplet (manual)

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Clone repo
git clone https://github.com/your-user/imiklomelo-ka-dakamela.git
cd imiklomelo-ka-dakamela

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install deps and build
npm ci
npm run build

# Create .env file with your variables
cp .env.example .env
nano .env  # fill in all values

# Run database migrations
npx drizzle-kit push

# Start with PM2 (process manager)
npm install -g pm2
pm2 start dist/index.cjs --name imiklomelo
pm2 save
pm2 startup
```

## 4. Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `APP_URL` | ✅ | Public URL (e.g. `https://imiklomelo.co.zw`) |
| `ADMIN_SECRET_KEY` | ✅ | Secret for admin API access (sent via `x-admin-key` header) |
| `SESSION_SECRET` | ✅ | Random string for session encryption |
| `PAYNOW_INTEGRATION_ID` | ✅ | Paynow payment gateway ID |
| `PAYNOW_INTEGRATION_KEY` | ✅ | Paynow payment gateway key |
| `RESEND_API_KEY` | ✅ | Resend.com API key for transactional emails |
| `RESEND_FROM_EMAIL` | ⬚ | Sender email (default: `noreply@resend.dev`) |
| `DO_SPACES_KEY` | ✅ | DigitalOcean Spaces access key |
| `DO_SPACES_SECRET` | ✅ | DigitalOcean Spaces secret key |
| `DO_SPACES_BUCKET` | ✅ | Space/bucket name |
| `DO_SPACES_REGION` | ⬚ | Region (default: `nyc3`) |
| `DO_SPACES_ENDPOINT` | ⬚ | Custom endpoint URL |
| `DO_SPACES_CDN_ENDPOINT` | ⬚ | CDN endpoint URL for faster delivery |
| `PORT` | ⬚ | Server port (default: `5000`) |
| `NODE_ENV` | ⬚ | `production` or `development` |

## 5. Post-Deployment

1. **Set up a custom domain** in App Platform or configure Nginx on your Droplet
2. **Run database migrations**: `DATABASE_URL="..." npx drizzle-kit push`
3. **Seed initial data** (happens automatically on first startup)
4. **Test admin access**: Send requests with `x-admin-key: YOUR_ADMIN_SECRET_KEY` header
5. **Enable CDN** on your DO Space for media delivery performance

## 6. Livestreaming Setup

The app supports embedding any livestream URL. To go live:

1. Set up a streaming service (YouTube Live, Vimeo, or self-hosted with OBS + nginx-rtmp)
2. Go to the admin panel → Stream Settings
3. Paste your embed URL (e.g. `https://www.youtube.com/embed/LIVE_ID`)
4. Set the price, toggle "Stream is Live"
5. Users can purchase access and watch via the `/live-stream` page
