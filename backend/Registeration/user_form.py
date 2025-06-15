import os
import re
from supabase import create_client
from fastapi import HTTPException
from dotenv import load_dotenv
load_dotenv(".env.local")

class UserRegistration:
    def __init__(self, full_name, email, password, confirm_password):
        # Initialize user registration with required fields
        self.full_name = full_name
        self.email = email
        self.password = password
        self.confirm_password = confirm_password
        self.supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    def validate_data(self):
        # Validate all user input data before registration
        try:
            # Check if passwords match
            if self.password != self.confirm_password:
                raise HTTPException(status_code=400, detail="Passwords do not match")
            
            # Validate email format using regex
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, self.email):
                raise HTTPException(status_code=400, detail="Invalid email format")
            
            # Check required fields
            if not all([self.full_name, self.email, self.password]):
                raise HTTPException(status_code=400, detail="All fields are required")
            
            # Check minimum password length
            if len(self.password) < 6:
                raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

    def save(self):
        # Save validated user data to database
        try:
            # Validate data before saving
            self.validate_data()
            
            # Prepare data for database insertion
            data = {
                "full_name": self.full_name,
                "email": self.email,
                "password": self.password,
                "confirm_password": self.confirm_password
            }
            
            # Insert data into Supabase
            result = self.supabase.table("register_user").insert(data).execute()
            return result
        except HTTPException:
            raise
        except Exception as e:
            # Handle specific database errors
            if "duplicate key value violates unique constraint" in str(e):
                if "email" in str(e):
                    raise HTTPException(status_code=400, detail="Email already exists")
            raise HTTPException(status_code=500, detail="Registration failed. Please try again.")