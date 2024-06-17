<h3 align="center">
   Project Unknown
</h3>

<p align="center">
   Project Unknown Api
</p>

<p align="center">
   <a href="https://nodejs.org/">
      <img src="https://aleen42.github.io/badges/src/node.svg"/>
   </a>
   <a href="https://www.typescriptlanag.org/">
      <img src="https://aleen42.github.io/badges/src/typescript.svg"/>
   </a>
   <a href="https://www.mongodb.com/">
      <img src="https://aleen42.github.io/badges/src/mongodb.svg"/>
   </a>
   <a href="https://eslint.org/">
      <img src="https://aleen42.github.io/badges/src/eslint.svg"/>
   </a>
</p>

# Description

Project Unknown is a unique platform designed for gamers, combining the best elements of a social media app and a professional networking site like LinkedIn. Gamers can showcase their achievements, skills, and other gaming-related activities. Teams and organizations can discover talented players and recruit them to kickstart their gaming careers.

## Features

- **Profile Creation:** Gamers can create detailed profiles to highlight their skills, achievements, and gaming history.
- **Networking:** Connect with other gamers, join teams, or find organizations looking for new talent.
- **Recruitment:** Teams and organizations can browse through profiles to find and recruit players.
- **Achievements:** Post and share gaming achievements and milestones.
- **Opportunities:** Look for gaming career opportunities and team openings.

## Getting Started

Follow these instructions to set up the project on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following tools installed on your local development environment:

- **Node.js** (v20.11.0)
- **Yarn** (v1.22.22)
- **direnv** (v2.34.0)
- **TypeScript** (v4.0 or later)
- **MongoDB** (if using locally)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Code-With-3B/project-unknown-api.git
   cd project-unknown 
   ```

2. **Install Dependencies**

Use Yarn to install the project dependencies:

   ```bash
   yarn install 
   ```


3. **Set Up Environment Variables**

Create a .envrc file in the root of the project and add the necessary environment variables. You can create and populate this file with the following commands:

   ```bash
   echo 'export FASTIFY_PORT=3000' >> .envrc
   echo 'export ESLINT_USE_FLAT_CONFIG=true' >> .envrc 
   echo "export MONGODB_CONNECTION_STRING='mongodb://localhost:27017/project-unknown'" >> .envrc
   echo 'export MONGODB_DATABASE=project-unknown' >> .envrc
   echo 'export DB_POOL_SIZE=20' >> .envrc
   echo 'export JWT_SECRET=your_jwt_secret' >> .envrc
   echo "export TOKEN_EXPIRATION='1d'" >> .envrc
   echo 'export MAX_FILE_SIZE=96' >> .envrc
   ```


4. **After creating the .envrc file, use direnv to allow loading the environment variables automatically:**

   ```bash
   direnv allow 
   ```


5. **Compile the TypeScript code to JavaScript using the build command:**

   ```bash
   yarn build
   ```


6. **Apply the necessary database migrations:**

   ```bash
   yarn migration:up
   ```


7. **Start the Fastify server:**

   ```bash
   yarn start
   ```

8. **For development purposes, you can use the dev command to build and start the project in one go:**

   ```bash
   yarn dev
   ```

## Commands

This table lists commonly used yarn commands for this project:

| Command | Description |
|---|---|
| `yarn dev` | Builds the project and starts the server in development mode. |
| `yarn start` | Starts the server using the compiled code in the `dist` directory. |
| `yarn build` | Cleans the `dist` directory and compiles TypeScript to JavaScript. |
| `yarn gql-gen` | Generates GraphQL types and operations based on the `codegen.yaml` configuration. |
| `yarn db-gen-types` | Converts the JSON database schema into TypeScript types and saves them in `src/generated/`. |
| `yarn lint` | Runs ESLint on the `src` directory and automatically fixes issues (if possible). |
| `yarn purge` | Removes the `node_modules` and `dist` directories to clean up the project. |
| `yarn migration:up` | Runs the database migrations to set up the current schema. |
| `yarn migration:down` | Rolls back the most recent database migration. |

For more commands, see [package.json](./package.json).