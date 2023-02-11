let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API 1 GET movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = ` 
    SELECT 
        movie_name as movieName
     FROM 
        movie
     ORDER BY 
        movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

// API 2 POST new movie
app.post("/movies/", async (request, response) => {
  let movieDetails = request.body;
  let { directorId, movieName, leadActor } = movieDetails;
  let addMovieQuery = ` 
    INSERT INTO
        movie (director_id, movie_name, lead_actor)
     VALUES 
      (${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 GET a movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = ` 
    SELECT
       movie_id as movieId,
       director_id as directorId,
       movie_name as movieName,
       lead_actor as leadActor
     FROM 
        movie
     WHERE 
        movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

// API 4 UPDATE movie details
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = ` 
    UPDATE 
        movie
     SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
     WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5 DELETE a movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = ` 
    DELETE FROM
        movie
     WHERE
        movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6 GET directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = ` 
    SELECT 
        director_id as directorId,
        director_name as directorName
     FROM
      director
      ORDER BY 
        director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

// API 7 GET movies of a director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirector = ` 
    SELECT 
        movie_name as movieName
     FROM 
        movie 
     WHERE director_id = ${directorId};`;
  const moviesList = await db.all(getMoviesOfDirector);
  response.send(moviesList);
});

module.exports = app;
