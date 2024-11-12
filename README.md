# Interview.ai 🤖

Interview.ai is an autonomous AI-driven agent designed to conduct mock interviews based on specific job descriptions.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **Autonomous Mock Interviews**: Conducts mock interviews based on the provided job description
- **Real-Time Feedback**: Provides instant analysis and insights to help candidates improve
- **Voice Interaction Support**: Allows candidates to respond to questions via voice, enhancing realism
- **Job-Specific Interview Questions**: Tailored questions to closely match job requirements
- **Downloadable Feedback**: Exports feedback as a PDF or DOCX document for future reference

## 🛠️ Tech Stack

### Core Technology
- Framework: Next.js (v14.2.16)
- Language: TypeScript (v5)

### Key Libraries
- Authentication: Clerk
- Voice Recognition: Deepgram
- Storage: AWS S3
- AI Responses: Groq
- PDF Generation: PDF-lib

### UI and Styling
- Data Visualization: Recharts
- UI Components: Shadcn, Tailwind CSS

## 🚀 Getting Started

### Prerequisites

To run this project, you will need:
- Node.js (v16 or later)
- npm or yarn for managing dependencies
- An AWS S3 bucket for storing user data securely
- API keys for Groq, Deepgram, and Clerk

### Setup Guide

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PranitPatil03/interview.ai.git
   cd interview.ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add:
   ```env
   # Clerk Authentication Keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=your_clerk_sign_in_url
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=your_clerk_sign_up_url
   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=your_clerk_sign_in_force_redirect_url
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=your_clerk_sign_up_force_redirect_url

   # AWS S3 Configuration
   NEXT_PUBLIC_S3_BUCKET_NAME=your_s3_bucket_name
   NEXT_PUBLIC_AWS_REGION=your_aws_region
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_aws_access_key_id
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 💻 Usage

1. **User Authentication**: Sign up or log in using Clerk authentication
2. **Input Job Description**: Start a new interview session by entering the job description
3. **Mock Interview**: The AI agent will ask job-specific questions. Answer each question by typing or using voice input
4. **Feedback**: At the end of the interview, download feedback as a PDF or DOCX document

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

