# advanced-url-shortener-app

## Overview

This project provides a URL shortening service with built-in analytics tracking. Users can shorten URLs, track clicks, analyze user interactions, and gather detailed analytics data. The system supports a rate-limiting mechanism, geolocation data, device information, and operating system details.

### Features:

- Shorten URLs
- Track URL clicks and analytics (device type, OS, location)
- Cache results using Redis for quick access
- Analytics for specific topics and overall URL usage

---

## Setup

### Prerequisites:

- MongoDB
- Redis

### Environment Variables:

Create a `.env` file and add the following environment variables:

```plaintext
MONGO_URI=mongodb://localhost:27017/url-shortener
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=YOUR_GOOGLE_CALLBACK_URL
SESSION_SECRET=YOUR_SESSION_SECRET
PORT=YOUR_PORT
```

---


**NOTE:**
- For now, you need to copy and paste the cookie from the browser into the request header to access some API routes.
- Currently, user details are being accessed directly from the cookie.

---


## Routes

### **Authentication:**

- **GET** `/auth/google`  
  Initiates the Google OAuth login process.  

  - Request:  
    Redirects the user to the Google login page to authenticate using their Google account.  

    Query parameters:  
    - `scope`: Specifies the access scope required (e.g., `profile`, `email`).  

  Example:  
  ```bash
  GET /api/auth/google
  ```

  - Response:  
    Redirects the user to the Google login page. Upon successful authentication, the user is redirected to the specified callback URL (configured in the `.env` file under `GOOGLE_CALLBACK_URL`).  

### URL Shortening:

- **POST** `/url/shorten` - Shorten a long URL

  - Request body:
    ```json
    {
      "longUrl": "some long url",
      "customAlias": "custom-alias",
      "topic": "some-topic"
    }
    ```
  - Response:
    ```json
    {
      "shortUrl": "short-url",
      "createdAt": "2025-01-01T12:00:00Z"
    }
    ```

- **GET** `/url/:alias` - Redirect to the long URL
  - Redirects the user to the original long URL.

### Analytics:

- **GET** `/analytics/topic/:topic` - Get analytics for a specific topic

  - Response:
    ```json
    {
      "totalClicks": 100,
      "uniqueUsers": 80,
      "clicksByDate": [
        { "date": "2025-01-12", "clicks": 50 },
        { "date": "2025-01-13", "clicks": 50 }
      ],
      "urls": [
        {
          "shortUrl": "http://short.url/alias1",
          "totalClicks": 50,
          "uniqueUsers": 40
        }
      ]
    }
    ```

- **GET** `/analytics/overall` - Get overall user analytics

  - Response:
    ```json
    {
      "totalClicks": 500,
      "uniqueUsers": 350,
      "clicksByDate": [
        { "date": "2025-01-12", "clicks": 250 },
        { "date": "2025-01-13", "clicks": 250 }
      ],
      "osType": [
        { "osName": "Windows", "uniqueClicks": 200, "uniqueUsers": 150 },
        { "osName": "Linux", "uniqueClicks": 100, "uniqueUsers": 80 }
      ],
      "deviceType": [
        { "deviceName": "Desktop", "uniqueClicks": 400, "uniqueUsers": 300 },
        { "deviceName": "Mobile", "uniqueClicks": 100, "uniqueUsers": 80 }
      ]
    }
    ```

- **GET** `/analytics/url/:alias` - Get analytics for a specific short URL
  - Response:
    ```json
    {
      "totalClicks": 150,
      "uniqueUsers": 120,
      "clicksByDate": [
        { "date": "2025-01-12", "clicks": 75 },
        { "date": "2025-01-13", "clicks": 75 }
      ],
      "osType": [
        { "osName": "Windows", "uniqueClicks": 50, "uniqueUsers": 40 },
        { "osName": "Linux", "uniqueClicks": 30, "uniqueUsers": 20 }
      ],
      "deviceType": [
        { "deviceName": "Desktop", "uniqueClicks": 120, "uniqueUsers": 100 },
        { "deviceName": "Mobile", "uniqueClicks": 30, "uniqueUsers": 20 }
      ]
    }
    ```

---

---

## Rate Limiting

To avoid abuse, rate limiting is applied to the shortening route using `rateLimiter`. This ensures that users can only make a limited number of requests in a given timeframe.

---

## Running the Project Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/skarthik05/advanced-url-shortener-app
   cd advanced-url-shortener-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up MongoDB and Redis (ensure they are running locally or using cloud services).

4. Create a `.env` file in the root directory with the required environment variables:

   ```env
   MONGO_URI=<your-mongo-uri>
   REDIS_HOST=<your-redis-host>
   SESSION_SECRET=<your-session-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_CALLBACK_URL=<your-google-callback-url>
   ```

5. To run the project in development mode (with auto-reloading):

   ```bash
   npm run start:dev
   ```

6. To run the project in production mode:

   ```bash
   npm start
   ```

7. Run tests (if you want to test the application before running it):
   ```bash
   npm test
   ```

---

If you prefer to run the application in a Docker container, follow these steps:

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone https://github.com/skarthik05/advanced-url-shortener-app
   cd advanced-url-shortener-app
   ```

2. **Build the Docker image**:
   From the project root, run the following command to build the Docker image:

   ```bash
   docker build -t advanced-url-shortener-app .
   ```

3. **Run the Docker container**:
   After the image is built, you can run the application inside a Docker container:

   ```bash
   docker run -p 80:80 --env-file .env advanced-url-shortener-app
   ```

   - `-p 80:80`: Maps port 80 inside the container to port 80 on your host machine.
   - `--env-file .env`: Ensures your environment variables are passed into the container (make sure your `.env` file is present in the project root).

4. **Access the application**:
   Once the container is running, you can access the application via `http://localhost` in your browser.

---

### Base URL

Once the application is up and running, the base URL for API requests will be:
```
<your base url>/api
```

For example, if running locally, you can make API requests to:
```
http://localhost/api
```




