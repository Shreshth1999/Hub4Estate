#!/bin/bash

# Rollback UI/UX improvements to HomePage
# Run this script to restore the previous version before UI improvements

echo "🔄 Rolling back HomePage UI changes..."

BACKUP_FILE="frontend/src/pages/HomePage.tsx.backup"
TARGET_FILE="frontend/src/pages/HomePage.tsx"

if [ -f "$BACKUP_FILE" ]; then
    cp "$BACKUP_FILE" "$TARGET_FILE"
    echo "✅ Rollback complete! HomePage.tsx restored to previous version."
    echo ""
    echo "The frontend will auto-reload if the dev server is running."
    echo "If not, restart with: cd frontend && npm run dev"
else
    echo "❌ Backup file not found at: $BACKUP_FILE"
    echo "Cannot rollback - backup may have been deleted."
    exit 1
fi
