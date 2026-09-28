# Mental Health Score Predictor

**Live Demo:** https://mental-score-prediction-rzro.onrender.com

> **Note:** This app is hosted on a free plan. If it has been idle, the first load may take around 20-30 seconds while the server wakes up.

## Overview

Mental Health Score Predictor is a machine learning web application that estimates a student's mental health score from their social media habits, lifestyle, and academic profile. It explores a question that matters today: how do digital habits, sleep, stress, and physical activity relate to a student's well-being?

The user fills in a simple web form, and the trained model instantly returns a predicted mental health score.

## Dataset

The model is trained on the *Student Social Media and Mental Health Impact* dataset, which contains 5,000 student records with 12 input features and one target, the mental health score (ranging from about 3.6 to 9.4). The data had no missing values, and two duplicate rows were removed.

## Input Features

- **Demographics:** age, gender, country
- **Academic profile:** academic level (High School, Undergraduate, Graduate)
- **Social media behavior:** most used platform, purpose of use, average daily usage hours, daily phone unlocks
- **Lifestyle:** study hours, physical activity hours, sleep hours per night
- **Stress level:** Low, Medium, High, or Very High

## Methodology

1. **Exploratory Data Analysis:** studied the score distribution, correlations between numeric features, and how stress, screen time, and sleep relate to the score. Checked outliers with the IQR method and analysed skewness.
2. **Data Cleaning:** removed duplicate rows and corrected unrealistic negative values in physical activity hours.
3. **Feature Engineering:** grouped the countries into the top 10 plus an "Other" category to reduce noise from rarely occurring countries.
4. **Preprocessing:** built a scikit-learn pipeline that log-transforms and scales the skewed study hours feature, scales the other numeric features, ordinal-encodes stress level (Low < Medium < High < Very High), and one-hot encodes categorical features.
5. **Modeling:** trained a Linear Regression baseline and a Random Forest Regressor on a 70/30 train-test split, with the preprocessing and model combined in a single pipeline.
6. **Hyperparameter Tuning:** ran RandomizedSearchCV with 5-fold cross-validation over the number of trees, tree depth, and minimum samples per split and leaf.

## Model Performance

| Model | Test R² | MAE | RMSE |
|-------|---------|-----|------|
| Linear Regression (baseline) | 0.74 | 0.54 | 0.68 |
| **Random Forest** | **0.88** | **0.35** | **0.46** |
| Random Forest (tuned) | 0.87 | 0.36 | 0.48 |

Random Forest clearly outperforms the linear baseline because it captures non-linear relationships between features such as stress, sleep, and screen time. The Random Forest explains about 88% of the variation in mental health scores, and its predictions are off by only about 0.35 points on average. Hyperparameter tuning produced a similar score while reducing overfitting.

## Tech Stack

- **Machine Learning:** Python, Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn
- **Backend:** FastAPI, Pydantic
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Docker, Render

## Disclaimer

This project is for learning and demonstration only. The predicted score is a statistical estimate based on patterns in a dataset. It is not a medical diagnosis and should not replace advice from a qualified mental health professional.

## Author

**Aehsan Ali Sunasara**, AI/ML Engineer

- GitHub: https://github.com/Aahesan-412
- LinkedIn: https://www.linkedin.com/in/aehsanalisunasara