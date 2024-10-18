import pandas as pd
import random
import os

# Get the current working directory
current_directory = os.getcwd()
print(f"Creating CSV files in: {current_directory}")

# Sample data for profiles
profiles_data = {
    "Profile ID": list(range(100)),
    "Interests": [],
    "Skills": []
}

# Extended sample interests and skills for business profiles
interests = [
    "Project Management", "Data Analysis", "Marketing", 
    "Sales", "Customer Service", "Business Development", 
    "Financial Planning", "Human Resources", "Operations", 
    "Entrepreneurship", "Digital Marketing", "E-commerce", 
    "Supply Chain Management", "Risk Management", "Product Management",
    "Brand Management", "Market Research", "Public Relations", 
    "Compliance", "Stakeholder Management", "Training and Development",
    "Business Strategy", "Change Management", "Quality Assurance",
    "Content Creation", "Event Planning", "Customer Experience",
    "Social Media Management", "Negotiation", "Innovation Management",
]

skills = [
    "Excel", "SQL", "Python", "Salesforce", 
    "Communication", "Negotiation", "Leadership", 
    "Marketing Strategy", "Data Visualization", 
    "Team Management", "Financial Analysis", "CRM Software", 
    "Presentation Skills", "Strategic Planning", "SEO",
    "Copywriting", "Data Mining", "Agile Methodologies", 
    "Problem Solving", "Risk Assessment", "Budgeting",
    "Interpersonal Skills", "Time Management", "Technical Writing",
    "Coaching", "Analytical Thinking", "Customer Relationship Management",
]

# Generate sample data for 100 profiles
for profile_id in range(100):
    profile_interests = random.sample(interests, k=random.randint(2, 4))  # Select 2 to 4 interests
    profile_skills = random.sample(skills, k=random.randint(3, 5))  # Select 3 to 5 skills
    profiles_data["Interests"].append(profile_interests)
    profiles_data["Skills"].append(profile_skills)

# Create DataFrame for profiles
profiles_df = pd.DataFrame(profiles_data)

# Convert lists to string representation
profiles_df['Interests'] = profiles_df['Interests'].apply(lambda x: str(x))
profiles_df['Skills'] = profiles_df['Skills'].apply(lambda x: str(x))

# Write to profiles CSV file in the current folder
profiles_df.to_csv('profiles.csv', index=False)

# Generate sample data for 30 users
users_data = {
    "User ID": list(range(30)),
    "Interests": [],
    "Skills": [],
    "Seen Profiles": []
}

for user_id in range(100):
    user_interests = random.sample(interests, k=random.randint(2, 4))  # Select 2 to 4 interests
    user_skills = random.sample(skills, k=random.randint(3, 5))  # Select 3 to 5 skills
    users_data["Interests"].append(user_interests)
    users_data["Skills"].append(user_skills)
    users_data["Seen Profiles"].append(random.sample(range(100), k=random.randint(0, 5)))  # Randomly select seen profiles

# Create DataFrame for users
users_df = pd.DataFrame(users_data)

# Convert lists to string representation
users_df['Interests'] = users_df['Interests'].apply(lambda x: str(x))
users_df['Skills'] = users_df['Skills'].apply(lambda x: str(x))
users_df['Seen Profiles'] = users_df['Seen Profiles'].apply(lambda x: str(x))

# Write to users CSV file in the current folder
users_df.to_csv('users.csv', index=False)

print("CSV files created in the current folder: profiles.csv and users.csv")