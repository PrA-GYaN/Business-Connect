import numpy as np
import pandas as pd
import ast
from sklearn.metrics import precision_score, recall_score, f1_score
import os
from scipy.sparse import csr_matrix, find
from sklearn.model_selection import train_test_split

class SimpleSVD:
    def __init__(self, num_features=2, initial_learning_rate=0.01, regularization=0.02, epochs=10):
        self.num_features = num_features
        self.initial_learning_rate = initial_learning_rate
        self.regularization = regularization
        self.epochs = epochs

    def fit(self, R):
        self.num_users, self.num_items = R.shape
        self.P = np.random.normal(scale=1. / self.num_features, size=(self.num_users, self.num_features))
        self.Q = np.random.normal(scale=1. / self.num_features, size=(self.num_items, self.num_features))

        for epoch in range(self.epochs):
            learning_rate = self.initial_learning_rate * (1 / (1 + 0.01 * epoch))
            total_error = 0
            
            for i in range(self.num_users):
                row, col, ratings = find(R[i, :])
                if len(ratings) == 0:
                    continue
                
                Q_subset = self.Q[col, :]
                eij = ratings - np.dot(self.P[i, :], Q_subset.T)

                self.P[i, :] += learning_rate * (eij.dot(Q_subset) - self.regularization * self.P[i, :])
                self.Q[col, :] += learning_rate * (eij[:, np.newaxis] * self.P[i, :] - self.regularization * Q_subset)

                total_error += np.sum(eij ** 2)

            average_error = total_error / len(ratings) if len(ratings) > 0 else 0
            print(f"Epoch {epoch + 1}/{self.epochs}, Error: {average_error:.4f}")

    def predict(self, user, item):
        try:
            return np.dot(self.P[user, :], self.Q[item, :].T)
        except:
            return 0

    def recommend(self, user, n_recommendations=10, seen_items=None):
        user_ratings = self.predict(user, np.arange(self.num_items))
        if seen_items is not None:
            user_ratings[seen_items] = -1

        recommended_indices = np.argsort(user_ratings)[::-1][:n_recommendations]
        final_recommendations = [
            index for index in recommended_indices 
            if index not in (seen_items or [])
        ]
        
        return final_recommendations[:n_recommendations]

def calculate_classification_metrics(y_true, y_pred):
    y_pred_binary = (y_pred >= 0.5).astype(int)  # Convert ratings to binary (like=1, not like=0)
    y_true_binary = (y_true >= 0.5).astype(int)  # Convert actual ratings to binary (like=1, not like=0)

    precision = precision_score(y_true_binary, y_pred_binary, zero_division=0)
    recall = recall_score(y_true_binary, y_pred_binary, zero_division=0)
    f1 = f1_score(y_true_binary, y_pred_binary, zero_division=0)

    return precision, recall, f1

def evaluate_model(R, svd_model):
    predictions = []
    actuals = []
    
    for i in range(R.shape[0]):
        row, col, ratings = find(R[i, :])
        if ratings.size == 0:
            continue
            
        predicted_ratings = svd_model.predict(i, col)
        predictions.extend(predicted_ratings)
        actuals.extend(ratings)

    actuals = np.array(actuals)
    predictions = np.array(predictions)

    mask = ~np.isnan(predictions)
    predictions = predictions[mask]
    actuals = actuals[mask]

    precision, recall, f1 = calculate_classification_metrics(actuals, predictions)

    return precision, recall, f1

def load_data(profiles_file, users_file):
    try:
        profiles_df = pd.read_csv(profiles_file)
        users_df = pd.read_csv(users_file)

        profiles_df['Interests'] = profiles_df['Interests'].apply(ast.literal_eval)
        profiles_df['Skills'] = profiles_df['Skills'].apply(ast.literal_eval)
        users_df['Interests'] = users_df['Interests'].apply(ast.literal_eval)
        users_df['Skills'] = users_df['Skills'].apply(ast.literal_eval)
        users_df['Liked Profiles'] = users_df['Liked Profiles'].apply(ast.literal_eval)

        return profiles_df.to_dict(orient='records'), users_df.to_dict(orient='records')
    except Exception as e:
        print(f"Error loading data: {e}")
        return [], []

def jaccard_similarity(set1, set2):
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union != 0 else 0

def calculate_weighted_similarity(user_interests, user_skills, profiles, interest_weight=1.0, skill_weight=1.0):
    weighted_similarities = []
    for profile in profiles:
        profile_interests_set = set(profile['Interests'])  # Convert to set
        profile_skills_set = set(profile['Skills'])  # Convert to set
        
        user_interests_set = set(user_interests)  # Convert to set
        user_skills_set = set(user_skills)  # Convert to set
        
        interest_similarity = len(user_interests_set.intersection(profile_interests_set)) / len(user_interests_set.union(profile_interests_set)) if len(user_interests_set.union(profile_interests_set)) != 0 else 0
        skill_similarity = len(user_skills_set.intersection(profile_skills_set)) / len(user_skills_set.union(profile_skills_set)) if len(user_skills_set.union(profile_skills_set)) != 0 else 0
        
        weighted_similarity = interest_weight * interest_similarity + skill_weight * skill_similarity
        weighted_similarities.append(weighted_similarity)
    
    return weighted_similarities

