from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from models import (
    User, UserCreate, UserLogin, UserUpdate, UserProfile,
    Subject, SubjectCreate,
    Resource, ResourceCreate, ResourceUpdate,
    Discussion, DiscussionCreate, DiscussionUpdate, CommentCreate, Comment,
    Quiz, QuizCreate, QuizUpdate,
    Flashcard, FlashcardCreate, FlashcardUpdate,
    Notification, NotificationCreate,
    Statistics, Token
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_user_optional
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'univloop_db')]

# Create the main app
app = FastAPI(title="UnivLoop API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Dependency to get database
async def get_db() -> AsyncIOMotorDatabase:
    return db


# Dependency to get current user
async def get_current_user_dep(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    database: AsyncIOMotorDatabase = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user"""
    return await get_current_user(credentials, database)


# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@api_router.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = await database.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "department": user_data.department,
        "faculty": user_data.faculty,
        "year_of_study": user_data.year_of_study,
        "bio": user_data.bio,
        "avatar": user_data.avatar,
        "role": "student",
        "reputation": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await database.users.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(access_token=access_token)


@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Login user"""
    # Find user
    user_doc = await database.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_doc["id"]})
    
    return Token(access_token=access_token)


@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db))):
    """Get current user profile"""
    return current_user


@api_router.post("/auth/logout")
async def logout():
    """Logout user (client should delete token)"""
    return {"message": "Successfully logged out"}


# ============================================================================
# USER ROUTES
# ============================================================================

