import pandas as pd
import re
import os
from sklearn.utils import resample
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, accuracy_score  # Import accuracy_score

current_directory = os.path.dirname(os.path.abspath(__file__))

# Define the relative path from the script's directory
train_path = os.path.join(current_directory, 'hate speech', 'train.csv')
test_path = os.path.join(current_directory, 'hate speech', 'test.csv')

# Read datasets
train = pd.read_csv(train_path)
test = pd.read_csv(test_path)
# print(f"Test Set Length: {len(test)}")

# Clean text function
def clean_text(df, text_field):
    df[text_field] = df[text_field].str.lower()
    df[text_field] = df[text_field].apply(lambda elem: re.sub(r"(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)|^rt|http.+?", "", elem))  
    return df

train_clean = clean_text(train, "tweet")
test_clean = clean_text(test, "tweet")

train_majority = train_clean[train_clean.label == 0]
train_minority = train_clean[train_clean.label == 1]

train_minority_upsampled = resample(train_minority, 
                                 replace=True,    
                                 n_samples=len(train_majority),   
                                 random_state=123)
train_upsampled = pd.concat([train_minority_upsampled, train_majority])

pipeline_sgd = Pipeline([ 
    ('vect', CountVectorizer()),
    ('tfidf', TfidfTransformer()),
    ('sgd', SGDClassifier()),
])

X_train, X_test, y_train, y_test = train_test_split(train_upsampled['tweet'],
                                                    train_upsampled['label'], random_state=123)

model = pipeline_sgd.fit(X_train, y_train)

y_predict = model.predict(X_test)

f1 = f1_score(y_test, y_predict)
accuracy = accuracy_score(y_test, y_predict)

# print(f"F1 Score: {f1}")
# print(f"Accuracy: {accuracy}")

def predict_hate_speech(input_text):
    cleaned_input = clean_text(pd.DataFrame({'tweet': [input_text]}), 'tweet')
    prediction = model.predict(cleaned_input['tweet'])
    
    return "Hate Speech" if prediction[0] == 1 else "Not Hate Speech"

# Process CSV file for prediction
def predict_from_csv(input_csv_path, output_csv_path):
    # Read input CSV
    input_df = pd.read_csv(input_csv_path)

    # Clean Title and Content fields (combine both fields for better prediction)
    input_df['text'] = input_df['Title'] + " " + input_df['Content']
    input_df = clean_text(input_df, 'text')

    # Predict hate speech for each row
    input_df['Prediction'] = input_df['text'].apply(lambda x: predict_hate_speech(x))

    # Create the output CSV format
    output_df = input_df[['ThreadId', 'Title', 'Content', 'Tags', 'Prediction']]

    # Save to the output CSV file
    output_df.to_csv(output_csv_path, index=False)
    return output_df

input_csv_path = os.path.join(current_directory, 'threads.csv')
output_csv_path = os.path.join(current_directory, 'output_threads.csv')
public_output_csv_path = os.path.join(current_directory,'..','Client','public', 'threads.csv')

predictions = predict_from_csv(input_csv_path, output_csv_path)

# Print or save predictions
# print(predictions)

# Optionally save to CSV
predictions.to_csv(public_output_csv_path, index=False)
print("Predictions saved to CSV file")