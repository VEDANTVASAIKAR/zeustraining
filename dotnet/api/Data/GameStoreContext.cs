using System;
using api.Entities;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class GameStoreContext(DbContextOptions<GameStoreContext> options) : DbContext(options)
{
    public DbSet<Game> Games => Set<Game>();

    public DbSet<Genre> Genres => Set<Genre>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Genre>().HasData(
            new { Id = 1, Name = "FIGHTING" },
            new { Id = 2, Name = "MMA" },
            new { Id = 3, Name = "BOXING" },
            new { Id = 4, Name = "KICKBOXING" },
            new { Id = 5, Name = "JIUJUTSU" }
        );
    }
}
