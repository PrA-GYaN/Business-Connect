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
    """Load and process data from CSV files."""
    try:
        # Read profiles data
        profiles_df = pd.read_csv(profiles_file)
        
        # Read users data, skipping the problematic second header row
        users_df = pd.read_csv(users_file, skiprows=[1])
        
        # Function to safely convert string to list
        def convert_string_to_list(s):
            try:
                # Remove any whitespace and replace single quotes with double quotes
                s = s.strip()
                s = s.replace("'", '"')
                return ast.literal_eval(s)
            except:
                # If conversion fails, try splitting by comma
                try:
                    # Remove brackets and split
                    s = s.strip('[]')
                    return [item.strip().strip("'").strip('"') for item in s.split(',')]
                except:
                    return []

        # Convert string representations of lists to actual lists
        for df in [profiles_df, users_df]:
            for col in ['Interests', 'Skills']:
                if col in df.columns:
                    df[col] = df[col].apply(convert_string_to_list)
        
        # Convert Liked Profiles to list
        if 'Liked Profiles' in users_df.columns:
            users_df['Liked Profiles'] = users_df['Liked Profiles'].apply(convert_string_to_list)

        # Rename User ID to Profile ID in users_df if needed
        if 'User ID' in users_df.columns and 'Profile ID' not in users_df.columns:
            users_df = users_df.rename(columns={'User ID': 'Profile ID'})

        return profiles_df.to_dict(orient='records'), users_df.to_dict(orient='records')
    except Exception as e:
        logging.error(f"Error loading data: {str(e)}")
        logging.error(f"Stack trace: ", exc_info=True)
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
def recommend_users_for_profile(profile_id, profiles, svd_model, 
                              interest_weight=0.6, skill_weight=0.4,
                              content_weight=0.6, collaborative_weight=0.4):
    """Generate recommendations using hybrid approach combining content-based and collaborative filtering."""
    try:
        # Find profile index
        profile_index = next((index for (index, d) in enumerate(profiles) 
                            if d['Profile ID'] == profile_id), None)
        if profile_index is None:
            raise ValueError(f"Profile with ID {profile_id} not found.")

        profile = profiles[profile_index]

        # 1. Calculate content-based scores
        content_scores = calculate_weighted_similarity(
            profile['Interests'], profile['Skills'], 
            profiles, interest_weight, skill_weight
        )
        normalized_content_scores = normalize_scores(content_scores)
        
        # 2. Calculate collaborative filtering scores
        collaborative_scores = []
        for user_index in range(len(profiles)):
            try:
                score = svd_model.predict(profile_index, user_index)
                collaborative_scores.append(score)
            except Exception as e:
                logging.warning(f"Error predicting for user {user_index}: {str(e)}")
                collaborative_scores.append(0)
        
        normalized_collaborative_scores = normalize_scores(collaborative_scores)
        
        # 3. Combine scores using weighted approach
        results = []
        for i, user in enumerate(profiles):
            if user['Profile ID'] != profile_id:  # Exclude self-recommendation
                # Calculate hybrid score
                hybrid_score = (
                    content_weight * normalized_content_scores[i] +
                    collaborative_weight * normalized_collaborative_scores[i]
                )
                
                # Get matching interests and skills for explanation
                matching_interests = set(profile['Interests']) & set(user['Interests'])
                matching_skills = set(profile['Skills']) & set(user['Skills'])
                
                results.append({
                    "User ID": user['Profile ID'],
                    "Content-Based Score": normalized_content_scores[i],
                    "Collaborative Score": normalized_collaborative_scores[i],
                    "Hybrid Score": hybrid_score,
                    "Matching Interests": matching_interests,
                    "Matching Skills": matching_skills
                })
        
        # Sort by hybrid score
        results.sort(key=lambda x: x["Hybrid Score"], reverse=True)
        
        # Log recommendations
        logging.info(f"Hybrid recommendations for Profile ID {profile_id}:")
        for r in results[:10]:
            logging.info(
                f"\nUser ID: {r['User ID']}"
                f"\nHybrid Score: {r['Hybrid Score']:.4f}"
                f"\nContent-Based Score: {r['Content-Based Score']:.4f}"
                f"\nCollaborative Score: {r['Collaborative Score']:.4f}"
                f"\nMatching Interests: {r['Matching Interests']}"
                f"\nMatching Skills: {r['Matching Skills']}"
            )
        
        return results
    except Exception as e:
        logging.error(f"Error generating recommendations: {str(e)}")
        logging.error("Stack trace:", exc_info=True)
        return []

def print_recommendations(recommendations):
    """Helper function to print recommendations in a readable format."""
    if not recommendations:
        print("No recommendations generated.")
        return

    print("\nTop Recommendations:")
    for i, rec in enumerate(recommendations[:10], 1):
        print(f"\n{i}. User ID: {rec['User ID']}")
        print(f"   Hybrid Score: {rec['Hybrid Score']:.4f}")
        print(f"   Content-Based Score: {rec['Content-Based Score']:.4f}")
        print(f"   Collaborative Score: {rec['Collaborative Score']:.4f}")
        print(f"   Matching Interests: {', '.join(rec['Matching Interests'])}")
        print(f"   Matching Skills: {', '.join(rec['Matching Skills'])}")


def main(profiles_file, users_file, profile_id_to_recommend_for):
    """Main function to run the recommendation system."""
    try:
        # Load data
        profiles, users = load_data(profiles_file, users_file)
        if not profiles:
            raise ValueError("Failed to load profiles data")

        logging.info(f"Loaded {len(profiles)} profiles and {len(users)} users")
        
        # Create initial ratings matrix
        num_profiles = len(profiles)
        
        # Create user-item interaction matrix from Liked Profiles
        existing_R = np.zeros((len(users), num_profiles))
        
        # Create profile ID to index mapping
        profile_id_to_index = {p['Profile ID']: i for i, p in enumerate(profiles)}
        
        # Fill interaction matrix
        for user_index, user in enumerate(users):
            if 'Liked Profiles' in user:
                for liked_profile in user['Liked Profiles']:
                    if liked_profile in profile_id_to_index:
                        existing_R[user_index, profile_id_to_index[liked_profile]] = 1

        # Convert to sparse matrix and split data
        existing_R_sparse = csr_matrix(existing_R)
        train_data, test_data = split_data(existing_R_sparse.toarray())

        # Find best hyperparameters
        logging.info("Performing grid search for hyperparameters...")
        best_params = grid_search_hyperparameters(train_data, train_data)
        logging.info(f"Best Hyperparameters: {best_params}")

        # Train model with best parameters
        svd = SimpleSVD(
            num_features=best_params['num_features'],
            initial_learning_rate=best_params['initial_learning_rate'],
            regularization=best_params['regularization'],
            epochs=best_params['epochs']
        )
        svd.fit(train_data)

        # Generate recommendations using hybrid approach
        recommendations = recommend_users_for_profile(
            profile_id_to_recommend_for,
            profiles,
            svd,
            interest_weight=0.6,
            skill_weight=0.4,
            content_weight=0.6,
            collaborative_weight=0.4
        )

        return recommendations

    except Exception as e:
        logging.error(f"Error in main function: {str(e)}")
        logging.error(f"Stack trace: ", exc_info=True)
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