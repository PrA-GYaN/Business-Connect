import pandas as pd
import re
import joblib
import sys  # To handle command-line arguments

# File paths for saving the model
MODEL_FILE = r".\Algorithm\hate_speech_model.joblib"

# Function to clean text
def clean_text(df, text_field):
    df[text_field] = df[text_field].str.lower()
    df[text_field] = df[text_field].apply(lambda elem: re.sub(r"(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)|^rt|http.+?", "", elem))  
    return df

# Load the model
try:
    # print("Attempting to load the model...")
    model = joblib.load(MODEL_FILE)
    # print("Model loaded successfully!")
except FileNotFoundError:
    # print("Model not found. Exiting the program.")
    sys.exit(1)

# Function to predict hate speech from title and content
def predict_hate_speech(title, content):
    # Concatenate title and content into one text input
    combined_text = title + " " + content
    cleaned_input = clean_text(pd.DataFrame({'tweet': [combined_text]}), 'tweet')
    
    # Predict the class of the combined text (title + content)
    prediction = model.predict(cleaned_input['tweet'])
    return "Hate Speech" if prediction[0] == 1 else "Not Hate Speech"

# Main entry point for the script
if __name__ == "__main__":
    # if len(sys.argv) < 3:
    #     print("Please provide both title and content as arguments.")
    #     sys.exit(1)

    title = sys.argv[1]
    content = sys.argv[2]

    result = predict_hate_speech(title, content)
    print(result)
