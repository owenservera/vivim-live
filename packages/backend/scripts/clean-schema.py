"""
Clean Prisma schema by removing social network, crypto, and auth-related models.
Keeps only: VirtualUser, VirtualConversation, VirtualMessage, VirtualMemory, 
VirtualACU, VirtualNotebook, TopicProfile, EntityProfile, ContextBundle, 
AtomicChatUnit, Conversation, Message, DocCorpus, DocChunk, AiPersona, etc.
"""

import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove PeerConnection model
content = re.sub(
    r'\nmodel PeerConnection \{[^}]*\}@+map\("peer_connections"\)\n\}',
    '',
    content,
    flags=re.MULTILINE | re.DOTALL
)

# Find and remove everything between sync_operations and AiPersona (social network section)
start_marker = '@@map("sync_operations")\n}'
end_marker = 'model AiPersona {'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx >= 0 and end_idx >= 0:
    # Keep the start marker, remove everything until AiPersona
    new_content = content[:start_idx + len(start_marker)] + '\n\n' + content[end_idx:]
    
    with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print('Schema cleaned successfully!')
    print(f'Removed {end_idx - (start_idx + len(start_marker))} characters')
else:
    print('Markers not found. Manual cleanup may be needed.')
    print(f'start_idx: {start_idx}, end_idx: {end_idx}')
