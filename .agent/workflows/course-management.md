---
description: Workflow for Instructor Course Management (Editing & Announcements)
---

1. **Backend Setup**:
    - Update `models.py` to include `Announcement` and add necessary relationship cascades.
    - Update `schemas.py` to include update schemas and announcement data structures.
    - Update `main.py` to add robust `PUT/PATCH` course endpoints and announcement logic.
2. **Frontend Course Editing**:
    - Build `EditCourse.jsx` to fetch current data and submit changes.
    - Match existing modules/questions by ID to maintain data integrity.
3. **Frontend Announcements**:
    - Build `Announcements.jsx` for instructors to send course-wide updates.
    - Integrate notifications for learners to receive these announcements.
4. **Verification**:
    - Test the full lifecycle: Course Creation -> Editing -> Announcement Posting -> Student Receipt.
