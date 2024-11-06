# Business Networking Platform

A professional networking platform designed to help business people connect with each other based on shared interests and skills. The platform enables users to expand their professional network, schedule meetings, and engage in meaningful conversations within the community.

## Features

### 1. **Signup & Login**
- **Phone Verification via WhatsApp**: Users can sign up and verify their phone number using the WhatsApp API, ensuring secure and easy verification with OTP (One-Time Password).
- **Login**: Users can log in using their phone number and password. Optionally, consider offering a social login option (e.g., Google, LinkedIn) for convenience.
  
### 2. **Home Page**
- **User Posts Feed**: View posts from connections and engage with content shared by others.
- **Customizable Feed**: Posts can be filtered by topics, skills, or industries of interest.

### 3. **Connections Page**
- **Swiping Interface**: Users can swipe to connect with recommended people based on shared interests, expertise, and location.
- **Profile Previews**: Quick access to a preview of the person's profile, including job title, skills, and location.

### 4. **Messages Page**
- **Real-Time Messaging**: Communicate with connections via direct messaging, with read receipts and typing indicators.
- **Meeting Scheduling**: Schedule meetings directly through the messaging interface. Optionally integrates with external calendar tools like Google Calendar, Zoom, or Microsoft Teams.

### 5. **Meetings Page**
- **View & Manage Meetings**: View all upcoming meetings, accept/reject invitations, and schedule new meetings.
- **Meeting History**: Track past meetings and conversations with connections.
- **Reminders & Notifications**: Receive automatic reminders for scheduled meetings.

### 6. **Notifications Page**
- **Real-Time Notifications**: Receive updates for new messages, meeting invites, connection requests, and more.
- **Customizable Alerts**: Users can tailor notifications to receive only the types of alerts that matter to them.

### 7. **Community Page**
- **Ask & Answer Questions**: Users can post business-related questions and answer others' questions.
- **Discussion Threads**: Participate in discussions within a community of business professionals.
- **Upvoting & Endorsements**: Users can upvote helpful answers and endorse others' skills or responses.

### 8. **Profile Page**
- **View & Edit Profile**: Users can view and edit their professional profile, including personal information, skills, interests, and projects.
- **Privacy Settings**: Control who can view your profile and activities.
- **Portfolio/Projects**: Showcase business achievements, projects, and work samples.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) - Ensure you have Node.js and npm installed.
- [MongoDB](https://www.mongodb.com/) - For database storage (or any other database you are using).
- [Twilio API or WhatsApp API](https://www.twilio.com/whatsapp) - To handle phone number verification via WhatsApp.

### Steps to Run Locally

1. Clone this repository:

   ```bash
   git clone https://github.com/PrA-GYaN/Final-Year-Project.git
   ```

2. Navigate into the project directory:

   ```bash
   cd Final-Year-Project
   ```

3. Install dependencies:

   ```bash
   cd Client
   npm install
   cd ..
   cd server
   npm install
   ```

4. Set up environment variables (in .env file):

   ```bash
   PORT=5000
   MONGO_DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_URL=your-cloudinary-url
   ```

5. Start the Server:

   ```bash
   npm start
   ```

6. WhatsApp API Setup:

   ```bash
   i. Open WhatsApp on Your Mobile:
   ii. Launch the WhatsApp app on your mobile device.
   iii. Open WhatsApp on Your Mobile:
       - Go to Linked Devices:
       For Android: Tap the three dots (menu) in the top-right corner of the screen and select "Linked devices".
       For iPhone: Tap Settings in the bottom-right corner, then select "Linked Devices".
   iv. Link Your Device:
       Tap "Link a Device" on your phone.
   v. Scan the QR code displayed on the Server Console using your phone’s camera.
   ```

7. Start the Client:

   ```bash
   npm run dev
   ```

8. Visit the app in your browser:

   ```bash
   http://localhost:5173
   ```

## Technologies Used

- **Frontend**: React.js & CSS (for a dynamic and responsive user interface)
- **Backend**: Node.js + Express (for handling API requests)
- **Database**: MongoDB (for storing user data and interactions)
- **Authentication**: JSON Web Tokens (JWT) for secure login and session management
- **SMS/WhatsApp Verification**: WhatsApp API for phone number verification using OTP
- **WebSockets**: For real-time messaging and notifications

## Features to Add

- **Upload Video:**: Allow users to upload videos to our platform. 
- **Gamification**: Implement a reward system for users who engage actively in the community or network.

## Contributing

We welcome contributions to improve the platform! If you'd like to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Make your changes and commit them (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.