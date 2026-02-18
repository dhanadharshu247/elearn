from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Pydantic Schemas

class QuestionOption(BaseModel):
    text: str

class Question(BaseModel):
    questionText: str
    options: List[QuestionOption]
    correctOptionIndex: int

class Module(BaseModel):
    title: str
    contentLink: Optional[str] = None
    documentPath: Optional[str] = None 
    quiz: List[Question] = []

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = "learner"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class CourseBase(BaseModel):
    title: str
    description: str
    thumbnail: Optional[str] = None
    price: Optional[float] = 0.0
    status: Optional[str] = "Published"

class CourseCreate(CourseBase):
    modules: List[Module] = []

class CourseResponse(CourseBase):
    id: int
    instructor_id: int
    created_at: datetime
    enrolledStudents: List[int] = []

    model_config = {
        "from_attributes": True
    }

class Enrolment(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime

    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user: UserResponse

class QuizResultBase(BaseModel):
    score: int
    total_questions: int

class QuizResultCreate(QuizResultBase):
    pass

class QuizResultResponse(QuizResultBase):
    id: int
    user_id: int
    module_id: int
    completed_at: datetime

    model_config = {
        "from_attributes": True
    }

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    token: str  # Frontend calls it 'token' but it's likely the OTP or a session identifier
    new_password: str

# Badge Schemas
class Badge(BaseModel):
    id: int
    name: str
    description: str
    icon: str

    model_config = {
        "from_attributes": True
    }

# Notification Schemas
class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# Message Schemas
class MessageBase(BaseModel):
    content: str
    receiver_id: int

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    is_read: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# Batch Schemas
class BatchBase(BaseModel):
    name: str
    course_id: int

class BatchCreate(BatchBase):
    pass

class Batch(BatchBase):
    id: int
    instructor_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }



