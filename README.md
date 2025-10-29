# Gut2Go – Final Year Project  
![Gut2Go Logo](logo-placeholder.png)  

## Table of Contents  
1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Architecture & Technologies](#architecture-technologies)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation & Setup](#installation-setup)  
   - [Running the Application](#running-the-application)  
5. [Usage](#usage)  
   - [Doctor Dashboard (Web)](#doctor-dashboard-web)  
   - [Patient Portal (iOS App)](#patient-portal-ios-app)  
   - [Machine Learning / Analytics](#machine-learning-analytics)  
6. [Data & Models](#data-models)  
7. [API Reference](#api-reference)  
8. [Contributing](#contributing)  
9. [License](#license)  
10. [Acknowledgements](#acknowledgements)  

---

## Project Overview  
Gut2Go is a comprehensive system designed to assist patients with gastrointestinal conditions (such as IBS) and their healthcare providers. It consists of:  
- A **web dashboard** for doctors to manage patients, create meal/medication plans, monitor symptoms/adherence, and inspect analytics.  
- An **iOS patient portal app** to track symptoms, medication intake, food, and sync wearable health-data (via Apple HealthKit).  
- A backend API and data pipeline that integrates with Firebase, provides recommendations (via ML/NLP models), and sends notifications (via Twilio) to promote adherence and symptom support.  

---

## Features  
### Patient Portal (iOS)  
- Daily symptom logging (e.g., pain, bowel habits)  
- Medication intake tracking  
- Meal-plan tracking assigned by doctor  
- Apple HealthKit integration: collects heart-rate, sleep, stress metrics to enrich symptom context  
- Notification reminders (via Twilio) for medication, symptom logging and follow-ups  

### Doctor Dashboard (Web)  
- Authentication (Firebase) for doctors  
- View/manage patient profiles and history  
- Create & assign meal plans and medication plans  
- View patient symptom logs in chart/historical formats  
- Monitor medication adherence and overall trends  
- Machine learning suggestions: based on common symptoms/treatments the system proposes possible interventions  

### Analytics & ML  
- Reddit data scraping from IBS-related discussions  
- NLP pipeline for symptom & treatment extraction (custom NER model via spaCy)  
- Sentiment analysis and recommendation engine (suggests e.g., “Bananas tend to help with diarrhoea”)  
- Visualization of trend data, intervention effectiveness and patient adherence  

---

## Architecture & Technologies  
| Layer | Technologies |
|-------|-------------|
| Frontend (Doctor Dashboard) | Node.js backend API, Firebase Authentication & Firestore, Bootstrap (UI) |
| Mobile (Patient App) | iOS (Swift), Apple HealthKit integration, Firebase Sync |
| Backend API & Data Layer | Node.js, Express, Firebase Firestore, Firebase Functions |
| ML/NLP | Python, spaCy (custom NER model), scikit-learn/other ML for recommendation engine |
| Notifications | Twilio API for SMS/email reminders |
| Database | Firebase Firestore (for real-time & static data) |
| Deployment & DevOps | GitHub repository (this repo), version control, CI pipelines (optional) |

---

## Getting Started  

### Prerequisites  
- Xcode (for iOS app development)  
- Node.js & npm (for backend and web dashboard)  
- Firebase account & project (set up Firestore, Authentication)  
- Twilio account (for notification integration)  
- Python 3.x + pip (for ML/NLP scripts)  
- Optional: Apple Developer account (for HealthKit features)  

### Installation & Setup  
1. Clone this repository:  
   ```bash  
   git clone https://github.com/Robert-ctrlc/Gut2GoFYPFinal.git  
   cd Gut2GoFYPFinal  

