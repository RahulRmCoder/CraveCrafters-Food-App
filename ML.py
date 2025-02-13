import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")  # Adjust with your MongoDB connection string if different
db = client['craveCraftersDB']  # Replace with your actual database name
dishes_collection = db['dishes']  # Replace with your actual collection name

# Fetch data from MongoDB
data = list(dishes_collection.find({}, {'_id': 0, 'name': 1, 'category': 1, 'tags': 1}))  # Fetch relevant fields
df = pd.DataFrame(data)

# Ensure 'tags' is a space-separated string for each dish
df['tags'] = df['tags'].apply(lambda x: " ".join(x) if isinstance(x, list) else x)

# Combine category and tags as a single text field for feature generation
df['combined_features'] = df['category'] + " " + df['tags']

# Vectorize the combined text data and compute cosine similarity
vectorizer = CountVectorizer().fit_transform(df['combined_features'])
similarity_matrix = cosine_similarity(vectorizer)

# Convert similarity matrix to JSON format for easier integration
similarity_data = {}
for idx, row in df.iterrows():
    similarity_data[row['name']] = {df.iloc[i]['name']: float(similarity_matrix[idx][i]) for i in range(len(df))}

# Save the similarity matrix as JSON
with open('dish_similarity.json', 'w') as f:
    json.dump(similarity_data, f)

print("Similarity data saved to dish_similarity.json")
