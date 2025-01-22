import csv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

uri = "mongodb+srv://pragyan1516:qwerty123@user.ymm9f.mongodb.net/?retryWrites=true&w=majority&appName=User"
client = MongoClient(uri, server_api=ServerApi('1'))

def clean_text(text):
    """Remove any characters that can't be encoded in the default encoding (e.g., ASCII)."""
    if isinstance(text, list):
        # If text is a list, join it into a string
        text = ' | '.join(str(x) for x in text)
    if text is None:
        return ""
    # Remove any non-ASCII characters
    return ''.join([ch for ch in text if isinstance(ch, str) and ord(ch) < 128])  # Keep only ASCII characters

try:
    client.admin.command('ping')

    db = client["test"]
    users_collection = db["users"]
    threads_collection = db["threads"]

    individual_file_path = r'E:\Final-Year-Project\Algorithm\profiles.csv'
    threads_file_path = r'E:\Final-Year-Project\Algorithm\threads.csv'
    users_file_path = r'E:\Final-Year-Project\Algorithm\users.csv'

    with open(individual_file_path, mode='w', newline='', encoding='utf-8') as individual_file, \
        open(users_file_path, mode='w', newline='', encoding='utf-8') as users_file, \
        open(threads_file_path, mode='w', newline='', encoding='utf-8') as threads_file:

        individual_writer = csv.writer(individual_file)
        threads_writer = csv.writer(threads_file)
        users_writer = csv.writer(users_file)

        individual_writer.writerow(['Profile ID', 'Interests', 'Skills'])
        users_writer.writerow(['Profile ID', 'Interests', 'Skills', 'Liked Profiles'])
        threads_writer.writerow(['ThreadId', 'Title', 'Content', 'Tags'])

        all_documents = users_collection.find()

        for document in all_documents:
            profile_id = document['_id']
            interests = document.get('interests', '')
            skills = document.get('skills', '')
            swipes = document.get('swipes', [])
            liked_profiles = []

            # Extract liked profiles from the 'swipes' field
            for swipe in swipes:
                if swipe.get('action') == 'Liked':
                    liked_profiles.append(str(swipe['userId']))  # Convert ObjectId to string

            # Handle empty liked_profiles case
            if not liked_profiles:
                liked_profiles_str = "[]"
            else:
                # Format liked_profiles as a string with double quotes around the list
                liked_profiles_str = f"['{', '.join(liked_profiles)}']"

            # Write user data to the CSV file

            business_type = document.get('businessType', '')

            if business_type.lower() == 'individual':
                users_writer.writerow([str(profile_id), str(interests), str(skills), liked_profiles_str])
                individual_writer.writerow([str(profile_id), str(interests), str(skills)])

            elif business_type.lower() == 'house':
                operational_focus = document.get('operationalFocus', '')
                technologies = document.get('technologies', '')
                individual_writer.writerow([str(profile_id), str(operational_focus), str(technologies)])
                users_writer.writerow([str(profile_id), str(operational_focus), str(technologies), liked_profiles_str])

        all_threads = threads_collection.find()

        for thread in all_threads:
            # Check if the status of the thread is 'active'
            if thread.get('status') == 'active':
                thread_id = thread['_id']
                creator = clean_text(thread.get('title', ''))
                topic = clean_text(thread.get('content', ''))
                messages = clean_text(thread.get('tags', ''))

                if isinstance(messages, list):
                    messages = ' | '.join(messages)

                if topic is not None:
                    threads_writer.writerow([str(thread_id), creator, topic, messages])

    print("CSV files 'profiles.csv', 'users.csv', and 'threads.csv' created successfully!")

except Exception as e:
    print("Error:", e)