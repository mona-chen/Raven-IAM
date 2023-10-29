# Raven IAM Service

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

## Description

The Raven IAM (SSO) Service is a centralized authentication solution that enables users to authenticate with multiple applications using a single set of credentials. This service simplifies user management, enhances security, and provides a seamless experience across different applications within your ecosystem.

## Use Cases

The Raven IAM Service serves several key use cases:

1. **Simplified User Authentication**: Users can access multiple applications with a single username/email and password, reducing the need to remember multiple sets of credentials.

2. **Enhanced Security**: By centralizing authentication, the SSO service can enforce strong security measures, including password policies and multi-factor authentication, across all integrated applications.

3. **User Management**: Administrators can efficiently manage user access and permissions across various applications from a single interface.

4. **Seamless Integration**: Developers can easily integrate the SSO service with their applications, providing a consistent and secure authentication process.

## Features

### Current Features

- User registration and management.
- App registration and authorization.
- User authentication with multiple applications.
- Secure storage of user and app authorization data in MongoDB.

### Planned Features (To-Do List)

- [x] Implement password hashing for enhanced security.
- [ ] Implement cross application token verification system.
- [ ] Add support for multi-factor authentication.
- [ ] Develop an admin dashboard for user and app management.
- [ ] Add support for SQL and Postgres Database.
- [ ] Implement single sign-out (SSO session management).
- [ ] Enhance documentation for easy setup and integration.
- [ ] Implement user profile management and user data synchronization.
- [ ] Support for third-party identity providers (IdP) like OAuth, OpenID Connect, etc.
- [ ] Implement audit logs and monitoring features.
- [ ] Improve error handling and logging.
- [ ] Conduct security testing and vulnerability assessment.

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Express

### Installation

1. Clone the repository.

   ```bash
   git clone https://github.com/mona-chen/Raven-IAM.git

   ```

2. Install Dependencies

   ```bash
   cd raven-iam
   npm install

   ```

3. Run Project

   ```bash
   npm run dev
   ```
