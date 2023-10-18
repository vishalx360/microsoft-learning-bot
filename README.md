# Microsoft Learning Bot

## Introduction

This bot works on pupteer and is used to automate the process of completing the Microsoft Learning Challenge.

## Disclaimer

This is only meant for educational purposes. The code is not optimized and is not meant to be used in production.
You are responsible for any consequences that may arise from using this code.

## Prerequisites

Before you begin, ensure you have met the following requirements:

1. You have installed the latest version of [Node.js](https://nodejs.org/en/download/).
2. You have installed the latest version of [Google Chrome](https://www.google.com/chrome/).
3. You have a Microsoft Account logged in on your chrome browser.
4. You have a stable internet connection.
5. You have a basic understanding of how to use the terminal.
6. You have enrolled in all the Microsoft Learning Challenges mentioned in the [Microsoft Azure Challenge.pdf](./Microsoft%20Azure%20Challenge.pdf) file.

## Setup Instructions

This section provides instructions for setting up and running the project on a local machine.

1. **Clone the Repository**:

   Clone this repository to your local machine using the following command:

   ```bash
   git clone https://github.com/vishalx360/microsoft-learning-bot.git
   ```

2. **Navigate to Project Directory**:

   Change to the project directory using the following command:

   ```bash
   cd microsoft-learning-bot
   ```

3. **Install Dependencies**:

   Install the project dependencies:

   ```bash
   npm install
   ```

4. **Start Browser session**:

   The browser session is required to be started in remote debugging mode. This can be done by running the following command:

   ```bash
   google-chrome-stable --remote-debugging-port=9222
   ```

   Make sure to close all existing browser windows before running this command.

   Once the browser session is started, the command will return a message similar to the following:

   ```bash
   DevTools listening on ws://127.0.0.1:9222/devtools/browser/5ce308e2-be56-4395-a07e-d7a96fafe785
   ```

   The value after the last slash is the **BROWSER_ID**. This value will be used in the next step.
   Also make sure to choose the chrome profile which has the microsoft account logged in.

5. **Configure Environment Variables**:

   Open the .env file and provide value for **BROWSER_ID**.

   Your .env file should look something like this:

   ```bash
    BROWSER_ID=5ce308e2-be56-4395-a07e-d7a96fafe785
   ```

   Replace the value of BROWSER_ID with the value you got in the previous step.

6. **Start the Automation**:

   start the puppeteer browser automation by running the following command:

   ```bash
   npm start
   ```

Your Browser will open multiple units and will complete the challenge for you. You can see the progress in the terminal. Once the challenge is completed, the browser will close automatically.

## Known Missing Feature

Ideally the program should take challenge links (PDF) and credentials (env-var) as input and then enroll and complete all of them.

But Currently there is a prerequisite that you have to be enrolled in all the challenges mentioned in the [Microsoft Azure Challenge.pdf](./Microsoft%20Azure%20Challenge.pdf) file. This is because the bot does not have the capability to enroll in challenges.

[challenge_links.json](./data/challenge_links.json) is a file, which contains the challenge links extracted from the [Microsoft Azure Challenge.pdf](./Microsoft%20Azure%20Challenge.pdf) file.

This file is generated by running the linkExtractor python script which takes a pdf file as second argument and generates the json file.

```bash
python linkExtractor.py "Microsoft Azure Challenge.pdf"
```