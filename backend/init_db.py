"""
Script to initialize the database with default subjects
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ.get('DB_NAME', 'univloop_db')


async def init_subjects():
    """Initialize default subjects"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if subjects already exist
    count = await db.subjects.count_documents({})
    if count > 0:
        print(f"Database already has {count} subjects. Skipping initialization.")
        client.close()
        return
    
    default_subjects = [
        {
            "id": str(uuid.uuid4()),
            "name": "Informatique",
            "description": "Programmation, algorithmique, bases de données",
            "icon": "💻",
            "color": "#3B82F6",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mathématiques",
            "description": "Algèbre, analyse, géométrie, statistiques",
            "icon": "📐",
            "color": "#EF4444",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Physique",
            "description": "Mécanique, électricité, thermodynamique",
            "icon": "⚡",
            "color": "#10B981",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Chimie",
            "description": "Chimie organique, inorganique, analytique",
            "icon": "🧪",
            "color": "#8B5CF6",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Biologie",
            "description": "Biologie cellulaire, génétique, écologie",
            "icon": "🧬",
            "color": "#06B6D4",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Économie",
            "description": "Microéconomie, macroéconomie, finance",
            "icon": "📊",
            "color": "#F59E0B",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Droit",
            "description": "Droit civil, pénal, administratif",
            "icon": "⚖️",
            "color": "#6366F1",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Langues",
            "description": "Anglais, français, espagnol, etc.",
            "icon": "🌍",
            "color": "#EC4899",
            "is_custom": False,
            "created_by": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.subjects.insert_many(default_subjects)
    print(f"✅ Initialized {len(default_subjects)} default subjects")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(init_subjects())
