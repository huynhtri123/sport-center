# 🏟️ Sport Center Management

**Sport Center Management** is a web application for managing sports centers.  
It allows users to **book sports courts in real-time**, participate in tournaments, view sports courses, and provides admins with a **full-featured dashboard** to manage sports, courts, bookings, users, and revenue – **and more**.


Built with **Spring Boot (backend)**, **React (frontend)**, and **MongoDB (database)**.

---

## 🚀 Demo / Screenshot
<p float="left">
  <img src="https://github.com/user-attachments/assets/0a7a6a62-2562-496f-a795-719b1a2702de" width="400" />
  <img src="https://github.com/user-attachments/assets/e1aefd36-85da-4fed-a352-c2c39e019716" width="400" />
</p>
<p float="left">
  <img src="https://github.com/user-attachments/assets/2808d819-ae95-4368-a869-cb864b00d5ed" width="400" />
  <img src="https://github.com/user-attachments/assets/e4612d16-1992-486c-837f-b9debc23383f" width="400" />
</p>
<p float="left">
  <img src="https://github.com/user-attachments/assets/76530dad-8041-45c6-9554-09a9d83e62ca" width="400" />
  <img src="https://github.com/user-attachments/assets/767b24b1-9323-4a67-bba4-79ca888a720f" width="400" />
</p>



---

## ⚙️ System Architecture

- **Backend:** Spring Boot, Spring Security & JWT, Spring Data MongoDB, REST API, WebSocket, Kafka, Validation, Mail, Thymeleaf, Cloudinary  
- **Frontend:** React, React Router, Axios, React Hooks, Ant Design, Material-UI, Bootstrap, Recharts & Chart.js, React Toastify, WebSocket (SockJS + STOMP)  
- **Database:** MongoDB  
- **AI Module:** Uses machine learning (Random Forest) to predict court booking likelihood based on input data, encouraging users to book and applying appropriate discounts to help balance booking rates  
- **Deployment:** [https://huynhtri123.github.io/sport-center/](https://huynhtri123.github.io/sport-center/) (Initial load may take a few minutes due to cold start on free backend hosting)

```mermaid
flowchart LR
User -->|UI| React
React -->|API| SpringBoot
SpringBoot --> MongoDB
SpringBoot -->|API| AI_Module[AI Prediction]
```
