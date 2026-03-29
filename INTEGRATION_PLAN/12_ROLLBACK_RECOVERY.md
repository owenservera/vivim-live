# Rollback & Recovery Plan

## Emergency Recovery Procedures

---

## When to Use This Guide

Use this guide if:
- ❌ Server won't start after migration
- ❌ Database migrations fail
- ❌ Tests are failing unexpectedly
- ❌ Data corruption suspected
- ❌ Performance degraded significantly
- ❌ Can't identify the problem

---

## Level 1: Quick Rollback (Code Only)

### Scenario
Code changes cause runtime errors but database is fine.

### Steps
```bash
# 1. Check git status
git status

# 2. See what changed
git diff --stat

# 3. Revert last commit (if that's the problem)
git revert HEAD

# 4. Or revert to a specific checkpoint
git checkout integration/ai-chatbot-memory~1 -- .

# 5. Restart server
bun run dev
```

### Recovery Time: ~5 minutes

---

## Level 2: Database Rollback

### Scenario
Migrations caused issues but code is fine.

### Steps
```bash
# 1. Check migration status
cd packages/backend
bunx prisma migrate status

# 2. Rollback last migration
bunx prisma migrate rollback

# 3. If rollback fails, manually rollback
psql -d vivim_db -c "DROP TABLE IF EXISTS context_bundles CASCADE;"
psql -d vivim_db -c "DROP TABLE IF EXISTS memory_profiles CASCADE;"
psql -d vivim_db -c "DROP TABLE IF EXISTS atomic_chat_units CASCADE;"
psql -d vivim_db -c "DROP TABLE IF EXISTS virtual_users CASCADE;"

# 4. Mark migration as not applied
bunx prisma migrate resolve --rolled-back "migration_name"

# 5. Restart server
bun run dev
```

### Recovery Time: ~15 minutes

---

## Level 3: Full System Restore

### Scenario
Everything is broken - need to restore from backup.

### Prerequisites
- Backup created from Pre-flight Checklist
- Database dump available

### Steps
```bash
# 1. STOP THE SERVER
pkill -f "bun run dev"
# or Ctrl+C in terminal

# 2. Restore code from backup
cd C:\0-BlackBoxProject-0\vivim-versions
rm -rf version-2days-ago
cp -r version-2days-ago-BACKUP-20240329 version-2days-ago

# 3. Restore database
psql -d vivim_db -c "DROP DATABASE IF EXISTS vivim_db;"
psql -c "CREATE DATABASE vivim_db;"
psql -d vivim_db < vivim_backup_20240329.sql

# 4. Verify restore
bunx prisma generate
bun run dev

# 5. Check health
curl http://localhost:3001/api/health
```

### Recovery Time: ~30-60 minutes

---

## Level 4: Component Isolation

### Scenario
One specific system (e.g., Memory) is broken but others work.

### Steps
```bash
# 1. Disable the broken system via feature flags
# Edit .env.local
FEATURE_MEMORY_SYSTEM=false

# 2. Restart server
bun run dev

# 3. The system should now work without the broken component

# 4. Debug the specific issue
# See TROUBLESHOOTING.md for component-specific fixes
```

### Feature Flags to Toggle
```env
# Disable specific systems
FEATURE_VIRTUAL_USERS=false      # User ID system
FEATURE_CONTEXT_ENGINE=false    # Context engine
FEATURE_MEMORY_SYSTEM=false     # Memory system
FEATURE_AI_STREAMING=false       # AI chat
FEATURE_CHAT_WIDGET=false       # Frontend chat
```

### Recovery Time: ~5 minutes

---

## Emergency Contacts & Escalation

### If You Can't Resolve:

| Issue | Contact/Action |
|-------|----------------|
| Database | Check `09_DATABASE_MIGRATIONS.md` |
| AI Providers | Verify API keys in `.env.local` |
| WebSocket | Check CORS in `server.js` |
| Types | Run `bun run typecheck` |
| Tests | Check `07_PHASE_7_TESTING.md` |

---

## Checkpoint Strategy

### Create Checkpoints After Each:
- ✅ Successful phase completion
- ✅ Working database migration
- ✅ Passing test suite
- ✅ Successful build

### Checkpoint Commands
```bash
# After Phase 1
git tag -a phase1-complete -m "Phase 1 Foundation complete"
git push origin phase1-complete

# After Phase 2
git tag -a phase2-complete -m "Phase 2 User ID complete"
git push origin phase2-complete

# And so on...
```

### Restore to Checkpoint
```bash
# List checkpoints
git tag -l "phase*-complete"

# Restore to specific checkpoint
git checkout phase3-complete

# Or create branch from checkpoint
git checkout -b fix-phase3 phase3-complete
```

---

## Data Loss Prevention

### Before Any Migration:
1. ✅ Backup database: `pg_dump vivim_db > backup.sql`
2. ✅ Backup code: `cp -r project project-backup`
3. ✅ Document current state: `git log --oneline -5`

### During Migration:
- Never run `DROP TABLE` without backup
- Use `IF EXISTS` / `IF NOT EXISTS` clauses
- Test on copy first

### After Migration:
- Verify data integrity
- Check foreign key constraints
- Test critical flows

---

## Recovery Checklist

Run this after any recovery:

```bash
# 1. Server health
curl http://localhost:3001/api/health

# 2. Database connection
cd packages/backend && bunx prisma db execute -c "SELECT 1"

# 3. TypeScript compiles
bun run typecheck

# 4. Tests pass
bun test

# 5. Key endpoints work
curl http://localhost:3001/api/health
curl http://localhost:3001/api/chat/health

# 6. Database data exists
psql -d vivim_db -c "SELECT count(*) FROM conversations;"
```

---

## Rollback Decision Matrix

| Severity | Symptoms | Action |
|----------|----------|--------|
| Low | Minor errors, most features work | Level 1: Quick Rollback |
| Medium | Key features broken | Level 2: Database Rollback |
| High | System won't start | Level 3: Full Restore |
| Critical | Data loss/corruption | Level 3 + Contact DBA |

---

## Prevention Best Practices

1. **Always test on copy first**
2. **Use feature flags for new systems**
3. **Create checkpoints after each phase**
4. **Document what you changed**
5. **Keep backups accessible**
6. **Monitor after each change**

---

## Quick Rollback Script

Create `scripts/emergency-rollback.sh`:

```bash
#!/bin/bash
# Emergency rollback script

set -e

echo "🚨 Starting emergency rollback..."

# Ask for confirmation
read -p "This will revert code changes. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Revert code
git checkout -- .

# Rollback database
cd packages/backend
bunx prisma migrate rollback || true

# Restart
echo "✅ Rollback complete. Run 'bun run dev' to restart."
```
