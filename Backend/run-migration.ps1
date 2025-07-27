# PowerShell script to run Prisma migration
Write-Host "Running Prisma migration..." -ForegroundColor Green

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Run migration
Write-Host "Running migration..." -ForegroundColor Yellow
npx prisma migrate dev --name add_caption_model

Write-Host "Migration completed!" -ForegroundColor Green 