def normalize_scores(scores):
    min_score = min(scores)
    max_score = max(scores)
    return [(score - min_score) / (max_score - min_score) for score in scores]

def hybrid_recommendation(user, profiles, interest_weight=1.0, skill_weight=1.0):
    content_scores = calculate_weighted_similarity(user['Interests'], user['Skills'], profiles, interest_weight, skill_weight)
    jaccard_scores = []
    user_interests_set = set(user['Interests'])
    for profile in profiles:
        profile_interests_set = set(profile['Interests'])
        score = jaccard_similarity(user_interests_set, profile_interests_set)
        jaccard_scores.append(score)
    
    hybrid_scores = [(content_scores[i] + jaccard_scores[i]) / 2 for i in range(len(profiles))]
    return hybrid_scores

def analyze_recommendation(user, profiles, svd_model, interest_weight=0.6, skill_weight=0.4, content_weight=0.6, collaborative_weight=0.4):
    content_scores = calculate_weighted_similarity(user['Interests'], user['Skills'], profiles, interest_weight, skill_weight)
    normalized_content_scores = normalize_scores(content_scores)
    
    collaborative_scores = []
    for profile_index in range(len(profiles)):
        score = svd_model.predict(0, profile_index)
        collaborative_scores.append(score)
    
    normalized_collaborative_scores = normalize_scores(collaborative_scores)
    
    hybrid_scores = [
        (content_weight * normalized_content_scores[i] + collaborative_weight * normalized_collaborative_scores[i])
        for i in range(len(profiles))
    ]
    
    results = []
    for i, profile in enumerate(profiles):
        results.append({
            "Profile ID": profile['Profile ID'],
            "Content-Based Score": normalized_content_scores[i],
            "Collaborative Score": normalized_collaborative_scores[i],
            "Hybrid Score": hybrid_scores[i],
        })
    
    results.sort(key=lambda x: x["Hybrid Score"], reverse=True)
    
    print("Profile Contributions (60% Content-Based, 40% Collaborative):")
    for r in results[:10]:  # Only show top 10
        print(f"Profile ID: {r['Profile ID']}, "
              f"Content-Based: {r['Content-Based Score']:.4f}, "
              f"Collaborative: {r['Collaborative Score']:.4f}, "
              f"Hybrid: {r['Hybrid Score']:.4f}")
    
    return results

def split_data(R, test_size=0.4):
    train_data, test_data = train_test_split(R, test_size=test_size, random_state=42)
    return csr_matrix(train_data), csr_matrix(test_data)

def main(profiles_file, users_file, user_interests, user_skills):
    profiles, users = load_data(profiles_file, users_file)
    
    new_user = {
        'Interests': user_interests,
        'Skills': user_skills,
        'Liked Profiles': []
    }
    
    num_profiles = len(profiles)
    R = np.zeros((1, num_profiles))

    hybrid_scores = hybrid_recommendation(new_user, profiles)
    normalized_scores = normalize_scores(hybrid_scores)
    simulated_ratings = [
        1 if score > 0.5 else 0
        for score in normalized_scores
    ]
    
    R[0, :] = simulated_ratings
    R_sparse = csr_matrix(R)

    model_file_path = os.path.join(os.getcwd(), 'svd_model.joblib')

    if os.path.exists(model_file_path):
        print("Loading existing model...")
    else:
        existing_users = [user for user in users if user['Liked Profiles']]
        if existing_users:
            existing_R = np.zeros((len(existing_users), num_profiles))
            
            for user_index, user in enumerate(existing_users):
                hybrid_scores = hybrid_recommendation(user, profiles)
                normalized_scores = normalize_scores(hybrid_scores)
                simulated_ratings = [1 if score > 0.5 else 0 for score in normalized_scores]
                existing_R[user_index, :] = simulated_ratings
            
            existing_R_sparse = csr_matrix(existing_R)

            train_data, test_data = split_data(existing_R_sparse.toarray())

            svd = SimpleSVD(num_features=10, epochs=200)
            svd.fit(train_data)

            precision, recall, f1 = evaluate_model(test_data, svd)
            print(f"Test Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")

    analyze_recommendation(new_user, profiles, svd)
    
data_dir = os.path.join(os.getcwd(), 'Algorithm')

profiles_file = os.path.join(data_dir, 'profiles.csv')
users_file = os.path.join(data_dir, 'users.csv')
main(profiles_file, users_file, ['E-commerce', 'Content Creation', 'Social Media Marketing'], ['SEO', 'Data Analysis', 'Social Media Marketing'])