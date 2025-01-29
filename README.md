# Role-Based Login System with Authentication and Authorization

This project is a role-based login system designed to provide secure access control for different users: Schools, Parents, and Students. The system ensures that each type of user can access specific features based on their role.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [License](#license)

## Features

- User registration and login
- Email verification
- Role-based access control
- JWT authentication
- Password reset functionality
- CRUD operations for student achievements

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Prisma (ORM)
- PostgreSQL
- JWT (JSON Web Tokens)
- Nodemailer
- Zod (Validation)

## Project Structure



## Setup and Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/theanant404/Role-Based-Login-System-with-Authentication-Authorization.git
    cd Role-Based-Login-System-with-Authentication-Authorization/server
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Set up environment variables:**

    - Create a `.env` file in the [server](http://_vscodecontentref_/18) directory.
    - Copy the contents of [.env.sample](http://_vscodecontentref_/19) into `.env` and fill in the required values.

4. **Set up the database:**

    - Ensure you have PostgreSQL installed and running.
    - Update the `DATABASE_URL` in the `.env` file with your PostgreSQL connection string.
    - Run the Prisma migrations to set up the database schema:

    ```sh
    npx prisma migrate dev
    ```

## Running the Project

1. **Build the project:**

    ```sh
    npm run build
    ```

2. **Start the server:**

    ```sh
    npm run start
    ```

3. **For development:**

    ```sh
    npm run dev
    ```

    This will start the server with hot-reloading enabled.

## API Endpoints

### Auth Routes

- **POST /auth/register** - Register a new user
- **POST /auth/verify-email** - Verify user email with OTP
- **GET /auth/login** - Login user
- **POST /auth/forgot-password** - Send OTP for password reset
- **POST /auth/reset-password** - Reset user password
- **POST /auth/logout** - Logout user

### Dashboard Routes

- **GET /dashboard/** - Get user dashboard
- **GET /dashboard/student/:id** - Get student details (School role only)
- **POST /dashboard/add-achievement/:id** - Add new achievement (School role only)
- **DELETE /dashboard/deleteachievement/:id** - Remove student achievement (School role only)
- **DELETE /dashboard/deleteuser/:id** - Delete user (School role only)

## Environment Variables

The following environment variables need to be set in the `.env` file:

- `DATABASE_URL` - PostgreSQL connection string
- [PORT](http://_vscodecontentref_/20) - Server port
- [SMTP_HOST](http://_vscodecontentref_/21) - SMTP host for sending emails
- [SMTP_PORT](http://_vscodecontentref_/22) - SMTP port
- [SMTP_USER](http://_vscodecontentref_/23) - SMTP user
- [SMTP_PASSWORD](http://_vscodecontentref_/24) - SMTP password
- [FROM_EMAIL](http://_vscodecontentref_/25) - Email address to send emails from
- [ACCESS_TOKEN_SECRET](http://_vscodecontentref_/26) - Secret key for access token
- [REFRESH_TOKEN_SECRET](http://_vscodecontentref_/27) - Secret key for refresh token

## License

This project is licensed under the MIT License. See the [LICENSE](http://_vscodecontentref_/28) file for details.