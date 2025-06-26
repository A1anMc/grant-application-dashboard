# Grant IQ Pro Edition - Node.js Deployment

This project uses render.yaml for deployment configuration.
No Docker files are present - this forces Render to use native Node.js deployment.

## Deployment Configuration:
- Backend: Native Node.js web service
- Frontend: Static site deployment
- Build: npm install + npm run build
- No Docker, Python, or complex dependencies

Render will automatically detect render.yaml and deploy accordingly.
