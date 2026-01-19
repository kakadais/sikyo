# Deployment Guide (Manual Docker + Shared Mongo)

This guide documents how to deploy the application manually using Docker, connecting to a **Shared MongoDB Instance** to save server resources.

---

## 1. Prerequisites/Files

Ensure these files exist in your project root:
*   **`Dockerfile`**: Defines the build process (Meteor 3 build -> Node 20 runtime).
*   **`docker-compose.yml`**: Defines the App service.
*   **`.env`**: (On Server) Defines connection secrets.

---

## 2. Deploy Steps

### Step A: Prepare the Server (Shared Mongo)
**Prerequisite:** You must already have a MongoDB instance running on your server or elsewhere.
If you don't, you can run a single "Global" Mongo container on your server:
```bash
# Example running a shared mongo container on port 27017
docker run -d --name global-mongo -p 27017:27017 mongo:6.0 --replSet rs0 --bind_ip_all
```

### Step B: Transfer Files
Copy the project files to your server (exclude `node_modules`).
```bash
scp -r ./* user@<server-ip>:~/sikyo/
```

### Step C: Configure & Run

1.  **Set Environment Variables**
    Create a `.env` file on the server (inside `~/sikyo`).
    ```bash
    nano .env
    ```
    Content (Example):
    ```ini
    # --- APP SETTINGS ---
    ROOT_URL=http://<your-server-ip-or-domain>
    PORT=3000
    
    # --- SHARED MONGO CONNECTION ---
    # NOTE: If Mongo is on the SAME server but outside this docker-compose, use 'host.docker.internal' (if supported) 
    # OR use the server's private IP address (e.g., 172.17.0.1 is usually the docker host gateway).
    
    # Example 1: MongoDB Atlas (Cloud)
    # MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/sikyo?retryWrites=true&w=majority
    
    # Example 2: Self-hosted on same server (Host Gateway IP)
    MONGO_URL=mongodb://172.17.0.1:27017/sikyo
    MONGO_OPLOG_URL=mongodb://172.17.0.1:27017/local
    ```

2.  **Start Services**
    ```bash
    docker compose up -d --build
    ```

### Step D: Updating
```bash
docker compose up -d --build
```
This will rebuild the app image and restart the container, reconnecting to the same shared database.
