import os
import re
import logging
from supabase import create_client
from fastapi import HTTPException
from dotenv import load_dotenv

# Configure logging for better error tracking
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(".env.local")

class AdminRegistration:
    def __init__(self, full_name, organization_name, email, password, confirm_password, access_code):
        # Initialize admin registration with required fields
        self.full_name = full_name
        self.organization_name = organization_name
        self.email = email
        self.password = password
        self.confirm_password = confirm_password
        self.access_code = access_code
        self.supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    def validate_data(self):
        # Validate all admin registration data before processing
        try:
            # Check if passwords match
            if self.password != self.confirm_password:
                raise HTTPException(status_code=400, detail="Passwords do not match")
            
            # Validate email format using regex
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, self.email):
                raise HTTPException(status_code=400, detail="Invalid email format")
            
            # Validate access code format
            if not self.access_code or not self.access_code[0].isdigit():
                raise HTTPException(status_code=400, detail="Access code must start with a number")
            
            # Check required fields
            if not all([self.full_name, self.organization_name, self.email, self.password, self.access_code]):
                raise HTTPException(status_code=400, detail="All fields are required")
            
            # Check minimum password length
            if len(self.password) < 6:
                raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Validation error: {e}")
            raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

    def save(self):
        # Save validated admin data to database
        try:
            # Validate data before saving
            self.validate_data()
            
            # Prepare data for database insertion
            data = {
                "full_name": self.full_name,
                "organization_name": self.organization_name,
                "email": self.email,
                "password": self.password,
                "confirm_password": self.confirm_password,
                "access_code": self.access_code
            }
            
            # Insert data into Supabase
            result = self.supabase.table("register_admin").insert(data).execute()
            
            if result.data:
                logger.info(f"Admin registration successful for: {self.email}")
                return result
            else:
                raise HTTPException(status_code=500, detail="Failed to save admin data to database")
                
        except HTTPException:
            raise
        except Exception as e:
            # Handle specific database errors
            if "duplicate key value violates unique constraint" in str(e):
                if "email" in str(e):
                    raise HTTPException(status_code=400, detail="Email already exists")
                elif "organization_name" in str(e):
                    raise HTTPException(status_code=400, detail="Organization name already exists")
                elif "access_code" in str(e):
                    raise HTTPException(status_code=400, detail="Access code already exists")
            logger.error(f"Save error: {e}")
            raise HTTPException(status_code=500, detail="Registration failed. Please try again.")