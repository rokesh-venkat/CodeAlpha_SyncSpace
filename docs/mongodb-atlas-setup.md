# MongoDB Atlas Setup Guide — SyncSpace

This guide walks you through creating a free MongoDB Atlas cluster and connecting it to SyncSpace.

---

## Step 1 — Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"**
3. Fill in your name, email, and password
4. Verify your email address

```text
[Screenshot Placeholder: MongoDB Atlas homepage with "Try Free" button]
```

---

## Step 2 — Create a Free Cluster

1. After login, click **"Build a Database"**
2. Select **"M0 Free"** tier (the free forever option)
3. Choose a **Cloud Provider** — any of AWS, Google Cloud, or Azure works

```text
[Screenshot Placeholder: Cluster tier selection showing M0 Free highlighted]
```

---

## Step 3 — Choose a Region

1. Select the region **closest to you** for best latency
   - India → `Mumbai (ap-south-1)` or `Singapore`
   - US → `Virginia (us-east-1)`
   - Europe → `Ireland (eu-west-1)`
2. Leave the cluster name as `Cluster0` or rename it to `syncspace`
3. Click **"Create"**

```text
[Screenshot Placeholder: Region selector map with recommended regions highlighted]
```

---

## Step 4 — Create a Database User

After cluster creation, Atlas will prompt you to create a user.

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** as the authentication method
4. Enter a username, e.g. `syncspace_user`
5. Click **"Autogenerate Secure Password"** — copy this password immediately
6. Under **"Database User Privileges"**, select **"Read and write to any database"**
7. Click **"Add User"**

```text
[Screenshot Placeholder: Add New Database User form with fields filled in]
```

> ⚠️ Save your password now — Atlas will not show it again.

---

## Step 5 — Configure Network Access (IP Whitelist)

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** → this sets `0.0.0.0/0`
4. Click **"Confirm"**

```text
[Screenshot Placeholder: Network Access page showing "Add IP Address" modal]
```

> ⚠️ For production, restrict this to your server's specific IP address.

---

## Step 6 — Get Your Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** next to your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js**, **Version: 5.5 or later**
5. Copy the connection string shown

```text
[Screenshot Placeholder: Connect modal showing the connection string]
```

It will look like this:

```
mongodb+srv://syncspace_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## Step 7 — Configure Your .env File

Open `server/.env` and set your `MONGO_URI`:

```env
MONGO_URI=mongodb+srv://syncspace_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/syncspace?retryWrites=true&w=majority
```

Replace the following:
- `syncspace_user` → your database username
- `YOUR_PASSWORD` → the password you generated in Step 4
- `cluster0.xxxxx` → your actual cluster address from the connection string
- `syncspace` → your database name (Atlas creates it automatically on first write)

---

## Step 8 — Test the Connection

Start your server:

```bash
cd server
npm run dev
```

Expected terminal output:

```bash
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Authentication failed` | Wrong username or password in URI | Re-check `.env` credentials |
| `Connection timed out` | IP not whitelisted | Add `0.0.0.0/0` in Network Access |
| `ENOTFOUND` | Wrong cluster address in URI | Copy the URI again from Atlas Connect |
| `MongoParseError` | Special characters in password | URL-encode special chars or regenerate password |
| `querySrv ENODATA` | DNS issue | Try adding `&ssl=true` to URI or use direct connection string |

---

## Security Checklist Before Production

- [ ] Restrict Network Access IP whitelist to your server IP
- [ ] Use a strong, randomly generated JWT_SECRET (32+ characters)
- [ ] Never commit `.env` to Git — confirm `.gitignore` includes it
- [ ] Enable MongoDB Atlas alerts for unusual activity
- [ ] Rotate database user password before going live