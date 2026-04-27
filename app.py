import os
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression

app = Flask(__name__)

# Career profiles: ideal skill benchmarks
CAREER_PROFILES = {
    "Data Scientist": {
        "CGPA": 8.0, "Coding": 8.5, "Communication": 6.5,
        "ProblemSolving": 8.5, "Creativity": 6.5, "Leadership": 5.5, "Projects": 4.0,
        "color": "#00d4ff",
        "icon": "🔬",
        "description": "Uncovers patterns and insights from complex datasets using statistics and ML.",
        "skills_needed": ["Python / R", "Machine Learning", "Statistics & Math", "SQL & Databases", "Data Visualization"],
        "growth_path": ["Junior Analyst", "Data Scientist", "Senior Data Scientist", "Lead Data Scientist", "Chief Data Officer"],
        "industries": ["Tech", "Finance", "Healthcare", "Research"],
        "avg_salary": "$105,000–$145,000"
    },
    "Software Engineer": {
        "CGPA": 7.5, "Coding": 8.5, "Communication": 5.5,
        "ProblemSolving": 7.5, "Creativity": 6.0, "Leadership": 5.0, "Projects": 3.5,
        "color": "#00ff9d",
        "icon": "💻",
        "description": "Designs, develops, and maintains scalable software systems and applications.",
        "skills_needed": ["Data Structures & Algorithms", "System Design", "Version Control (Git)", "Cloud Platforms", "Testing & CI/CD"],
        "growth_path": ["Junior Developer", "Software Engineer", "Senior Engineer", "Staff Engineer", "VP Engineering"],
        "industries": ["Tech", "Finance", "E-commerce", "Gaming"],
        "avg_salary": "$95,000–$140,000"
    },
    "Product Manager": {
        "CGPA": 7.0, "Coding": 4.5, "Communication": 8.5,
        "ProblemSolving": 7.5, "Creativity": 7.5, "Leadership": 8.5, "Projects": 2.5,
        "color": "#ff9f43",
        "icon": "📊",
        "description": "Drives product vision, roadmap, and cross-functional team alignment.",
        "skills_needed": ["Product Strategy", "User Research & UX", "Data Analysis", "Stakeholder Management", "Agile / Scrum"],
        "growth_path": ["Associate PM", "Product Manager", "Senior PM", "Director of Product", "Chief Product Officer"],
        "industries": ["Tech", "SaaS", "E-commerce", "Fintech"],
        "avg_salary": "$100,000–$150,000"
    },
    "Designer": {
        "CGPA": 6.5, "Coding": 3.0, "Communication": 7.0,
        "ProblemSolving": 6.5, "Creativity": 9.0, "Leadership": 5.5, "Projects": 3.0,
        "color": "#ff6b9d",
        "icon": "🎨",
        "description": "Creates compelling visual experiences and user-centered product interfaces.",
        "skills_needed": ["UI / UX Design", "Figma / Adobe XD", "Design Systems", "User Research", "Prototyping"],
        "growth_path": ["Junior Designer", "UI/UX Designer", "Senior Designer", "Design Lead", "Head of Design"],
        "industries": ["Tech", "Media", "Advertising", "Fashion"],
        "avg_salary": "$75,000–$120,000"
    }
}

FEATURE_COLS = ["CGPA", "Coding", "Communication", "ProblemSolving", "Creativity", "Leadership", "Projects"]
INTEREST_VALS = ["Tech", "Business", "Creative"]
CAREER_LABELS = ["Data Scientist", "Software Engineer", "Product Manager", "Designer"]


