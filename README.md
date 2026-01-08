# Raffle WhatsApp Bot

A WhatsApp Chatbot built with Node.js and the Meta Cloud API to manage raffle ticket sales. It integrates with the Raffle Backoffice to handle availability, reservations, and orders.

## Features

- 🔍 **Browse active raffles**: View list of currently active raffles with prices and availability.
- 🎲 **Random Ticket Reservation**: Users can request a specific quantity of random numbers.
- 🔢 **Pick Specific Numbers**: Users can request specific ticket numbers (e.g., "15, 22").
- 📸 **Payment Proof**: Accepts image uploads to confirm payment for reservations.
- 🇪🇸 **Spanish Localization**: All interactions are in Spanish.
- 💾 **State Management**: Uses Redis to maintain conversation state (context interactions).

## Prerequisites

- **Node.js** v18+
- **Redis**
- **Raffle Backoffice** (Django API) running and accessible.
- **Meta Developer Account** with a WhatsApp Business App set up.

## Installation

1.  Clone the repository and enter the directory:
    ```bash
    cd raffle-whatsapp-bot
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Copy `.sample.env` to `.env` or use the root `.env` if running via Docker.
    
    Required variables:
    ```bash
    # Meta API
    ACCESS_TOKEN=EAAG...
    APP_SECRET=...
    VERIFY_TOKEN=my_secure_token
    
    # Server
    PORT=8080
    
    # Integration
    BACKOFFICE_URL=http://localhost:8000  # Or http://backoffice:8000 in Docker
    REDIS_HOST=localhost                  # Or redis in Docker
    REDIS_PORT=6379
    ```

## Usage

### Running Locally

Ensure Redis and the Backoffice are running.

```bash
npm start
```

The server will start on port `8080`. You can use `ngrok` to expose it for local development:

```bash
ngrok http 8080
```

Update your **Callback URL** in the Meta App Dashboard to your ngrok URL + `/webhook` (e.g., `https://xxxx.ngrok.io/webhook`).

### Running with Docker

This service is part of the main `docker-compose` setup. From the project root:

```bash
docker compose up -d bot
```

## Project Structure

- **`app.js`**: Entry point. Sets up Express server and handles Webhook verification/reception.
- **`services/conversation.js`**: Core logic. Implements the state machine for the conversation flow.
- **`services/api.js`**: Axios client interacting with the Django Backoffice endpoints.
- **`services/graph-api.js`**: Wrapper methods for sending messages (Text, Lists, Buttons) via Meta API.
- **`services/redis.js`**: Wrapper to store and retrieve user state from Redis.
- **`services/constants.js`**: Configuration of messages and flow constants.

## Conversation Flow

1.  **IDLE**: User sends any message. Bot ensures contact exists in Backoffice.
2.  **MENU**: Bot shows options (Browse, My Orders, Help).
3.  **SELECTING_RAFFLE**: User views list of raffles and selects one.
4.  **CHOOSING_TYPE**: User chooses "Random" or "Specific Numbers".
5.  **ENTERING_QTY/NUMBERS**: User inputs quantity or specific numbers.
6.  **AWAITING_PROOF**: Reservation is created (Pending Payment). User uploads image.
7.  **CONFIRMED**: Payment proof sent to Backoffice. Order is updated.

## License

This project is licensed under the terms of the BSD license.
