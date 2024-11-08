# hrm_project/firebase_app.py

import os
import firebase_admin
from firebase_admin import credentials
from decouple import config

# Use config to fetch the path from the environment variable
cred_path = config('FIREBASE_CREDENTIALS')
if not os.path.exists(cred_path):
    raise FileNotFoundError(f"Credential file not found at {cred_path}")

cred = credentials.Certificate(cred_path)
firebase_app = firebase_admin.initialize_app(cred)

