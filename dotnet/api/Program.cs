using api.Dtos;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

const string GetGameEndpointName = "GetGame";

List<GameDto> games = [
    new (
        1,
        "g1",
        "fight",
        19.99M, 
        new DateOnly(1992,7,15)),

    new (
        2,
        "g2",
        "fight",
        18.99M,
        new DateOnly(1993,7,15)),

    new (
        3,
        "g3",
        "fight",
        17.99M,
        new DateOnly(1994,7,15)),

];
//GET//games
app.MapGet("/games", () => games);

app.MapGet("/", () => "Hello World!");

//GET//game1
app.MapGet("games/{id}", (int id) =>
{
    GameDto? game = games.Find(game => game.Id == id);

    return game is null ? Results.NotFound() : Results.Ok(game);
})
.WithName(GetGameEndpointName);

//Post/games
app.MapPost("games", (CreateGameDto newGame) =>
{
    GameDto game = new(
        games.Count + 1,
        newGame.Name,
        newGame.Genre,
        newGame.Price,
        newGame.ReleaseDate
    );
    games.Add(game);

    return Results.CreatedAtRoute(GetGameEndpointName, new { id = game.Id }, game);
    // Console.WriteLine(Results.CreatedAtRoute(GetGameEndpointName, new { id = game.Id }, game));
});

//PUT ENDPOINT
app.MapPut("games/{id}", (int id, UpdateGameDto updatedGame) =>
{
    var index = games.FindIndex(game => game.Id == id);
    games[index] = new GameDto(
        id,
        updatedGame.Name,
        updatedGame.Genre,
        updatedGame.Price,
        updatedGame.ReleaseDate
    );

    return Results.NoContent();
});

// DELETE
app.MapDelete("games/{id}", (int id) =>
{
    games.RemoveAll(game => game.Id == id);

    return Results.NoContent();
});
app.Run();
