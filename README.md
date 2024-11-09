### Requisites

1. **Docker**  
   Ensure that Docker is installed on your system.

2. **Node.js**  
   Install Node.js to run the development server and the tests.

<br/>

### Installation

1.  **Clone the repository**  
    Clone the frontend repository to your local machine:

    ```bash
    git clone https://github.com/maxsdst/satori-video-frontend.git
    cd satori-video-frontend
    ```

2.  **Create the `.env.local` file**  
    In the root directory of the cloned repository, create a file named `.env.local` and add the following environment variables:

    ```plaintext
    # Base URL for the backend API, without a trailing slash
    VITE_API_URL=http://localhost:8000

    # Website name displayed in page titles
    VITE_WEBSITE_NAME="Satori Video"
    ```

3.  **Install dependencies**

    ```bash
    npm install
    ```

4.  **Run in development mode**  
    Start the development server:

    ```bash
    npm run dev
    ```

    The application should now be accessible at [`http://localhost:5173`](http://localhost:5173) in your browser.

5.  **Run tests**  
    Run the tests using the following command:

    ```bash
    npm run test:ui
    ```

    Open [`http://localhost:9527/__vitest__/`](http://localhost:9527/__vitest__/) in your browser to view the test results.

6.  **Run in production mode**  
    Start the production server using Docker:

    ```bash
    docker compose -f docker-compose.prod.yml up
    ```
