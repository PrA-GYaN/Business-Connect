import csv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

uri = "mongodb+srv://pragyan1516:qwerty123@user.ymm9f.mongodb.net/?retryWrites=true&w=majority&appName=User"

current_directory = os.getcwd()

client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")

    db = client["test"]  # Replace with your actual database name
    collection = db["users"]  # Replace with your actual collection name

    # Correct file path with raw string to avoid escape character issues
    file_path = r'E:\Final-Year-Project\Algorithm\profiles.csv'

    with open(file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Profile ID', 'Interests', 'Skills'])

        # Retrieve all documents from the collection
        all_documents = collection.find()

        for document in all_documents:
            profile_id = document['_id']
            interests = document.get('interests', 'Not available')
            skills = document.get('skills', 'Not available')

            writer.writerow([profile_id, str(interests), str(skills)])

    print("CSV file 'users_data.csv' created successfully!")

except Exception as e:
    print("Error:", e)