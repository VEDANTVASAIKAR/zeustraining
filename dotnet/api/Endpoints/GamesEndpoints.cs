using System;
using api.Dtos;

namespace api.Endpoints;

public static class GamesEndpoints
{
    const string GetGameEndpointName = "GetGame";

    private static readonly List<GameDto> games = [
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

    public static RouteGroupBuilder MapGamesEndpoints(this WebApplication app)
    {

        var group = app.MapGroup("games")
                        .WithParameterValidation();;
        //GET//games
        group.MapGet("/", () => games);

        app.MapGet("/", () => "Hello World!");

        //GET//game1
        group.MapGet("/{id}", (int id) =>
        {
            GameDto? game = games.Find(game => game.Id == id);

            return game is null ? Results.NotFound() : Results.Ok(game);
        })
        .WithName(GetGameEndpointName);

        //Post/games
        group.MapPost("/", (CreateGameDto newGame) =>
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
        group.MapPut("/{id}", (int id, UpdateGameDto updatedGame) =>
        {
            var index = games.FindIndex(game => game.Id == id);

            if (index == -1)
            {
                return Results.NotFound();
            }


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
        group.MapDelete("/{id}", (int id) =>
        {
            games.RemoveAll(game => game.Id == id);

            return Results.NoContent();
        });

        return group;
    }
}
