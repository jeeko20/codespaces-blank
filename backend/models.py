from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"


class ResourceType(str, Enum):
    PDF = "pdf"
    VIDEO = "video"
    IMAGE = "image"
    DOCUMENT = "document"
    OTHER = "other"


class NotificationType(str, Enum):
    RESOURCE = "resource"
    DISCUSSION = "discussion"
    COMMENT = "comment"
    LIKE = "like"
    QUIZ = "quiz"
    FLASHCARD = "flashcard"


# User Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: Optional[str] = None
    faculty: Optional[str] = None
    year_of_study: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    department: Optional[str] = None
    faculty: Optional[str] = None
    year_of_study: Optional[str] = None
    avatar: Optional[str] = None


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    email: EmailStr
    department: Optional[str] = None
    faculty: Optional[str] = None
    year_of_study: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    reputation: int = 0
    created_at: datetime
    updated_at: datetime


class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    email: EmailStr
    department: Optional[str] = None
    faculty: Optional[str] = None
    year_of_study: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    reputation: int = 0
    created_at: datetime
    resources_count: int = 0
    discussions_count: int = 0
    comments_count: int = 0


# Subject Models
class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = "#3B82F6"
    is_custom: bool = False


class Subject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#3B82F6"
    is_custom: bool = False
    created_by: Optional[str] = None
    created_at: datetime


# Resource Models
class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: str
    type: ResourceType
    file_url: str
    thumbnail_url: Optional[str] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject_id: Optional[str] = None


class Resource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    description: Optional[str] = None
    subject_id: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    type: ResourceType
    file_url: str
    thumbnail_url: Optional[str] = None
    likes: int = 0
    views: int = 0
    liked_by: List[str] = []
    created_at: datetime
    updated_at: datetime


# Discussion Models
class DiscussionCreate(BaseModel):
    title: str
    content: str
    subject_id: Optional[str] = None
    group_type: str = "global"  # global, faculty, department, year


class DiscussionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    solved: Optional[bool] = None


class CommentCreate(BaseModel):
    content: str


class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    content: str
    created_at: datetime


class Discussion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    content: str
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    author_department: Optional[str] = None
    author_faculty: Optional[str] = None
    author_year: Optional[str] = None
    group_type: str = "global"
    comments: List[Comment] = []
    views: int = 0
    solved: bool = False
    created_at: datetime
    updated_at: datetime


# Quiz Models
class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: Optional[str] = None


class QuizCreate(BaseModel):
    title: str
    subject_id: str
    questions: List[QuizQuestion]
    duration: int = 30  # minutes
    difficulty: str = "Moyen"


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None


class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    subject_id: str
    subject_name: Optional[str] = None
    author_id: str
    author_name: str
    questions: List[QuizQuestion]
    duration: int
    difficulty: str
    attempts: int = 0
    created_at: datetime
    updated_at: datetime


# Flashcard Models
class FlashcardItem(BaseModel):
    front: str
    back: str


class FlashcardCreate(BaseModel):
    title: str
    subject_id: str
    cards: List[FlashcardItem]


class FlashcardUpdate(BaseModel):
    title: Optional[str] = None
    cards: Optional[List[FlashcardItem]] = None


class Flashcard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    subject_id: str
    subject_name: Optional[str] = None
    author_id: str
    author_name: str
    cards: List[FlashcardItem]
    views: int = 0
    created_at: datetime
    updated_at: datetime


# Notification Models
class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    link: Optional[str] = None


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    link: Optional[str] = None
    read: bool = False
    created_at: datetime


# Statistics Models
class Statistics(BaseModel):
    total_users: int
    total_resources: int
    total_discussions: int
    total_quizzes: int
    total_flashcards: int
    total_subjects: int


# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str
