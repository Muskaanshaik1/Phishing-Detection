import pandas as pd

df = pd.read_csv("sms_data.csv")

# Normalize labels
df["label"] = df["label"].str.strip().str.lower()

print("Before cleaning:")
print(df["label"].value_counts())

# Keep only valid rows
df = df[df["label"].isin(["ham", "spam"])]

print("\nAfter cleaning:")
print(df["label"].value_counts())

df.to_csv("sms_data_clean.csv", index=False)
print("\n✅ Clean dataset saved as sms_data_clean.csv")
