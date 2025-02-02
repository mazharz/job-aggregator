# job aggregator

## how to run the application

1. Clone the project by `git clone git@github.com:mazharz/job-aggregator.git`
1. Change your current directory to the project directory: `cd job-aggregator`
1. Make sure you have `docker` and `docker-compose` installed (I am using the official postgres docker image)
1. Initialize the database by running `npm run db:init`
1. Configure the cronjob frequency (in `.env`) to a value like `*/30 * * * * *` to fetch jobs every 30 seconds
   - I am aware that `.env` shouldn't be stored in git, but for the ease of use from your end, I included it
1. Run the application via `npm run start:dev`
1. You can see the documentation at `http://localhost:3000/docs`
