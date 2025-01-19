import os
import numpy as np
import pandas as pd
import ast
import logging
import joblib
from sklearn.metrics import mean_absolute_error, precision_score, recall_score, f1_score
from scipy.sparse import csr_matrix, find
from sklearn.model_selection import train_test_split

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class SimpleSVD:
    def __init__(self, num_features=2, initial_learning_rate=0.01, regularization=0.02, epochs=10):
        self.num_features = num_features
        self.initial_learning_rate = initial_learning_rate
        self.regularization = regularization
        self.epochs = epochs
        self.P = None
        self.Q = None

    def fit(self, R):
        self.num_users, self.num_items = R.shape
        np.random.seed(42)
        self.P = np.random.normal(scale=1. / self.num_features, size=(self.num_users, self.num_features))
        self.Q = np.random.normal(scale=1. / self.num_features, size=(self.num_items, self.num_features))

        for epoch in range(self.epochs):
            learning_rate = self.initial_learning_rate * (1 / (1 + 0.01 * epoch))
            total_error = 0
            total_ratings = 0
            
            for i in range(self.num_users):
                row, col, ratings = find(R[i, :])
                if len(ratings) == 0:
                    continue
                
                Q_subset = self.Q[col, :]
                eij = ratings - np.dot(self.P[i, :], Q_subset.T)
                total_ratings += len(ratings)

                self.P[i, :] += learning_rate * (np.dot(eij, Q_subset) - self.regularization * self.P[i, :])
                self.Q[col, :] += learning_rate * (np.multiply(eij[:, np.newaxis], self.P[i, :]) - self.regularization * Q_subset)

                total_error += np.sum(eij ** 2)

            average_error = total_error / total_ratings if total_ratings > 0 else 0
            logging.info(f"Epoch {epoch + 1}/{self.epochs}, Error: {average_error:.4f}")

    def predict(self, user, item):
        try:
            if self.P is None or self.Q is None:
                raise ValueError("Model not trained. Call fit() first.")
            if user >= self.P.shape[0] or item >= self.Q.shape[0]:
                raise IndexError("User or item index out of bounds")
            return float(np.dot(self.P[user, :], self.Q[item, :].T))
        except IndexError as e:
            logging.error(f"Invalid indices: user={user}, item={item}. Error: {str(e)}")
            return 0.0
        except Exception as e:
            logging.error(f"Prediction error: {str(e)}")
            return 0.0

    def recommend(self, user, n_recommendations=10, seen_items=None):
        if not isinstance(n_recommendations, int) or n_recommendations <= 0:
            raise ValueError("n_recommendations must be a positive integer")
            
        if seen_items is not None and not isinstance(seen_items, (list, np.ndarray)):
            raise ValueError("seen_items must be a list or numpy array")

        try:
            user_ratings = np.array([self.predict(user, item) for item in range(self.num_items)])
            
            if seen_items is not None:
                user_ratings[seen_items] = -np.inf

            recommended_indices = np.argsort(user_ratings)[::-1][:n_recommendations]
            return recommended_indices.tolist()
        except Exception as e:
            logging.error(f"Recommendation error: {str(e)}")
            return []

def calculate_weighted_similarity(user_interests, user_skills, profiles, interest_weight=1.0, skill_weight=1.0):
    try:
        similarities = []
        user_interests_set = set(user_interests)
        user_skills_set = set(user_skills)
        
        for profile in profiles:
            profile_interests = set(profile['Interests'])
            profile_skills = set(profile['Skills'])
            
            interest_score = len(user_interests_set & profile_interests) * interest_weight
            skill_score = len(user_skills_set & profile_skills) * skill_weight
            
            similarities.append(interest_score + skill_score)
            
        return similarities
    except Exception as e:
        logging.error(f"Error calculating similarities: {str(e)}")
        return [0] * len(profiles)

def jaccard_similarity(set1, set2):
    try:
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0
    except Exception as e:
        logging.error(f"Error calculating Jaccard similarity: {str(e)}")
        return 0

