# URL Shortener Service

A URL shortening service developed in Node.js using Express and Sequelize with SQLite. This project allows you to create short URLs, list all shortened URLs, delete URLs, and redirect to the original URLs.

## Features

- **POST /**: Creates a short URL.
- **GET /:id**: Redirects to the original URL based on the provided ID.
- **DELETE /:id**: Deletes a short URL based on the provided ID.
- **GET /**: Lists all shortened URLs.

## Requirements

- Node.js
- npm or yarn
- SQLite

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/fantasyorg/url-shortener-service.git
   cd url-shortener-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root of the project and add the following variables:

   ```plaintext
   API_KEYS=your_api_key1,your_api_key2,your_api_key3
   HOST=localhost
   PORT=3000
   PUBLIC_URL=http://localhost:3000
   ```

   - `API_KEYS`: Comma-separated API keys for authorization.
   - `HOST`: The host where the server will run.
   - `PORT`: The port where the server will listen.
   - `PUBLIC_URL`: The base URL for the short URLs.

4. **Start the server**

   ```bash
   npm start
   ```

5. **Access the API documentation**

   Swagger documentation will be available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs) when the server is running.

## Endpoints

- **POST /**: Creates a short URL.
  - **Body**:
    ```json
    {
      "url": "https://www.example.com",
      "key": "your_api_key_here",
      "expiration": "2024-12-31T23:59:59.000Z"
    }
    ```
  - **Response**:
    ```json
    {
      "shortUrl": "http://localhost:3000/{id}"
    }
    ```

- **GET /{id}**: Redirects to the original URL.

- **DELETE /{id}**: Deletes the short URL.
  - **Query Params**:
    - `key`: API key for authorization.

- **GET /**: Lists all shortened URLs.

## Scheduled Tasks

- Expired URLs are deleted daily at midnight.

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.