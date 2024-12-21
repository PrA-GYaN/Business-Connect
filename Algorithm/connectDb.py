import csv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

# MongoDB URI and database setup
uri = "mongodb+srv://pragyan1516:qwerty123@user.ymm9f.mongodb.net/?retryWrites=true&w=majority&appName=User"
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    # Test MongoDB connection
    client.admin.command('ping')

    db = client["test"]  # Replace with your actual database name
    users_collection = db["users"]  # Replace with your actual collection name
    threads_collection = db["threads"]  # Assuming there's a threads collection

    # Correct file paths
    individual_file_path = r'E:\Final-Year-Project\Algorithm\profiles.csv'
    business_file_path = r'E:\Final-Year-Project\Algorithm\business_profiles.csv'
    threads_file_path = r'E:\Final-Year-Project\Algorithm\threads.csv'

    # Open CSV files for writing
    with open(individual_file_path, mode='w', newline='') as individual_file, \
         open(business_file_path, mode='w', newline='') as business_file, \
         open(threads_file_path, mode='w', newline='') as threads_file:

        # Create CSV writers for all files
        individual_writer = csv.writer(individual_file)
        business_writer = csv.writer(business_file)
        threads_writer = csv.writer(threads_file)

        # Write headers to all files
        individual_writer.writerow(['Profile ID', 'Interests', 'Skills'])
        business_writer.writerow(['Profile ID', 'Interests', 'Skills', 'Operational Focus', 
                                  'Technologies', 'Business Models', 'Strategic Goals', 
                                  'Performance Metrics', 'Industry Focus'])
        threads_writer.writerow(['ThreadId','Title','Content','Tags'])

        # Retrieve all documents from the users collection
        all_documents = users_collection.find()

        # Iterate over each document and write to the appropriate file
        for document in all_documents:
            profile_id = document['_id']
            interests = document.get('interests', '')
            skills = document.get('skills', '')
            business_type = document.get('businessType', '')

            # If it's an individual profile, write to individual CSV file
            if business_type.lower() == 'individual':
                individual_writer.writerow([profile_id, str(interests), str(skills)])

            # If it's a business house profile, write additional fields to business CSV file
            elif business_type.lower() == 'house':
                # Get the additional fields for business profiles
                operational_focus = document.get('operationalFocus', '')
                technologies = document.get('technologies', '')
                business_models = document.get('businessModels', '')
                strategic_goals = document.get('strategicGoals', '')
                performance_metrics = document.get('performanceMetrics', '')
                industry_focus = document.get('industryFocus', '')

                # Write business profile data to business CSV file
                business_writer.writerow([profile_id, str(operational_focus), 
                                          str(technologies), str(business_models), str(strategic_goals), 
                                          str(performance_metrics), str(industry_focus)])

        # Retrieve all documents from the threads collection
        all_threads = threads_collection.find()

        # Iterate over each thread document and write to the threads CSV file
        for thread in all_threads:
            thread_id = thread['_id']
            creator = thread.get('title', '')
            topic = thread.get('content', '')
            messages = thread.get('tags', '')
            
            # If messages is a list, join them into a single string
            if isinstance(messages, list):
                messages = ' | '.join(messages)
            
            # Write thread data to the threads CSV file
            threads_writer.writerow([thread_id, creator, topic, messages])

    print("CSV files 'profiles.csv', 'business_profiles.csv', and 'threads.csv' created successfully!")

except Exception as e:
    print("Error:", e)


