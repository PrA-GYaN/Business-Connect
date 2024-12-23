import pandas as pd

# Users data
users_data = [
    {"User ID": 1, "Interests": ["Data Science", "E-commerce"], "Skills": ["Python", "Data Analysis"], "Seen Profiles": [2]},
    {"User ID": 2, "Interests": ["AI", "Content Creation"], "Skills": ["Machine Learning", "Writing"], "Seen Profiles": [3]},
    {"User ID": 3, "Interests": ["Marketing", "Social Media"], "Skills": ["SEO", "Presentation Skills"], "Seen Profiles": [4, 5]},
]

# Profiles data
profiles_data = [
    {"Profile ID": 1, "Interests": ["E-commerce", "Retail"], "Skills": ["Sales", "Negotiation"]},
    {"Profile ID": 2, "Interests": ["Data Science", "ML"], "Skills": ["Python", "Statistics"]},
    {"Profile ID": 3, "Interests": ["Content Creation", "Video"], "Skills": ["Editing", "Writing"]},
    {"Profile ID": 4, "Interests": ["Marketing", "SEO"], "Skills": ["SEO", "Google Ads"]},
    {"Profile ID": 5, "Interests": ["Social Media", "Ads"], "Skills": ["Instagram", "Analytics"]},
]

# Convert to DataFrames
users_df = pd.DataFrame(users_data)
profiles_df = pd.DataFrame(profiles_data)

# Save to CSV
data_dir = "Algorithm"  # Directory to save the files
users_file = f"{data_dir}/users.csv"
profiles_file = f"{data_dir}/profiles.csv"

# Ensure the directory exists
import os
os.makedirs(data_dir, exist_ok=True)

# Write to CSV
users_df.to_csv(users_file, index=False)
profiles_df.to_csv(profiles_file, index=False)

print(f"Users file saved to: {users_file}")
print(f"Profiles file saved to: {profiles_file}")