def normalize_scores(scores):
    try:
        scores = np.array(scores)
        min_score = np.min(scores)
        max_score = np.max(scores)
        range_score = max_score - min_score
        
        if range_score == 0:
            return np.zeros_like(scores)
            
        return (scores - min_score) / range_score
    except Exception as e:
        logging.error(f"Error normalizing scores: {str(e)}")
        return np.zeros_like(scores)

def calculate_classification_metrics(y_true, y_pred, threshold=0.5):
    try:
        y_pred_binary = (np.array(y_pred) >= threshold).astype(int)
        y_true_binary = (np.array(y_true) > 0).astype(int)

        precision = precision_score(y_true_binary, y_pred_binary, zero_division=0)
        recall = recall_score(y_true_binary, y_pred_binary, zero_division=0)
        f1 = f1_score(y_true_binary, y_pred_binary, zero_division=0)

        return precision, recall, f1
    except Exception as e:
        logging.error(f"Error calculating classification metrics: {str(e)}")
        return 0, 0, 0

def evaluate_model(R, svd_model):
    try:
        predictions = []
        actuals = []
        
        for i in range(R.shape[0]):
            row, col, ratings = find(R[i, :])
            if ratings.size == 0:
                continue
                
            predicted_ratings = [svd_model.predict(i, j) for j in col]
            predictions.extend(predicted_ratings)
            actuals.extend(ratings)

        actuals = np.array(actuals)
        predictions = np.array(predictions)

        mask = ~np.isnan(predictions)
        predictions = predictions[mask]
        actuals = actuals[mask]

        if len(actuals) == 0:
            return 0, 0, 0, 0, 0

        rmse = np.sqrt(np.mean((actuals - predictions) ** 2))
        mae = mean_absolute_error(actuals, predictions)
        precision, recall, f1 = calculate_classification_metrics(actuals, predictions)

        return rmse, mae, precision, recall, f1
    except Exception as e:
        logging.error(f"Error evaluating model: {str(e)}")
        return 0, 0, 0, 0, 0

def load_data(profiles_file, users_file):
    try:
        profiles_df = pd.read_csv(profiles_file)
        users_df = pd.read_csv(users_file)

        def convert_string_to_list(s):
            try:
                s = s.strip()
                s = s.replace("'", '"')
                return ast.literal_eval(s)
            except:
                try:
                    s = s.strip('[]')
                    return [item.strip().strip("'").strip('"') for item in s.split(',')]
                except:
                    return []

        for df in [profiles_df, users_df]:
            for col in ['Interests', 'Skills']:
                if col in df.columns:
                    df[col] = df[col].apply(convert_string_to_list)
        
        if 'Liked Profiles' in users_df.columns:
            users_df['Liked Profiles'] = users_df['Liked Profiles'].apply(convert_string_to_list)

        return profiles_df.to_dict(orient='records'), users_df.to_dict(orient='records')
    except Exception as e:
        logging.error(f"Error loading data: {str(e)}")
        return [], []
    
def grid_search_hyperparameters(X_train, y_train):
    try:
        param_grid = {
            'num_features': [2, 5],
            'initial_learning_rate': [0.01],
            'regularization': [0.01],
            'epochs': [10, 200]
        }
        
        best_params = None
        best_rmse = float('inf')

        for num_features in param_grid['num_features']:
            for learning_rate in param_grid['initial_learning_rate']:
                for regularization in param_grid['regularization']:
                    for epochs in param_grid['epochs']:
                        model = SimpleSVD(
                            num_features=num_features, 
                            initial_learning_rate=learning_rate,
                            regularization=regularization,
                            epochs=epochs
                        )
                        model.fit(X_train)
                        rmse, _, _, _, _ = evaluate_model(X_train, model)
                        
                        if rmse < best_rmse:
                            best_rmse = rmse
                            best_params = {
                                'num_features': num_features, 
                                'initial_learning_rate': learning_rate,
                                'regularization': regularization,
                                'epochs': epochs
                            }
        
        return best_params
    except Exception as e:
        logging.error(f"Error in grid search: {str(e)}")
        return {
            'num_features': 2,
            'initial_learning_rate': 0.01,
            'regularization': 0.01,
            'epochs': 10
        }

