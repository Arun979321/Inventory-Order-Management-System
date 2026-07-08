param(
    [ValidateSet("docker-hub", "vercel", "render", "vps", "all")]
    [string]$Target = "all",
    [string]$DockerHubUser = "arun979321",
    [string]$BackendTag = "latest",
    [string]$FrontendTag = "latest"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [$([char]0x2714)] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  [$([char]0x26A0)] $Message" -ForegroundColor Yellow
}

# ──────────────────────────────────────────────
# 1. DOCKER HUB — Build & push images
# ──────────────────────────────────────────────
function Push-DockerHub {
    Write-Step "Building & pushing Docker images to Docker Hub..."

    $backendImage = "${DockerHubUser}/inventory-management-backend:${BackendTag}"
    $frontendImage = "${DockerHubUser}/inventory-management-frontend:${FrontendTag}"

    Write-Host "  Backend  -> $backendImage"
    Write-Host "  Frontend -> $frontendImage"

    Write-Host "  Building backend image..."
    docker build -t $backendImage ./backend

    Write-Host "  Building frontend image..."
    docker build -t $frontendImage ./frontend

    Write-Host "  Pushing images to Docker Hub..."
    docker push $backendImage
    docker push $frontendImage

    Write-Success "Docker Hub images published."
    Write-Host "  Backend:  https://hub.docker.com/r/${DockerHubUser}/inventory-management-backend"
    Write-Host "  Frontend: https://hub.docker.com/r/${DockerHubUser}/inventory-management-frontend"
}

# ──────────────────────────────────────────────
# 2. VERCEL — Deploy frontend
# ──────────────────────────────────────────────
function Deploy-Vercel {
    Write-Step "Deploying frontend to Vercel..."

    if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
        Write-Warn "Vercel CLI not found. Install it with: npm i -g vercel"
        return
    }

    Push-Location frontend
    try {
        vercel --prod
        Write-Success "Frontend deployed to Vercel."
    }
    finally {
        Pop-Location
    }
}

# ──────────────────────────────────────────────
# 3. RENDER — Deploy backend (via Render CLI or manual steps)
# ──────────────────────────────────────────────
function Deploy-Render {
    Write-Step "Deploying backend to Render..."
    Write-Host @"

  ┌─ Render Manual Setup ─────────────────────────────────────────┐
  │                                                                │
  │  1. Go to https://dashboard.render.com                         │
  │  2. Click "New +" → "Web Service"                             │
  │  3. Connect your GitHub repo or use "Existing Docker Image"   │
  │     -> Image: ${DockerHubUser}/inventory-management-backend    │
  │  4. Set Environment Variables:                                │
  │     DATABASE_URL = postgresql://... (use Render PostgreSQL)    │
  │  5. Start Command: uvicorn main:app --host 0.0.0.0 --port 8000│
  │  6. Health Check Path: /health                                │
  │                                                                │
  │  Then create a Render PostgreSQL database and copy its URL     │
  │  into the DATABASE_URL env var.                                │
  │                                                                │
  └────────────────────────────────────────────────────────────────┘

"@
    Write-Host "  Backend API docs will be at: https://<your-app>.onrender.com/docs"
}

# ──────────────────────────────────────────────
# 4. VPS — Full stack via Docker Compose
# ──────────────────────────────────────────────
function Deploy-VPS {
    param([string]$VpsHost)

    if (-not $VpsHost) {
        Write-Warn "No VPS host provided. Skipping VPS deployment."
        Write-Host @"

  Usage example:
    .\deploy.ps1 -Target vps -VpsHost "user@your-server.com"

  Prerequisites on the VPS:
    - Docker & Docker Compose installed
    - Git installed

  What this does:
    1. SSH into the VPS
    2. Clone/pull the repo
    3. Run docker-compose up

  Manual steps:
    ssh $VpsHost
    git clone https://github.com/Arun979321/Inventory-Order-Management-System.git
    cd Inventory-Order-Management-System
    docker-compose up --build -d

"@
        return
    }

    Write-Step "Deploying full stack to VPS ($VpsHost)..."

    ssh $VpsHost @'
        set -e
        if [ -d "Inventory-Order-Management-System" ]; then
            cd Inventory-Order-Management-System
            git pull
        else
            git clone https://github.com/Arun979321/Inventory-Order-Management-System.git
            cd Inventory-Order-Management-System
        fi
        docker-compose up --build -d
        echo "Deployment complete!"
'@

    Write-Success "VPS deployment completed."
}

# ──────────────────────────────────────────────
# 5. SUMMARY — Print live URLs
# ──────────────────────────────────────────────
function Show-Summary {
    Write-Step "Deployment Summary"
    Write-Host @"

  ┌─ Service URLs ──────────────────────────────────────────┐
  │                                                          │
  │  Frontend (Vercel)  : https://<your-app>.vercel.app     │
  │  Backend  (Render)  : https://<your-app>.onrender.com   │
  │  API Docs           : https://<your-app>.onrender.com/docs│
  │  Docker Backend     : https://hub.docker.com/r/${DockerHubUser}/inventory-management-backend │
  │  Docker Frontend    : https://hub.docker.com/r/${DockerHubUser}/inventory-management-frontend │
  │  GitHub             : https://github.com/Arun979321/Inventory-Order-Management-System │
  │                                                          │
  └──────────────────────────────────────────────────────────┘

  ┌─ Environment Variables Needed ──────────────────────────┐
  │                                                          │
  │  Backend (.env):                                         │
  │    DATABASE_URL=postgresql://user:pass@host:5432/dbname  │
  │                                                          │
  │  Frontend (.env):                                        │
  │    REACT_APP_API_URL=https://<your-app>.onrender.com     │
  │                                                          │
  └──────────────────────────────────────────────────────────┘

"@
}

# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────
switch ($Target) {
    "docker-hub" { Push-DockerHub; Show-Summary }
    "vercel"     { Deploy-Vercel; Show-Summary }
    "render"     { Deploy-Render; Show-Summary }
    "vps"        { Deploy-VPS; Show-Summary }
    "all" {
        Push-DockerHub
        Deploy-Render
        Show-Summary
        Write-Host @"
Next steps:
  1. Run .\deploy.ps1 -Target vercel   (after setting REACT_APP_API_URL)
  2. Or .\deploy.ps1 -Target vps -VpsHost user@host
"@ -ForegroundColor Yellow
    }
}
