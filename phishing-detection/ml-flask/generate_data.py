import random
import pandas as pd

rows = []

for _ in range(1000):
    url_length = random.randint(20, 120)
    valid_url = random.choice([0, 1])
    at_symbol = random.choice([0, 1])
    sensitive_words_count = random.randint(0, 4)
    path_length = random.randint(0, 80)
    isHttps = random.choice([0, 1])
    nb_dots = random.randint(1, 6)
    nb_hyphens = random.randint(0, 4)
    nb_and = random.randint(0, 2)
    nb_or = random.randint(0, 2)
    nb_www = random.randint(0, 1)
    nb_com = random.randint(0, 1)
    nb_underscore = random.randint(0, 3)

    # 🔴 RULE-BASED LABEL (IMPORTANT)
    target = 1 if (
        at_symbol == 1 or
        sensitive_words_count >= 2 or
        isHttps == 0 and nb_hyphens >= 2
    ) else 0

    rows.append([
        url_length, valid_url, at_symbol, sensitive_words_count,
        path_length, isHttps, nb_dots, nb_hyphens, nb_and,
        nb_or, nb_www, nb_com, nb_underscore, target
    ])

columns = [
    "url_length","valid_url","at_symbol","sensitive_words_count",
    "path_length","isHttps","nb_dots","nb_hyphens","nb_and",
    "nb_or","nb_www","nb_com","nb_underscore","target"
]

df = pd.DataFrame(rows, columns=columns)
df.to_csv("phishing_urls.csv", index=False)

print("✅ Dataset generated with", len(df), "rows")
