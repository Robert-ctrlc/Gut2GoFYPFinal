def custom_tokenizer(text):
    return [token.strip() for token in text.lower().split(",")]
