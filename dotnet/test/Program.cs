var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/users/{userId}/books/{bookId}", 
    (int userId, int bookId) => $"The user id is {userId} and book id is {bookId}");

app.Run();