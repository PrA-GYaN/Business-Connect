import pandas as pd
import random
import os

# Random seed for reproducibility
random.seed(42)

# Function to generate random interests and skills
def generate_random_interests_skills():
    interests = ['E-commerce', 'Content Creation', 'Social Media Marketing', 'AI', 'Machine Learning', 'Data Science', 
                 'Web Development', 'Cloud Computing', 'Digital Marketing', 'SEO', 'Graphic Design', 'UX/UI Design']
    skills = ['SEO', 'Python', 'Data Analysis', 'Deep Learning', 'JavaScript', 'Node.js', 'AWS', 'Google Analytics', 
              'Photoshop', 'Figma', 'HTML', 'CSS', 'TensorFlow', 'Java', 'PHP', 'Content Writing', 'Social Media Marketing']
    
    random_interests = random.sample(interests, k=random.randint(2, 4))
    random_skills = random.sample(skills, k=random.randint(2, 4))
    
    return random_interests, random_skills

# Generate Users and corresponding Profiles
users_data = []
profiles_data = []
for user_id in range(1, 180):  # 200 users
    interests, skills = generate_random_interests_skills()
    
    # The user's interests and skills match the profile's interests and skills
    users_data.append({
        'User ID': user_id,
        'Interests': interests,
        'Skills': skills,
        'Liked Profiles': random.sample(range(1, 1001), k=random.randint(3, 10))  # Liked profiles between 3 and 10
    })
    
    profiles_data.append({
        'Profile ID': user_id,  # Profile ID matches User ID
        'Interests': interests,
        'Skills': skills
    })

# Convert to DataFrames
users_df = pd.DataFrame(users_data)
profiles_df = pd.DataFrame(profiles_data)

# Save to CSV
data_dir = './Algorithm/'  # Change directory as needed
os.makedirs(data_dir, exist_ok=True)

users_file = os.path.join(data_dir, 'users.csv')
profiles_file = os.path.join(data_dir, 'profiles.csv')

users_df.to_csv(users_file, index=False)
profiles_df.to_csv(profiles_file, index=False)

print(f"Generated synthetic users dataset and profiles dataset with matching Profile IDs.")