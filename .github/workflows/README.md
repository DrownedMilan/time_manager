# DevSecOps CI — Sonar, Bandit & Trivy

This GitHub Actions workflow provides a complete **DevSecOps pipeline** for the project, combining **static code analysis**, **security scanning**, and **Docker image vulnerability checks**, with automated reporting to **Discord**.

---

## Overview

The workflow runs automatically on every push or pull request to the `main` or `dev` branches.  
It consists of two main jobs:

1. **Sonar & Bandit Scan**  
   - Runs Python tests and static security analysis using Bandit  
   - Uploads reports to GitHub and sends notifications to Discord  
   - Executes SonarCloud analysis for code quality and coverage

2. **Trivy Docker Image Scan**  
   - Builds Docker images for the backend and frontend  
   - Scans all project-related images (local and public) using Trivy  
   - Exports a consolidated JSON vulnerability report and sends it to Discord

---

## Workflow Structure

### Sonar & Bandit Job

**Steps:**
- Set up Python environment (3.11)
- Install dependencies from `backend/requirements.txt`
- Run unit tests using `pytest`
- Execute Bandit for Python code security checks
- Upload Bandit JSON report as an artifact
- Send Bandit report to Discord
- Run SonarCloud analysis (`SonarSource/sonarcloud-github-action@v2`)
- Send build status notification to Discord

**Outputs:**
- `bandit-report.json` uploaded as an artifact  
- Discord message containing build and security scan status

---

### Trivy Docker Scan Job

**Steps:**
- Check out repository and initialize Docker Buildx
- Build local images:
  - `time_manager-backend`
  - `time_manager-frontend`
- Run Trivy scans on:
  - `time_manager-backend`
  - `time_manager-frontend`
  - `postgres:17-bookworm`
  - `nginx:1.28.0-alpine3.21`
  - `quay.io/keycloak/keycloak:26.4.0`
- Generate a consolidated vulnerability report (`trivy-multi-report.json`)
- Upload the report as an artifact
- Send the report to Discord via webhook

**Outputs:**
- `trivy-multi-report.json` uploaded to GitHub  
- Discord message containing the Trivy report

---

## Secrets Used

| Secret | Purpose |
|--------|----------|
| `SONAR_TOKEN` | Authentication for SonarCloud analysis |
| `DISCORD_WEBHOOK_URL` | Discord webhook for automated notifications |

---

## Benefits

- Automated static analysis and vulnerability scanning  
- Continuous visibility of code quality and security issues  
- Real-time notifications to Discord  
- Easy integration with CI/CD pipelines  

---

## Optional Enhancements

To extend the pipeline’s coverage:
- Add **Safety** to check vulnerable Python dependencies:
  ```yaml
  - name: Run Safety
    working-directory: backend
    run: |
      pip install safety
      safety check -r requirements.txt --output text --full-report || true
