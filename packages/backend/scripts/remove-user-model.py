"""
Remove User model and all User relations from Prisma schema.
Replace with VirtualUser relations only.
"""

import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the entire User model block
user_model_pattern = r'\nmodel User \{[^}]*\}@+map\("users"\)\n\}'
content = re.sub(user_model_pattern, '', content, flags=re.MULTILINE | re.DOTALL)

# Remove User relations from all models (keep VirtualUser)
# Pattern: fieldName User @relation(...) or fieldName User? @relation(...)
patterns_to_remove = [
    # Device.user
    (r'\n  userId\s+String\n  user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)', '\n  userId String'),
    
    # Notebook.owner  
    (r'\n  ownerId\s+String\n  owner\s+User\s+@relation\(fields: \[ownerId\], references: \[id\], onDelete: Cascade\)', '\n  ownerId String'),
    
    # SyncCursor.user
    (r'\n  userId\s+String\n  user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)', '\n  userId String'),
    
    # ClientPresence.user
    (r'\n  userId\s+String\n  user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)', '\n  userId String'),
    
    # CustomInstruction.user
    (r'\n  userId\s+String\n  user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)', '\n  userId String'),
    
    # UserContextSettings.user
    (r'\n  userId\s+String\n  user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)', '\n  userId String'),
    
    # SharingPolicy.owner
    (r'\n  ownerId\s+String\n  owner\s+User\s+@relation\(fields: \[ownerId\], references: \[id\], onDelete: Cascade\)', '\n  ownerId String'),
    
    # ContentStakeholder.user
    (r'\n  userId\s+String\n  user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)', '\n  userId String'),
    
    # ContextRecipe.user
    (r'\n  userId\s+String\n  user\s+User\??\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)', '\n  userId String?'),
    
    # ImportJob.user
    (r'\n  userId\s+String\n  user\s+User\??\s+@relation\(fields: \[userId\], references: \[id\], name: "UserImportJobs"\)', '\n  userId String?'),
]

for pattern, replacement in patterns_to_remove:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

# Remove User? relations (optional User)
content = re.sub(
    r'\n  user\s+User\?\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)',
    '',
    content,
    flags=re.MULTILINE
)

# Remove @index([userId]) for User-specific indexes (keep virtualUserId ones)
# This is safe because we're keeping virtualUserId indexes

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print('User model and relations removed successfully!')
