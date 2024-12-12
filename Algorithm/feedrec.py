import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Function to load threads from CSV
def load_threads_from_csv(filename):
    threads_df = pd.read_csv(filename)
    threads = {
        'threadId': threads_df['threadId'].tolist(),
        'title': threads_df['title'].tolist(),
        'description': threads_df['description'].tolist(),
        'tags': threads_df['tags'].tolist()
    }
    return threads

# Function to create combined text for each thread (description + tags)
def create_thread_texts(threads):
    return [f"{desc} {tag}" for desc, tag in zip(threads['description'], threads['tags'])]

# Function to create the TF-IDF matrix
def create_tfidf_matrix(post_texts):
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    return tfidf_vectorizer.fit_transform(post_texts), tfidf_vectorizer

# Function to compute cosine similarity matrix
def compute_cosine_similarity(tfidf_matrix):
    return cosine_similarity(tfidf_matrix, tfidf_matrix)

# Function to calculate interaction strength
def calculate_interaction_strength(user_interactions, threads):
    interaction_strength = {post_id: 0 for post_id in threads['threadId']}
    for post_id, interaction in zip(user_interactions['postid'], user_interactions['interactions']):
        post_id = int(post_id)
        if interaction == 'upvote':
            interaction_strength[post_id] += 2
        elif interaction == 'comment':
            interaction_strength[post_id] += 1
    return interaction_strength

# Function to calculate user similarity with threads based on interests and skills
def calculate_user_similarity(user_data, tfidf_vectorizer, threads):
    user_query = " ".join(user_data['interests'] + user_data['skills'])
    user_tfidf_vector = tfidf_vectorizer.transform([user_query])
    user_sim_scores = cosine_similarity(user_tfidf_vector, tfidf_matrix).flatten()
    sorted_posts_by_interests = sorted(
        zip(threads['threadId'], user_sim_scores), key=lambda x: x[1], reverse=True
    )
    return sorted_posts_by_interests

# Function to generate final post recommendations based on similarity and interactions
def generate_recommendations(sorted_posts_by_interests, interaction_strength):
    adjusted_recommendations = sorted(
        sorted_posts_by_interests, key=lambda x: (interaction_strength[x[0]], x[1]), reverse=True
    )
    recommended_posts = [post[0] for post in adjusted_recommendations]
    return recommended_posts

# Main recommendation function
def recommend_for_user(user_data, user_interactions, threads_filename=r'E:\Final-Year-Project\Algorithm\threads.csv'):
    # Load the threads data from CSV
    threads = load_threads_from_csv(threads_filename)
    
    # Create the combined text for threads (description + tags)
    post_texts = create_thread_texts(threads)
    
    # Create the TF-IDF matrix for the threads
    tfidf_matrix, tfidf_vectorizer = create_tfidf_matrix(post_texts)
    
    # Calculate the cosine similarity between threads
    cosine_sim = compute_cosine_similarity(tfidf_matrix)
    
    # Calculate the interaction strength based on user actions
    interaction_strength = calculate_interaction_strength(user_interactions, threads)
    
    # Calculate the similarity between user query (interests + skills) and threads
    sorted_posts_by_interests = calculate_user_similarity(user_data, tfidf_vectorizer, threads)
    
    # Generate the final recommendations based on similarity and interactions
    recommended_posts = generate_recommendations(sorted_posts_by_interests, interaction_strength)
    
    return recommended_posts, threads

# Define user data and interactions (this can also be loaded from a CSV if needed)
user_data = {
    'interests': ['Music', 'Entrepreneurship', 'Leadership', 'Marketing Trends'],
    'skills': ['Marketing', 'SEO', 'UX/UI Design', 'Networking']
}

user_interactions = {
    'postid': ['1', '3', '5'],
    'interactions': ['upvote', 'comment', 'upvote']
}

# Get the recommended posts
recommended_posts, threads = recommend_for_user(user_data, user_interactions)

# Print the recommended posts for the user
print("Recommended posts for the user based on interests, skills, and interactions:")
for post_id in recommended_posts:
    post_title = threads['title'][threads['threadId'].index(post_id)]
    print(f"- {post_title}")