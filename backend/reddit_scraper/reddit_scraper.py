import praw
import firebase_admin
from firebase_admin import credentials, firestore
import json
import time

# Initialize Reddit
reddit = praw.Reddit(
    client_id="5UoNa5wALr7y4fjlcKcM9g",
    client_secret="8jXbrFHaL1s1NH8_8d2_S2_5vM3Geg",
    user_agent="gut2go_scraper"
)

# Initialize Firebase
cred = credentials.Certificate("../secrets/gut2gofypfinal-945d770b0216.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Subreddits to scrape
subreddits = ["ibs", "fodmap", "guthealth"]

# Keyword list to match relevant posts
keywords = ["bloating", "diarrhea", "constipation", "probiotics", "low FODMAP", "gut pain"]

# Sentiment analysis function 
def analyze_sentiment(text):
    return 0  # Placeholder for sentiment analysis

# Function to scrape Reddit and save posts
def scrape_reddit():
    data = []

    for subreddit_name in subreddits:
        subreddit = reddit.subreddit(subreddit_name)
        posts = subreddit.new(limit=250)  # Get the most recent 100 posts

        for post in posts:
            post_text = f"{post.title} {post.selftext}".lower()

            # Match keywords in posts
            matched_keywords = [kw for kw in keywords if kw in post_text]
            if matched_keywords:
                sentiment_score = analyze_sentiment(post.selftext)

                # Get comments
                post.comments.replace_more(limit=0)
                comments_data = []
                for comment in post.comments[:5]:
                    comments_data.append({
                        "text": comment.body,
                        "sentiment_score": analyze_sentiment(comment.body),
                        "upvotes": comment.score
                    })

                post_data = {
                    "title": post.title,
                    "content": post.selftext[:300] + "...",  # Limiting to first 300 chars
                    "subreddit": subreddit_name,
                    "upvotes": post.score,
                    "comments_count": post.num_comments,
                    "sentiment_score": sentiment_score,
                    "keywords_matched": matched_keywords,
                    "timestamp": time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(post.created_utc)),
                    "comments": comments_data
                }

                # Add to data list
                data.append(post_data)

                # Save to Firebase
                db.collection("reddit_data").add(post_data)
                print(f"✅ Saved post: {post.title[:50]}... ({len(comments_data)} comments)")

    # Save data to JSON file
    with open("reddit_data.json", "w") as f:
        json.dump(data, f, indent=4)

    print(f"✅ Scraped {len(data)} relevant posts. Saved to reddit_data.json")

if __name__ == "__main__":
    scrape_reddit()