def split_data(R, test_size=0.4):
    try:
        train_data, test_data = train_test_split(
            R, test_size=test_size, random_state=42
        )
        return csr_matrix(train_data), csr_matrix(test_data)
    except Exception as e:
        logging.error(f"Error splitting data: {str(e)}")
        return csr_matrix(R), csr_matrix(R)

def recommend_users_for_profile(profile_id, profiles, content_weight=1.0):
    """Generate recommendations for a specific profile using only content-based filtering."""
    try:
        profile_index = next((index for (index, d) in enumerate(profiles) 
                            if d['Profile ID'] == profile_id), None)
        if profile_index is None:
            raise ValueError(f"Profile with ID {profile_id} not found.")

        profile = profiles[profile_index]

        # Calculate content-based scores
        interests_similarity = calculate_weighted_similarity(
            profile['Interests'], profile['Skills'], 
            profiles, interest_weight=0.6, skill_weight=0.4
        )
        normalized_scores = normalize_scores(interests_similarity)
        
        # Prepare results
        results = []
        for i, user in enumerate(profiles):
            if user['Profile ID'] != profile_id:  # Exclude self-recommendation
                results.append({
                    "User ID": user['Profile ID'],
                    "Score": normalized_scores[i],
                    "Matching Interests": set(profile['Interests']) & set(user['Interests']),
                    "Matching Skills": set(profile['Skills']) & set(user['Skills'])
                })
        
        results.sort(key=lambda x: x["Score"], reverse=True)
        
        # Log recommendations
        logging.info(f"Content-based recommendations for Profile ID {profile_id}:")
        for r in results[:10]:
            logging.info(
                f"User ID: {r['User ID']}, "
                f"Score: {r['Score']:.4f}, "
                f"Matching Interests: {r['Matching Interests']}, "
                f"Matching Skills: {r['Matching Skills']}"
            )
        
        return results
    except Exception as e:
        logging.error(f"Error generating recommendations: {str(e)}")
        return []

def main(profiles_file, users_file, profile_id_to_recommend_for):
    """Main function to run the recommendation system."""
    try:
        # Load data
        profiles, users = load_data(profiles_file, users_file)
        if not profiles:
            raise ValueError("Failed to load profiles data")

        logging.info("Using content-based recommendations only (no user interaction data available)")
        
        # Generate recommendations using content-based approach
        recommendations = recommend_users_for_profile(
            profile_id_to_recommend_for,
            profiles
        )

        return recommendations

    except Exception as e:
        logging.error(f"Error in main function: {str(e)}")
        return []

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('recommendation_system.log'),
            logging.StreamHandler()
        ]
    )

    # Set up file paths
    data_dir = os.path.join(os.getcwd(), 'Algorithm')
    profiles_file = os.path.join(data_dir, 'profiles.csv')
    users_file = os.path.join(data_dir, 'users.csv')
    
    # Example profile ID to recommend for
    profile_id_to_recommend_for = '6789e2290a5736bdfbf9b4bf'

    try:
        # Check if profiles file exists
        if not os.path.exists(profiles_file):
            raise FileNotFoundError(f"Profiles file not found: {profiles_file}")

        # Run the recommendation system
        recommendations = main(profiles_file, users_file, profile_id_to_recommend_for)

        # Print top recommendations
        if recommendations:
            print("\nTop Recommendations:")
            for i, rec in enumerate(recommendations[:10], 1):
                print(f"\n{i}. User ID: {rec['User ID']}")
                print(f"   Score: {rec['Score']:.4f}")
                print(f"   Matching Interests: {', '.join(rec['Matching Interests'])}")
                print(f"   Matching Skills: {', '.join(rec['Matching Skills'])}")
        else:
            print("No recommendations generated.")

    except Exception as e:
        logging.error(f"Program execution failed: {str(e)}")
        print(f"An error occurred. Please check the logs for details.")