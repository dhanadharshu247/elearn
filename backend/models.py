from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="learner")
    created_at = Column(DateTime, default=datetime.utcnow)
    reset_otp = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)

    courses = relationship("Course", back_populates="instructor")
    enrolments = relationship("Enrolment", back_populates="user")
    quiz_results = relationship("QuizResult", back_populates="user")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    thumbnail = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    status = Column(String, default="Published")
    instructor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    instructor = relationship("User", back_populates="courses")
    modules = relationship("Module", back_populates="course")
    enrolments = relationship("Enrolment", back_populates="course")

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    contentLink = Column(String)
    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship("Course", back_populates="modules")
    quiz = relationship("Question", back_populates="module")
    results = relationship("QuizResult", back_populates="module")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    questionText = Column(String)
    correctOptionIndex = Column(Integer)
    module_id = Column(Integer, ForeignKey("modules.id"))

    module = relationship("Module", back_populates="quiz")
    options = relationship("QuestionOption", back_populates="question")

class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    question_id = Column(Integer, ForeignKey("questions.id"))

    question = relationship("Question", back_populates="options")

class Enrolment(Base) :
    __tablename__ = "enrolments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="enrolments")
    course = relationship("Course", back_populates="enrolments")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(Integer, ForeignKey("modules.id"))
    score = Column(Integer)
    total_questions = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_results")
    module = relationship("Module", back_populates="results")
