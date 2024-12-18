import sys
import numpy as np
import pandas as pd
import ast
import json
from scipy.sparse import csr_matrix

class SimpleSVD:
    def __init__(self, num_features=2, learning_rate=0.01, regularization=0.02, epochs=100):
        self.num_features = num_features
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.epochs = epochs

    def fit(self, R):
        self.num_users, self.num_items = R.shape
        self.P = np.random.normal(scale=1. / self.num_features, size=(self.num_users, self.num_features))
        self.Q = np.random.normal(scale=1. / self.num_features, size=(self.num_items, self.num_features))

        for epoch in range(self.epochs):
            total_error = 0
            for i in range(self.num_users):
                row, col = R[i, :].nonzero()
                if col.size == 0:
                    continue
                Q_subset = self.Q[col]
                ratings = R[i, col].toarray().flatten()

                eij = ratings - np.dot(self.P[i, :], Q_subset.T)

                self.P[i, :] += self.learning_rate * (eij.dot(Q_subset) - self.regularization * self.P[i, :])
                self.Q[col, :] += self.learning_rate * (eij[:, np.newaxis] * self.P[i, :] - self.regularization * Q_subset)

                total_error += np.sum(eij ** 2)

    def predict(self, user, item):
        return np.dot(self.P[user, :], self.Q[item, :].T)

    def recommend(self, user, n_recommendations=5, seen_items=None):
        user_ratings = self.predict(user, np.arange(self.num_items))
        if seen_items is not None:
            user_ratings[seen_items] = -1

        recommended_indices = np.argsort(user_ratings)[::-1][:n_recommendations]
        return recommended_indices

def calculate_similarity(user, profile, business_weight=1.0):
    """
    Calculate similarity between the user's business profile and a given business profile.
    """
    # Business-specific features (Operational Focus, Technologies, etc.)
    operational_focus_score = len(set(user['Operational Focus']) & set(profile['Operational Focus'])) * business_weight
    technologies_score = len(set(user['Technologies']) & set(profile['Technologies'])) * business_weight
    business_models_score = len(set(user['Business Models']) & set(profile['Business Models'])) * business_weight
    strategic_goals_score = len(set(user['Strategic Goals']) & set(profile['Strategic Goals'])) * business_weight
    performance_metrics_score = len(set(user['Performance Metrics']) & set(profile['Performance Metrics'])) * business_weight
    industry_focus_score = len(set(user['Industry Focus']) & set(profile['Industry Focus'])) * business_weight

    return operational_focus_score + technologies_score + business_models_score + strategic_goals_score + \
           performance_metrics_score + industry_focus_score

def load_data(profiles_file):
    """
    Load business profiles (including business-specific fields).
    """
    profiles_df = pd.read_csv(profiles_file)
    profiles_df['Operational Focus'] = profiles_df['Operational Focus'].apply(ast.literal_eval)
    profiles_df['Technologies'] = profiles_df['Technologies'].apply(ast.literal_eval)
    profiles_df['Business Models'] = profiles_df['Business Models'].apply(ast.literal_eval)
    profiles_df['Strategic Goals'] = profiles_df['Strategic Goals'].apply(ast.literal_eval)
    profiles_df['Performance Metrics'] = profiles_df['Performance Metrics'].apply(ast.literal_eval)
    profiles_df['Industry Focus'] = profiles_df['Industry Focus'].apply(ast.literal_eval)
    return profiles_df.to_dict(orient='records')

def main(profiles_file, user_operational_focus, user_technologies, user_business_models, user_strategic_goals, 
         user_performance_metrics, user_industry_focus):
    """
    For business profiles, use additional fields to calculate similarity and recommend.
    """
    profiles = load_data(profiles_file)
    
    # User business profile
    new_user = {
        'Operational Focus': user_operational_focus, 
        'Technologies': user_technologies, 
        'Business Models': user_business_models, 
        'Strategic Goals': user_strategic_goals, 
        'Performance Metrics': user_performance_metrics, 
        'Industry Focus': user_industry_focus
    }

    num_profiles = len(profiles)
    R = np.zeros((1, num_profiles))

    # Calculate similarity scores
    similarity_scores = [calculate_similarity(new_user, profile) for profile in profiles]

    # Normalize similarity scores (for ratings)
    normalized_scores = [(score - min(similarity_scores)) / (max(similarity_scores) - min(similarity_scores)) for score in similarity_scores]

    # Simulate ratings based on normalized similarity scores
    simulated_ratings = [max(0, min(5, int(score * 5))) for score in normalized_scores]

    R[0, :] = simulated_ratings
    R_sparse = csr_matrix(R)

    # Perform matrix factorization using SVD
    svd = SimpleSVD()
    svd.fit(R_sparse)

    # Get recommended profiles
    recommended_indices = svd.recommend(0, n_recommendations=10)
    
    # Return Profile IDs of recommended business profiles
    recommended_profiles = [profiles[i]['Profile ID'] for i in recommended_indices]
    return json.dumps(recommended_profiles)

# Example usage
if __name__ == "__main__":
    profiles_file = r'E:\Final-Year-Project\Algorithm\business_profiles.csv'

    # Ensure input is valid JSON
    user_operational_focus = json.loads(sys.argv[1])  # Load as JSON
    user_technologies = json.loads(sys.argv[2])  # Load as JSON
    user_business_models = json.loads(sys.argv[3])  # Load as JSON
    user_strategic_goals = json.loads(sys.argv[4])  # Load as JSON
    user_performance_metrics = json.loads(sys.argv[5])  # Load as JSON
    user_industry_focus = json.loads(sys.argv[6])  # Load as JSON

    result = main(profiles_file, user_operational_focus, user_technologies, user_business_models, 
                  user_strategic_goals, user_performance_metrics, user_industry_focus)
    
    # Only print the JSON result
    print(result)
