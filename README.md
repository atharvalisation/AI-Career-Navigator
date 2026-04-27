# AI Career Navigator

## Overview
AI Career Navigator is a machine learning-based web application that recommends suitable career paths based on a user’s skills and interests.  
The system not only predicts careers but also provides meaningful insights such as skill gap analysis, explanations, and actionable improvement plans.


## Features
- Career prediction (Top 3 recommendations)
- Match score (percentage)
- Skill gap analysis
- Explanation of results
- Action plan for improvement
- Web-based interface using Flask


## Working

### Flow
User Input → Data Processing → Machine Learning Model → Prediction → Analysis → Output

### Steps
1. User enters skill details (CGPA, Coding, Communication, etc.)
2. Input data is preprocessed and encoded
3. Logistic Regression model predicts probabilities
4. Top 3 careers are selected
5. System generates:
   - Skill gaps
   - Explanation
   - Action plan



## Technology Stack

### Backend
- Python
- Flask

### Machine Learning
- scikit-learn

### Libraries
- NumPy
- Pandas

### Frontend
- HTML
- CSS
- JavaScript



## Project Structure

project/
│
├── app.py  
├── dataset.csv  
├── templates/  
│   └── index.html  
├── static/  
└── README.md  



## Setup Instructions

### 1. Clone Repository
git clone https://github.com/your-username/ai-career-navigator.git  
cd ai-career-navigator  

### 2. Install Dependencies
pip install flask numpy pandas scikit-learn  

### 3. Run Application
python app.py  

### 4. Open in Browser
http://127.0.0.1:5000  



## Dataset
The dataset is stored in dataset.csv and includes:

- CGPA  
- Coding  
- Communication  
- Problem Solving  
- Creativity  
- Leadership  
- Projects  
- Interest  
- Career (target)



## Machine Learning Model

Model Used: Logistic Regression  

### Process
- Label Encoding for categorical data  
- Train-Test Split (80/20)  
- Model Training  
- Accuracy Evaluation  

Accuracy: approximately 85–90%



## Core Modules

### Skill Gap Analysis
Compares user skills with ideal career requirements and identifies gaps.

### Explanation Generator
Provides reasoning behind the predicted career using strengths and weaknesses.

### Action Plan Generator
Suggests steps to improve and achieve the recommended career.



## Output

Career: Software Engineer  
Match Score: 87%  

Strengths: Coding, Problem Solving  
Weakness: Communication  

Suggestions:  
- Practice DSA  
- Build projects  
- Improve communication skills  

## Home Page :
<img width="1834" height="935" alt="image" src="https://github.com/user-attachments/assets/c4568820-b0c6-407b-ac9a-4c5b72e38519" />

## Skill and Career Matches
<img width="1825" height="975" alt="image" src="https://github.com/user-attachments/assets/12760263-6af3-4b3e-85c0-eb83e9ea66a1" />
<img width="1796" height="939" alt="image" src="https://github.com/user-attachments/assets/ccc5fc7c-306b-483d-894d-cdaa0319b219" />

## AI Reasoning
<img width="1313" height="684" alt="image" src="https://github.com/user-attachments/assets/5623dfdd-49f7-461a-9871-071e12615bac" />

## Action Plan
<img width="1298" height="704" alt="image" src="https://github.com/user-attachments/assets/34417fba-964c-4a20-b917-285fdaee33c2" />

## Career Path and Suggestions
<img width="1320" height="859" alt="image" src="https://github.com/user-attachments/assets/4941f927-3f13-4e80-9193-1525ea7fc597" />

## What If Simulator
<img width="1325" height="445" alt="image" src="https://github.com/user-attachments/assets/1bb78261-5b80-4467-b319-5b19f9d6e248" />



## Future Scope
- Use real-world datasets  
- Add more career options  
- Improve model (XGBoost, Neural Networks)  
- Add user login and tracking  
- Add visualization dashboards  



## Conclusion
This project demonstrates how machine learning can be used to provide personalized career guidance.  
It combines prediction with actionable insights, making it practical and user-focused.



## Author
Atharva Mane