# model training
def train_model(df):
    le = LabelEncoder()
    df["Interest_enc"] = le.fit_transform(df["Interest"])

    X = df[FEATURE_COLS + ["Interest_enc"]].values
    y = df["Career"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = LogisticRegression(max_iter=1000)

    clf.fit(X_train, y_train)

    acc = accuracy_score(y_test, clf.predict(X_test))
    print(f"[ML] Model accuracy: {acc:.3f} | Training samples: {len(X_train)}")

    return clf, le, acc


# skill gap logic
def compute_skill_gaps(user_input, career_name):
    profile = CAREER_PROFILES[career_name]
    gaps = {}
    for feat in FEATURE_COLS:
        ideal = profile[feat]
        actual = user_input[feat]
        gap = max(0.0, ideal - actual)
        gaps[feat] = {"ideal": ideal, "actual": actual, "gap": round(gap, 2)}
    return gaps


# explanation generator
def generate_explanation(user_input, career_name, probability, feature_importances):
    feat_names = FEATURE_COLS + ["Interest"]
    profile = CAREER_PROFILES[career_name]

    strengths = []
    weaknesses = []

    checks = {
        "Coding":         ("coding skills", 7.0),
        "ProblemSolving": ("problem-solving ability", 7.0),
        "Communication":  ("communication skills", 7.0),
        "Creativity":     ("creativity", 7.0),
        "Leadership":     ("leadership potential", 7.0),
        "CGPA":           ("academic performance", 7.0),
        "Projects":       ("project experience", 3.0),
    }

    for feat, (label, threshold) in checks.items():
        ideal = profile[feat]
        actual = user_input[feat]
        if actual >= ideal * 0.9:
            strengths.append(label)
        elif actual < ideal * 0.7:
            weaknesses.append(label)

    strength_txt = ""
    if strengths:
        strength_txt = f"Your strong {', '.join(strengths[:3])} align well with this role. "
    weak_txt = ""
    if weaknesses:
        weak_txt = f"Improving your {', '.join(weaknesses[:2])} would significantly boost your fit. "

    interest_map = {"Data Scientist": "Tech", "Software Engineer": "Tech",
                    "Product Manager": "Business", "Designer": "Creative"}
    interest_match = user_input["Interest"] == interest_map.get(career_name, "")
    interest_txt = "Your interest area is a strong match. " if interest_match else "Exploring this interest area further will help. "

    score_txt = f"Overall match confidence: {round(probability * 100, 1)}%. "

    return score_txt + strength_txt + interest_txt + weak_txt


# Action plan generator
def generate_action_plan(user_input, career_name):
    profile = CAREER_PROFILES[career_name]
    plan = []

    if career_name == "Data Scientist":
        if user_input["Coding"] < 7:
            plan.append("Complete a Python for Data Science course (Coursera / edX)")
        if user_input["ProblemSolving"] < 7:
            plan.append("Practice daily LeetCode problems (focus on Arrays, DP)")
        plan.append("Build 2–3 end-to-end ML projects and publish on GitHub")
        plan.append("Learn SQL, Pandas, and Scikit-learn fundamentals")
        if user_input["Projects"] < 3:
            plan.append("Participate in Kaggle competitions to gain hands-on experience")

    elif career_name == "Software Engineer":
        if user_input["Coding"] < 7:
            plan.append("Master DSA: practice 150+ LeetCode problems (Easy → Hard)")
        plan.append("Build full-stack projects using React + Node.js or Django")
        plan.append("Contribute to open-source repositories on GitHub")
        if user_input["Projects"] < 3:
            plan.append("Develop 3 portfolio projects showcasing different tech stacks")
        plan.append("Study system design (Grokking the System Design Interview)")

    elif career_name == "Product Manager":
        if user_input["Communication"] < 7:
            plan.append("Join a Toastmasters club and practice public speaking weekly")
        plan.append("Read 'Inspired' by Marty Cagan and 'The Lean Startup'")
        plan.append("Shadow or assist a PM at a startup or internship")
        if user_input["Leadership"] < 7:
            plan.append("Lead a student club or organize a community project")
        plan.append("Learn tools: Jira, Figma, Mixpanel, and basic SQL analytics")

    elif career_name == "Designer":
        if user_input["Creativity"] < 7:
            plan.append("Complete a UI/UX bootcamp (Google UX Design Certificate)")
        plan.append("Master Figma: recreate 5 well-known app interfaces")
        plan.append("Build a Behance / Dribbble portfolio with 10+ case studies")
        if user_input["Projects"] < 3:
            plan.append("Take on freelance design gigs on Fiverr or Upwork")
        plan.append("Study design systems: Material Design, Apple HIG, Atlassian")

    plan.append(f"Connect with {career_name}s on LinkedIn and request informational interviews")
    return plan[:6]


# Load dataset
print("[Startup] Loading dataset from CSV...")

csv_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
df = pd.read_csv(csv_path)

print(f"[Startup] Dataset loaded: {csv_path} ({len(df)} rows)")

print("Logistic Regression Model...")
model, label_encoder, model_accuracy = train_model(df)
if hasattr(model, "feature_importances_"):
    feature_importances = model.feature_importances_.tolist()
elif hasattr(model, "coef_"):
    feature_importances = model.coef_[0].tolist()
else:
    feature_importances = []
print("[Startup] Model ready.")

# Routes
@app.route("/")
def index():
    return render_template("index.html", model_accuracy=round(model_accuracy * 100, 1))


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        user_input = {
            "CGPA":          float(data.get("CGPA", 7)),
            "Coding":        float(data.get("Coding", 7)),
            "Communication": float(data.get("Communication", 7)),
            "ProblemSolving":float(data.get("ProblemSolving", 7)),
            "Creativity":    float(data.get("Creativity", 7)),
            "Leadership":    float(data.get("Leadership", 7)),
            "Projects":      float(data.get("Projects", 3)),
            "Interest":      str(data.get("Interest", "Tech")),
        }

        interest_enc = label_encoder.transform([user_input["Interest"]])[0]
        X = np.array([[
            user_input["CGPA"], user_input["Coding"], user_input["Communication"],
            user_input["ProblemSolving"], user_input["Creativity"], user_input["Leadership"],
            user_input["Projects"], interest_enc
        ]])

        probas = model.predict_proba(X)[0]
        classes = model.classes_

        career_scores = sorted(
            zip(classes, probas), key=lambda x: x[1], reverse=True
        )

        top3 = []
        for career, prob in career_scores[:3]:
            profile = CAREER_PROFILES[career]
            gaps = compute_skill_gaps(user_input, career)
            explanation = generate_explanation(user_input, career, prob, feature_importances)
            action_plan = generate_action_plan(user_input, career)

            match_score = min(100, int(prob * 100 * 1.25 + np.random.uniform(-2, 2)))
            match_score = max(10, match_score)

            top3.append({
                "career":       career,
                "probability":  round(float(prob), 4),
                "match_score":  match_score,
                "color":        profile["color"],
                "icon":         profile["icon"],
                "description":  profile["description"],
                "skill_gaps":   gaps,
                "skills_needed":profile["skills_needed"],
                "growth_path":  profile["growth_path"],
                "industries":   profile["industries"],
                "avg_salary":   profile["avg_salary"],
                "explanation":  explanation,
                "action_plan":  action_plan,
            })

        return jsonify({
            "success": True,
            "top_careers": top3,
            "model_accuracy": round(model_accuracy * 100, 1),
            "user_input": user_input
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
