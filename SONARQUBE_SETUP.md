# SonarQube Integration Guide

## Overview
This project uses **SonarCloud** for continuous code quality analysis. SonarCloud automatically analyzes code quality, security vulnerabilities, code smells, and test coverage.

## Setup Instructions

### Option 1: Using SonarCloud (Recommended - FREE for Public Repos)

#### 1. Create SonarCloud Account
1. Go to [https://sonarcloud.io](https://sonarcloud.io)
2. Click **"Log in"** → **"With GitHub"**
3. Authorize SonarCloud to access your GitHub account

#### 2. Import Your Repository
1. Click **"+"** → **"Analyze new project"**
2. Select your organization: `huzaifa-fullstack`
3. Select repository: `huzaifakarim-mern-10pshine`
4. Click **"Set Up"**

#### 3. Choose Analysis Method
1. Select **"With GitHub Actions"**
2. Copy the **SONAR_TOKEN** provided
3. Add it to GitHub Secrets:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click **"New repository secret"**
   - Name: `SONAR_TOKEN`
   - Value: Paste the token from SonarCloud
   - Click **"Add secret"**

#### 4. Configure Project Key and Organization
The configuration is already set in `sonar-project.properties`:
```properties
sonar.projectKey=huzaifa-fullstack_huzaifakarim-mern-10pshine
sonar.organization=huzaifa-fullstack
```

#### 5. Trigger Analysis
Push code to GitHub:
```bash
git add .
git commit -m "feat: Add SonarQube integration"
git push origin feature/backend/sonarqube-integration
```

The GitHub Action will automatically run and send results to SonarCloud!

#### 6. View Results
1. Go to [https://sonarcloud.io](https://sonarcloud.io)
2. Select your project: `huzaifakarim-mern-10pshine`
3. View dashboard with:
   - **Bugs** - Code reliability issues
   - **Vulnerabilities** - Security issues
   - **Code Smells** - Maintainability issues
   - **Coverage** - Test coverage percentage
   - **Duplications** - Duplicate code blocks
   - **Security Hotspots** - Potential security risks

---

### Option 2: Local SonarQube (Alternative)

#### Prerequisites
- Java 17+ installed
- Docker (optional but easier)

#### Using Docker
```bash
# Pull and run SonarQube
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Wait for startup (check logs)
docker logs -f sonarqube
```

#### Install SonarScanner
```bash
# Install globally
npm install -g sonarqube-scanner

# Or use project dependencies (already added)
cd backend
npm install

cd ../frontend
npm install
```

#### Run Analysis Locally
```bash
# From project root
sonar-scanner \
  -Dsonar.projectKey=scribo-notes-app \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_SONAR_TOKEN
```

#### Access Dashboard
1. Open [http://localhost:9000](http://localhost:9000)
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. Change password when prompted
4. View your project analysis

---

## Running Tests with Coverage

### Backend
```bash
cd backend
npm run test:coverage
```
Coverage report generated in `backend/coverage/`

### Frontend
```bash
cd frontend
npm run test:coverage
```
Coverage report generated in `frontend/coverage/`

---

## Project Structure

```
.
├── sonar-project.properties      # Main SonarQube configuration
├── .github/
│   └── workflows/
│       └── sonarcloud.yml        # GitHub Actions for SonarCloud
├── backend/
│   ├── .nycrc                    # NYC (Istanbul) coverage config
│   ├── coverage/                 # Coverage reports (generated)
│   └── tests/                    # Unit tests
└── frontend/
    ├── vitest.config.ts          # Vitest configuration
    ├── coverage/                 # Coverage reports (generated)
    └── src/tests/                # Unit tests
```

---

## Quality Gates

Current quality gates configured:
- ✅ Code Coverage: >= 70%
- ✅ Maintainability Rating: A
- ✅ Reliability Rating: A
- ✅ Security Rating: A
- ✅ Duplicated Code: <= 3%
- ✅ Code Smells: <= 50

See `SONARQUBE_QUALITY_GATES.md` for details.

---

## Troubleshooting

### Issue: SonarScanner not found
**Solution:** Install globally or use npx
```bash
npm install -g sonarqube-scanner
# OR
npx sonarqube-scanner
```

### Issue: Coverage not showing
**Solution:** Ensure tests run before analysis
```bash
cd backend && npm run test:coverage
cd ../frontend && npm run test:coverage
# Then run sonar-scanner
```

### Issue: GitHub Action fails
**Solution:** Check SONAR_TOKEN is set in GitHub Secrets
- Repo → Settings → Secrets → Actions → SONAR_TOKEN

---

## Useful Links

- 🌐 **SonarCloud Dashboard**: [https://sonarcloud.io](https://sonarcloud.io)
- 📖 **SonarCloud Docs**: [https://docs.sonarcloud.io](https://docs.sonarcloud.io)
- 🔧 **SonarQube Rules**: [https://rules.sonarsource.com](https://rules.sonarsource.com)
- 💬 **Support**: [SonarCloud Community](https://community.sonarsource.com)

---

## Badge (Optional)

Add this to your main README.md to show SonarCloud status:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=huzaifa-fullstack_huzaifakarim-mern-10pshine&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=huzaifa-fullstack_huzaifakarim-mern-10pshine)

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=huzaifa-fullstack_huzaifakarim-mern-10pshine&metric=coverage)](https://sonarcloud.io/summary/new_code?id=huzaifa-fullstack_huzaifakarim-mern-10pshine)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=huzaifa-fullstack_huzaifakarim-mern-10pshine&metric=bugs)](https://sonarcloud.io/summary/new_code?id=huzaifa-fullstack_huzaifakarim-mern-10pshine)

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=huzaifa-fullstack_huzaifakarim-mern-10pshine&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=huzaifa-fullstack_huzaifakarim-mern-10pshine)
```
