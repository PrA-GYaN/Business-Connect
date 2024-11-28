import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Sample posts dataset (items)
posts_data = {
    'item_id': [1, 2, 3, 4, 5],
    'title': [
        'Machine Learning in Healthcare',
        'Artificial Intelligence for Beginners',
        'Deep Learning and Neural Networks',
        'The Future of AI in Automation',
        'AI and Data Science: An Overview'
    ],
    'description': [
        'This article discusses how machine learning is revolutionizing the healthcare industry.',
        'Introduction to AI concepts, including algorithms and applications.',
        'Deep dive into neural networks and deep learning models.',
        'Exploring the future role of AI in various industries like automation.',
        'A beginner-friendly guide to AI, machine learning, and data science.'
    ],
    'tags': [
        'machine learning, healthcare, AI',
        'artificial intelligence, beginner, AI concepts',
        'deep learning, neural networks, AI',
        'AI, automation, future',
        'data science, AI, machine learning'
    ]
}

# Sample user interaction data (user actions on posts)
user_interactions = {
    'item_id': [1, 3, 2, 4, 5],
    'interaction': ['upvote', 'comment', 'upvote', 'downvote', 'upvote']
}

# Create DataFrames for posts and interactions
posts_df = pd.DataFrame(posts_data)
interactions_df = pd.DataFrame(user_interactions)

# Step 1: Combine the title, description, and tags to form a content-based profile for each item
posts_df['content'] = posts_df['title'] + " " + posts_df['description'] + " " + posts_df['tags']

# Step 2: Convert the text content to a numerical representation using TF-IDF Vectorizer
tfidf_vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf_vectorizer.fit_transform(posts_df['content'])

# Step 3: Calculate cosine similarity between posts based on their content
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Step 4: Define the recommendation function based on user interactions (handling new users)
def recommend_based_on_interactions(user_id, interactions_df, cosine_sim, posts_df, top_n=3):
    # Step 1: Check if the user has any interaction data
    interacted_posts = interactions_df[interactions_df['user_id'] == user_id]['item_id'].tolist()

    if not interacted_posts:
        # If no interactions, recommend posts based on content similarity (cold start)
        sim_scores = []
        for idx in range(len(posts_df)):
            sim_scores.extend(list(enumerate(cosine_sim[idx])))
        
        # Step 2: Sort the similarity scores in descending order
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Step 3: Get the top N recommended posts (exclude duplicates)
        recommended_posts = []
        seen_items = set()
        
        for score in sim_scores:
            item_idx = score[0]
            item_id = posts_df.iloc[item_idx]['item_id']
            
            # Exclude duplicates
            if item_id not in seen_items:
                recommended_posts.append(posts_df.iloc[item_idx])
                seen_items.add(item_id)
            
            if len(recommended_posts) >= top_n:
                break

        return pd.DataFrame(recommended_posts)[['item_id', 'title', 'description', 'tags']]
    
    else:
        # If user has interacted with posts, proceed with the normal recommendation logic
        sim_scores = []
        for item_id in interacted_posts:
            idx = posts_df.index[posts_df['item_id'] == item_id].tolist()[0]
            sim_scores.extend(list(enumerate(cosine_sim[idx])))

        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        recommended_posts = []
        seen_items = set()

        for score in sim_scores:
            item_idx = score[0]
            item_id = posts_df.iloc[item_idx]['item_id']
            
            # Exclude the posts the user has already interacted with and avoid duplicates
            if item_id not in interacted_posts and item_id not in seen_items:
                recommended_posts.append(posts_df.iloc[item_idx])
                seen_items.add(item_id)
            
            if len(recommended_posts) >= top_n:
                break

        return pd.DataFrame(recommended_posts)[['item_id', 'title', 'description', 'tags']]

# Example: Recommend posts for a new user (user 4) with no interactions
recommended_items_new_user = recommend_based_on_interactions( interactions_df, cosine_sim, posts_df, top_n=3)

# Display the recommended items for the new user
print("Recommended Posts for User:")
print(recommended_items_new_user)