@api_router.get("/users/{user_id}", response_model=UserProfile)
async def get_user(user_id: str, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get user profile by ID"""
    user_doc = await database.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert datetime strings
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    # Get user statistics
    resources_count = await database.resources.count_documents({"author_id": user_id})
    discussions_count = await database.discussions.count_documents({"author_id": user_id})
    
    # Count comments by user
    discussions = await database.discussions.find({}).to_list(None)
    comments_count = sum(
        len([c for c in d.get('comments', []) if c.get('author_id') == user_id])
        for d in discussions
    )
    
    user_doc['resources_count'] = resources_count
    user_doc['discussions_count'] = discussions_count
    user_doc['comments_count'] = comments_count
    
    return UserProfile(**user_doc)


@api_router.put("/users/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update user profile"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    # Update user
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await database.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get updated user
    user_doc = await database.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    # Convert datetime strings
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    if isinstance(user_doc.get('updated_at'), str):
        user_doc['updated_at'] = datetime.fromisoformat(user_doc['updated_at'])
    
    return User(**user_doc)


# ============================================================================
# SUBJECT ROUTES
# ============================================================================

@api_router.get("/subjects", response_model=List[Subject])
async def get_subjects(database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all subjects"""
    subjects = await database.subjects.find({}, {"_id": 0}).to_list(None)
    
    # Convert datetime strings
    for subject in subjects:
        if isinstance(subject.get('created_at'), str):
            subject['created_at'] = datetime.fromisoformat(subject['created_at'])
    
    return subjects


@api_router.post("/subjects", response_model=Subject, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_data: SubjectCreate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new subject (for 'Autre' option)"""
    # Check if subject already exists
    existing = await database.subjects.find_one({"name": subject_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Subject already exists")
    
    subject_doc = {
        "id": str(uuid.uuid4()),
        "name": subject_data.name,
        "description": subject_data.description,
        "icon": subject_data.icon,
        "color": subject_data.color,
        "is_custom": subject_data.is_custom,
        "created_by": current_user.id if subject_data.is_custom else None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await database.subjects.insert_one(subject_doc)
    
    subject_doc['created_at'] = datetime.fromisoformat(subject_doc['created_at'])
    return Subject(**subject_doc)


@api_router.get("/subjects/{subject_id}", response_model=Subject)
async def get_subject(subject_id: str, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get subject by ID"""
    subject_doc = await database.subjects.find_one({"id": subject_id}, {"_id": 0})
    if not subject_doc:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    if isinstance(subject_doc.get('created_at'), str):
        subject_doc['created_at'] = datetime.fromisoformat(subject_doc['created_at'])
    
    return Subject(**subject_doc)


# ============================================================================
# RESOURCE ROUTES
# ============================================================================

@api_router.get("/resources", response_model=List[Resource])
async def get_resources(
    subject_id: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all resources with optional filters"""
    query = {}
    if subject_id:
        query["subject_id"] = subject_id
    if author_id:
        query["author_id"] = author_id
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    resources = await database.resources.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(None)
    
    # Convert datetime strings
    for resource in resources:
        if isinstance(resource.get('created_at'), str):
            resource['created_at'] = datetime.fromisoformat(resource['created_at'])
        if isinstance(resource.get('updated_at'), str):
            resource['updated_at'] = datetime.fromisoformat(resource['updated_at'])
    
    return resources


@api_router.post("/resources", response_model=Resource, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_data: ResourceCreate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new resource"""
    # Verify subject exists
    subject = await database.subjects.find_one({"id": resource_data.subject_id})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    resource_doc = {
        "id": str(uuid.uuid4()),
        "title": resource_data.title,
        "description": resource_data.description,
        "subject_id": resource_data.subject_id,
        "author_id": current_user.id,
        "author_name": current_user.name,
        "author_avatar": current_user.avatar,
        "type": resource_data.type,
        "file_url": resource_data.file_url,
        "thumbnail_url": resource_data.thumbnail_url,
        "likes": 0,
        "views": 0,
        "liked_by": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await database.resources.insert_one(resource_doc)
    
    # Create notification for followers (simplified - notify all users except author)
    users = await database.users.find({"id": {"$ne": current_user.id}}, {"_id": 0, "id": 1}).to_list(None)
    notifications = []
    for user in users:
        notif = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "resource",
            "title": "Nouvelle ressource",
            "message": f"{current_user.name} a partagé: {resource_data.title}",
            "link": f"/resources",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        notifications.append(notif)
    
    if notifications:
        await database.notifications.insert_many(notifications)
    
    resource_doc['created_at'] = datetime.fromisoformat(resource_doc['created_at'])
    resource_doc['updated_at'] = datetime.fromisoformat(resource_doc['updated_at'])
    return Resource(**resource_doc)


@api_router.get("/resources/{resource_id}", response_model=Resource)
async def get_resource(resource_id: str, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get resource by ID and increment views"""
    resource_doc = await database.resources.find_one({"id": resource_id}, {"_id": 0})
    if not resource_doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Increment views
    await database.resources.update_one(
        {"id": resource_id},
        {"$inc": {"views": 1}}
    )
    resource_doc['views'] = resource_doc.get('views', 0) + 1
    
    if isinstance(resource_doc.get('created_at'), str):
        resource_doc['created_at'] = datetime.fromisoformat(resource_doc['created_at'])
    if isinstance(resource_doc.get('updated_at'), str):
        resource_doc['updated_at'] = datetime.fromisoformat(resource_doc['updated_at'])
    
    return Resource(**resource_doc)


@api_router.put("/resources/{resource_id}", response_model=Resource)
async def update_resource(
    resource_id: str,
    resource_update: ResourceUpdate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update a resource"""
    resource_doc = await database.resources.find_one({"id": resource_id})
    if not resource_doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if resource_doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this resource")
    
    update_data = {k: v for k, v in resource_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await database.resources.update_one(
        {"id": resource_id},
        {"$set": update_data}
    )
    
    resource_doc = await database.resources.find_one({"id": resource_id}, {"_id": 0})
    
    if isinstance(resource_doc.get('created_at'), str):
        resource_doc['created_at'] = datetime.fromisoformat(resource_doc['created_at'])
    if isinstance(resource_doc.get('updated_at'), str):
        resource_doc['updated_at'] = datetime.fromisoformat(resource_doc['updated_at'])
    
    return Resource(**resource_doc)


@api_router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a resource"""
    resource_doc = await database.resources.find_one({"id": resource_id})
    if not resource_doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if resource_doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this resource")
    
    await database.resources.delete_one({"id": resource_id})
    return None


@api_router.post("/resources/{resource_id}/like")
async def like_resource(
    resource_id: str,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Like or unlike a resource"""
    resource_doc = await database.resources.find_one({"id": resource_id})
    if not resource_doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    liked_by = resource_doc.get("liked_by", [])
    
    if current_user.id in liked_by:
        # Unlike
        await database.resources.update_one(
            {"id": resource_id},
            {
                "$pull": {"liked_by": current_user.id},
                "$inc": {"likes": -1}
            }
        )
        return {"liked": False, "likes": resource_doc.get("likes", 0) - 1}
    else:
        # Like
        await database.resources.update_one(
            {"id": resource_id},
            {
                "$push": {"liked_by": current_user.id},
                "$inc": {"likes": 1}
            }
        )
        
        # Create notification for author
        if resource_doc["author_id"] != current_user.id:
            notif = {
                "id": str(uuid.uuid4()),
                "user_id": resource_doc["author_id"],
                "type": "like",
                "title": "Nouveau like",
                "message": f"{current_user.name} a aimé votre ressource: {resource_doc['title']}",
                "link": f"/resources",
                "read": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await database.notifications.insert_one(notif)
        
        return {"liked": True, "likes": resource_doc.get("likes", 0) + 1}


# ============================================================================
# DISCUSSION/COMMUNITY ROUTES
# ============================================================================

@api_router.get("/discussions", response_model=List[Discussion])
async def get_discussions(
    subject_id: Optional[str] = Query(None),
    group_type: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    faculty: Optional[str] = Query(None),
    year: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all discussions with filters"""
    query = {}
    
    if subject_id:
        query["subject_id"] = subject_id
    if group_type:
        query["group_type"] = group_type
    if department:
        query["author_department"] = department
    if faculty:
        query["author_faculty"] = faculty
    if year:
        query["author_year"] = year
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    
    discussions = await database.discussions.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(None)
    
    # Convert datetime strings
    for discussion in discussions:
        if isinstance(discussion.get('created_at'), str):
            discussion['created_at'] = datetime.fromisoformat(discussion['created_at'])
        if isinstance(discussion.get('updated_at'), str):
            discussion['updated_at'] = datetime.fromisoformat(discussion['updated_at'])
        
        for comment in discussion.get('comments', []):
            if isinstance(comment.get('created_at'), str):
                comment['created_at'] = datetime.fromisoformat(comment['created_at'])
    
    return discussions


@api_router.post("/discussions", response_model=Discussion, status_code=status.HTTP_201_CREATED)
async def create_discussion(
    discussion_data: DiscussionCreate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new discussion"""
    subject_name = None
    if discussion_data.subject_id:
        subject = await database.subjects.find_one({"id": discussion_data.subject_id})
        if subject:
            subject_name = subject["name"]
    
    discussion_doc = {
        "id": str(uuid.uuid4()),
        "title": discussion_data.title,
        "content": discussion_data.content,
        "subject_id": discussion_data.subject_id,
        "subject_name": subject_name,
        "author_id": current_user.id,
        "author_name": current_user.name,
        "author_avatar": current_user.avatar,
        "author_department": current_user.department,
        "author_faculty": current_user.faculty,
        "author_year": current_user.year_of_study,
        "group_type": discussion_data.group_type,
        "comments": [],
        "views": 0,
        "solved": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await database.discussions.insert_one(discussion_doc)
    
    # Create notifications based on group_type
    users_query = {"id": {"$ne": current_user.id}}
    if discussion_data.group_type == "department" and current_user.department:
        users_query["department"] = current_user.department
    elif discussion_data.group_type == "faculty" and current_user.faculty:
        users_query["faculty"] = current_user.faculty
    elif discussion_data.group_type == "year" and current_user.year_of_study:
        users_query["year_of_study"] = current_user.year_of_study
    
    users = await database.users.find(users_query, {"_id": 0, "id": 1}).to_list(None)
    notifications = []
    for user in users:
        notif = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "discussion",
            "title": "Nouvelle discussion",
            "message": f"{current_user.name} a posté: {discussion_data.title}",
            "link": f"/community",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        notifications.append(notif)
    
    if notifications:
        await database.notifications.insert_many(notifications)
    
    discussion_doc['created_at'] = datetime.fromisoformat(discussion_doc['created_at'])
    discussion_doc['updated_at'] = datetime.fromisoformat(discussion_doc['updated_at'])
    return Discussion(**discussion_doc)


@api_router.get("/discussions/{discussion_id}", response_model=Discussion)
async def get_discussion(discussion_id: str, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get discussion by ID and increment views"""
    discussion_doc = await database.discussions.find_one({"id": discussion_id}, {"_id": 0})
    if not discussion_doc:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Increment views
    await database.discussions.update_one(
        {"id": discussion_id},
        {"$inc": {"views": 1}}
    )
    discussion_doc['views'] = discussion_doc.get('views', 0) + 1
    
    if isinstance(discussion_doc.get('created_at'), str):
        discussion_doc['created_at'] = datetime.fromisoformat(discussion_doc['created_at'])
    if isinstance(discussion_doc.get('updated_at'), str):
        discussion_doc['updated_at'] = datetime.fromisoformat(discussion_doc['updated_at'])
    
    for comment in discussion_doc.get('comments', []):
        if isinstance(comment.get('created_at'), str):
            comment['created_at'] = datetime.fromisoformat(comment['created_at'])
    
    return Discussion(**discussion_doc)


@api_router.put("/discussions/{discussion_id}", response_model=Discussion)
async def update_discussion(
    discussion_id: str,
    discussion_update: DiscussionUpdate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update a discussion"""
    discussion_doc = await database.discussions.find_one({"id": discussion_id})
    if not discussion_doc:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    if discussion_doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in discussion_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await database.discussions.update_one(
        {"id": discussion_id},
        {"$set": update_data}
    )
    
    discussion_doc = await database.discussions.find_one({"id": discussion_id}, {"_id": 0})
    
    if isinstance(discussion_doc.get('created_at'), str):
        discussion_doc['created_at'] = datetime.fromisoformat(discussion_doc['created_at'])
    if isinstance(discussion_doc.get('updated_at'), str):
        discussion_doc['updated_at'] = datetime.fromisoformat(discussion_doc['updated_at'])
    
    for comment in discussion_doc.get('comments', []):
        if isinstance(comment.get('created_at'), str):
            comment['created_at'] = datetime.fromisoformat(comment['created_at'])
    
    return Discussion(**discussion_doc)


@api_router.delete("/discussions/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discussion(
    discussion_id: str,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a discussion"""
    discussion_doc = await database.discussions.find_one({"id": discussion_id})
    if not discussion_doc:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    if discussion_doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await database.discussions.delete_one({"id": discussion_id})
    return None


@api_router.post("/discussions/{discussion_id}/comments", response_model=Comment, status_code=status.HTTP_201_CREATED)
async def add_comment(
    discussion_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Add a comment to a discussion"""
    discussion_doc = await database.discussions.find_one({"id": discussion_id})
    if not discussion_doc:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    comment = {
        "id": str(uuid.uuid4()),
        "author_id": current_user.id,
        "author_name": current_user.name,
        "author_avatar": current_user.avatar,
        "content": comment_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await database.discussions.update_one(
        {"id": discussion_id},
        {
            "$push": {"comments": comment},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    # Create notification for discussion author
    if discussion_doc["author_id"] != current_user.id:
        notif = {
            "id": str(uuid.uuid4()),
            "user_id": discussion_doc["author_id"],
            "type": "comment",
            "title": "Nouveau commentaire",
            "message": f"{current_user.name} a commenté votre discussion: {discussion_doc['title']}",
            "link": f"/community",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await database.notifications.insert_one(notif)
    
    comment['created_at'] = datetime.fromisoformat(comment['created_at'])
    return Comment(**comment)


# ============================================================================
# QUIZ ROUTES
# ============================================================================

@api_router.get("/quizzes", response_model=List[Quiz])
async def get_quizzes(
    subject_id: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all quizzes"""
    query = {}
    if subject_id:
        query["subject_id"] = subject_id
    
    quizzes = await database.quizzes.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(None)
    
    for quiz in quizzes:
        if isinstance(quiz.get('created_at'), str):
            quiz['created_at'] = datetime.fromisoformat(quiz['created_at'])
        if isinstance(quiz.get('updated_at'), str):
            quiz['updated_at'] = datetime.fromisoformat(quiz['updated_at'])
    
    return quizzes


@api_router.post("/quizzes", response_model=Quiz, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new quiz"""
    subject = await database.subjects.find_one({"id": quiz_data.subject_id})
    subject_name = subject["name"] if subject else None
    
    quiz_doc = {
        "id": str(uuid.uuid4()),
        "title": quiz_data.title,
        "subject_id": quiz_data.subject_id,
        "subject_name": subject_name,
        "author_id": current_user.id,
        "author_name": current_user.name,
        "questions": [q.model_dump() for q in quiz_data.questions],
        "duration": quiz_data.duration,
        "difficulty": quiz_data.difficulty,
        "attempts": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await database.quizzes.insert_one(quiz_doc)
    
    # Notify users
    users = await database.users.find({"id": {"$ne": current_user.id}}, {"_id": 0, "id": 1}).to_list(None)
    notifications = []
    for user in users:
        notif = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "quiz",
            "title": "Nouveau quiz",
            "message": f"{current_user.name} a créé un quiz: {quiz_data.title}",
            "link": f"/quiz",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        notifications.append(notif)
    
    if notifications:
        await database.notifications.insert_many(notifications)
    
    quiz_doc['created_at'] = datetime.fromisoformat(quiz_doc['created_at'])
    quiz_doc['updated_at'] = datetime.fromisoformat(quiz_doc['updated_at'])
    return Quiz(**quiz_doc)


@api_router.get("/quizzes/{quiz_id}", response_model=Quiz)
async def get_quiz(quiz_id: str, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get quiz by ID"""
    quiz_doc = await database.quizzes.find_one({"id": quiz_id}, {"_id": 0})
    if not quiz_doc:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    if isinstance(quiz_doc.get('created_at'), str):
        quiz_doc['created_at'] = datetime.fromisoformat(quiz_doc['created_at'])
    if isinstance(quiz_doc.get('updated_at'), str):
        quiz_doc['updated_at'] = datetime.fromisoformat(quiz_doc['updated_at'])
    
    return Quiz(**quiz_doc)


@api_router.post("/quizzes/{quiz_id}/attempt")
async def attempt_quiz(
    quiz_id: str,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Record a quiz attempt"""
    await database.quizzes.update_one(
        {"id": quiz_id},
        {"$inc": {"attempts": 1}}
    )
    return {"message": "Attempt recorded"}


# ============================================================================
# FLASHCARD ROUTES
# ============================================================================

@api_router.get("/flashcards", response_model=List[Flashcard])
async def get_flashcards(
    subject_id: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all flashcards"""
    query = {}
    if subject_id:
        query["subject_id"] = subject_id
    
    flashcards = await database.flashcards.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(None)
    
    for flashcard in flashcards:
        if isinstance(flashcard.get('created_at'), str):
            flashcard['created_at'] = datetime.fromisoformat(flashcard['created_at'])
        if isinstance(flashcard.get('updated_at'), str):
            flashcard['updated_at'] = datetime.fromisoformat(flashcard['updated_at'])
    
    return flashcards


@api_router.post("/flashcards", response_model=Flashcard, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    flashcard_data: FlashcardCreate,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new flashcard set"""
    subject = await database.subjects.find_one({"id": flashcard_data.subject_id})
    subject_name = subject["name"] if subject else None
    
    flashcard_doc = {
        "id": str(uuid.uuid4()),
        "title": flashcard_data.title,
        "subject_id": flashcard_data.subject_id,
        "subject_name": subject_name,
        "author_id": current_user.id,
        "author_name": current_user.name,
        "cards": [card.model_dump() for card in flashcard_data.cards],
        "views": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await database.flashcards.insert_one(flashcard_doc)
    
    # Notify users
    users = await database.users.find({"id": {"$ne": current_user.id}}, {"_id": 0, "id": 1}).to_list(None)
    notifications = []
    for user in users:
        notif = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "flashcard",
            "title": "Nouvelles flashcards",
            "message": f"{current_user.name} a créé des flashcards: {flashcard_data.title}",
            "link": f"/flashcards",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        notifications.append(notif)
    
    if notifications:
        await database.notifications.insert_many(notifications)
    
    flashcard_doc['created_at'] = datetime.fromisoformat(flashcard_doc['created_at'])
    flashcard_doc['updated_at'] = datetime.fromisoformat(flashcard_doc['updated_at'])
    return Flashcard(**flashcard_doc)


@api_router.get("/flashcards/{flashcard_id}", response_model=Flashcard)
async def get_flashcard(flashcard_id: str, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get flashcard by ID and increment views"""
    flashcard_doc = await database.flashcards.find_one({"id": flashcard_id}, {"_id": 0})
    if not flashcard_doc:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Increment views
    await database.flashcards.update_one(
        {"id": flashcard_id},
        {"$inc": {"views": 1}}
    )
    flashcard_doc['views'] = flashcard_doc.get('views', 0) + 1
    
    if isinstance(flashcard_doc.get('created_at'), str):
        flashcard_doc['created_at'] = datetime.fromisoformat(flashcard_doc['created_at'])
    if isinstance(flashcard_doc.get('updated_at'), str):
        flashcard_doc['updated_at'] = datetime.fromisoformat(flashcard_doc['updated_at'])
    
    return Flashcard(**flashcard_doc)


# ============================================================================
# NOTIFICATION ROUTES
# ============================================================================

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    limit: int = Query(50, le=100),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current user's notifications"""
    notifications = await database.notifications.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(None)
    
    for notif in notifications:
        if isinstance(notif.get('created_at'), str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    
    return notifications


@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Mark notification as read"""
    result = await database.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}


@api_router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(lambda creds, db=Depends(get_db): get_current_user(creds, db)),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a notification"""
    result = await database.notifications.delete_one(
        {"id": notification_id, "user_id": current_user.id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return None


# ============================================================================
# STATISTICS ROUTES
# ============================================================================

@api_router.get("/statistics", response_model=Statistics)
async def get_statistics(database: AsyncIOMotorDatabase = Depends(get_db)):
    """Get platform statistics"""
    total_users = await database.users.count_documents({})
    total_resources = await database.resources.count_documents({})
    total_discussions = await database.discussions.count_documents({})
    total_quizzes = await database.quizzes.count_documents({})
    total_flashcards = await database.flashcards.count_documents({})
    total_subjects = await database.subjects.count_documents({})
    
    return Statistics(
        total_users=total_users,
        total_resources=total_resources,
        total_discussions=total_discussions,
        total_quizzes=total_quizzes,
        total_flashcards=total_flashcards,
        total_subjects=total_subjects
    )


# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "UnivLoop API is running"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
