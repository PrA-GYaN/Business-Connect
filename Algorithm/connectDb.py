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
    print("Pinged your deployment. You successfully connected to MongoDB!")

    db = client["test"]  # Replace with your actual database name
    collection = db["users"]  # Replace with your actual collection name

    # Correct file paths
    individual_file_path = r'E:\Final-Year-Project\Algorithm\profiles.csv'
    business_file_path = r'E:\Final-Year-Project\Algorithm\business_profiles.csv'

    # Open both CSV files for writing
    with open(individual_file_path, mode='w', newline='') as individual_file, \
         open(business_file_path, mode='w', newline='') as business_file:

        # Create CSV writers for both files
        individual_writer = csv.writer(individual_file)
        business_writer = csv.writer(business_file)

        # Write headers to both files
        individual_writer.writerow(['Profile ID', 'Interests', 'Skills'])
        business_writer.writerow(['Profile ID', 'Interests', 'Skills', 'Operational Focus', 
                                  'Technologies', 'Business Models', 'Strategic Goals', 
                                  'Performance Metrics', 'Industry Focus'])

        # Retrieve all documents from the collection
        all_documents = collection.find()

        # Iterate over each document and write to the appropriate file
        for document in all_documents:
            profile_id = document['_id']
            interests = document.get('interests', '')
            skills = document.get('skills', '')
            business_type = document.get('businessType', '')

            print(f"Processing profile ID: {profile_id}")
            print(f"Business Type: {business_type}")

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

    print("CSV files 'profiles.csv' and 'business_profiles.csv' created successfully!")

except Exception as e:
    print("Error:", e)
