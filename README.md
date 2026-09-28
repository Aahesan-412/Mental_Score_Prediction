# Mental Health Score Predictor

**Live Demo:** https://mental-score-prediction-rzro.onrender.com

## Overview

Mental Health Score Predictor is a machine learning web application that estimates a student's mental health score based on their social media habits, lifestyle, and academic profile. The project explores a question that is increasingly relevant today: how do daily digital habits, sleep, stress, and physical activity relate to a student's overall mental well-being?

The user enters a few simple details through a clean web form, and the trained model instantly returns a predicted mental health score.

## The Problem

Students today spend a large part of their day on social media, often at the cost of sleep, study time, and physical activity. While it is widely believed that heavy social media use affects mental health, the effect is hard to measure because many factors interact with each other. This project uses machine learning to capture those patterns from data and turn them into a practical, easy-to-use prediction tool.

## What the Model Predicts

The model is a regression model. Instead of classifying a student into a category, it predicts a continuous numeric mental health score. A higher or lower score reflects better or worse estimated well-being, based on the patterns the model learned from the training data.

## Input Features

The prediction is based on the following information about the student:

- **Demographics:** age, gender, country
- **Academic profile:** academic level (High School, Undergraduate, Graduate)
- **Social media behavior:** most used platform, purpose of use (networking, education, entertainment, news), average daily usage hours, and number of daily phone unlocks
- **Lifestyle habits:** study hours, physical activity hours, and sleep hours per night
- **Self-reported stress level:** Low, Medium, High, or Very High

Countries are also grouped into major regions with an "Other" category, which helps the model handle countries that appear rarely in the data.

## How It Works

1. The dataset is cleaned and prepared, with categorical features encoded and numerical features processed.
2. A machine learning regression model is trained on the prepared data to learn the relationship between the input features and the mental health score.
3. The trained model is saved and integrated into a FastAPI backend.
4. When a user submits the form, the backend validates the input (for example, hours must be between 0 and 24), passes it to the model, and returns the predicted score.
5. The frontend displays the result immediately.

## Tech Stack

- **Machine Learning:** Python, Pandas, Scikit-learn
- **Backend:** FastAPI, Pydantic (input validation)
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Docker, Render

## Key Learnings

This project covers the complete machine learning lifecycle, from data preparation and model training to building an API, designing a user interface, containerizing the application, and deploying it live for anyone to use.

## Disclaimer

This project is built for learning and demonstration purposes only. The predicted score is a statistical estimate based on patterns in a dataset. It is not a medical diagnosis and should not replace advice from a qualified mental health professional.

## Author

**Aehsan Ali Sunasara**
AI/ML Engineer | BCA Graduate

- GitHub: https://github.com/Aahesan-412
- LinkedIn: https://www.linkedin.com/in/aehsanalisunasara