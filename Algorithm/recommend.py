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

def calculate_similarity(user, profile, interest_weight=1.0, skill_weight=1.0):
    interest_score = len(set(user['Interests']) & set(profile['Interests'])) * interest_weight
    skill_score = len(set(user['Skills']) & set(profile['Skills'])) * skill_weight
    return interest_score + skill_score

def load_data(profiles_file):
    profiles_df = pd.read_csv(profiles_file)
    profiles_df['Interests'] = profiles_df['Interests'].apply(ast.literal_eval)
    profiles_df['Skills'] = profiles_df['Skills'].apply(ast.literal_eval)
    return profiles_df.to_dict(orient='records')

def main(profiles_file, user_interests, user_skills):
    profiles = load_data(profiles_file)
    
    new_user = {'Interests': user_interests, 'Skills': user_skills}
    
    num_profiles = len(profiles)
    R = np.zeros((1, num_profiles))

    similarity_scores = [calculate_similarity(new_user, profile) for profile in profiles]

    normalized_scores = [(score - min(similarity_scores)) / (max(similarity_scores) - min(similarity_scores)) for score in similarity_scores]

    simulated_ratings = [max(0, min(5, int(score * 5))) for score in normalized_scores]

    R[0, :] = simulated_ratings
    R_sparse = csr_matrix(R)

    svd = SimpleSVD()
    svd.fit(R_sparse)

    recommended_indices = svd.recommend(0, n_recommendations=10)
    
    recommended_profiles = [profiles[i]['Profile ID'] for i in recommended_indices]
    
    # Ensure only the JSON result is printed
    return json.dumps(recommended_profiles)

# Example usage
if __name__ == "__main__":
    profiles_file = r'E:\Final-Year-Project\Algorithm\profiles.csv'

    # Ensure input is valid JSON
    user_interests = json.loads(sys.argv[1])  # Load as JSON
    user_skills = json.loads(sys.argv[2])     # Load as JSON

    result = main(profiles_file, user_interests, user_skills)
    
    # Only print the JSON result
    print(result)