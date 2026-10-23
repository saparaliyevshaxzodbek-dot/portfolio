using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Portfolio.Business;
using Portfolio.Business.Dtos;
using Portfolio.Business.Services;
using Portfolio.Data;
using Portfolio.Data.Entities;

namespace Portfolio.Tests;

/// <summary>A real SQLite database in memory, so tests hit the same provider as the app.</summary>
public sealed class TestDb : IDisposable
{
    private readonly SqliteConnection connection = new("DataSource=:memory:");

    public TestDb()
    {
        this.connection.Open();
        using var db = this.Create();
        db.Database.EnsureCreated();
    }

    public AppDbContext Create() => new(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(this.connection).Options);

    public void Dispose() => this.connection.Dispose();
}

public class FixedTime(DateTimeOffset now) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => now;
}

public class FakeTokens : ITokenService
{
    public (string Token, DateTime ExpiresAt) CreateToken(AdminUser user) => ("token-" + user.Username, DateTime.UtcNow.AddHours(1));
}

public class ServiceTests : IDisposable
{
    private static readonly AdminSeedOptions Admin = new() { Username = "admin", Password = "test-password-123" };
    private readonly TestDb testDb = new();

    public void Dispose() => this.testDb.Dispose();

    private async Task<AppDbContext> SeededAsync()
    {
        var db = this.testDb.Create();
        await DbSeeder.SeedAsync(db, new PasswordHasher<AdminUser>(), Admin);
        return db;
    }

    [Fact]
    public async Task Seeder_FillsContentOnceAndKeepsEdits()
    {
        await using var db = await this.SeededAsync();
        var profile = await db.Profiles.SingleAsync();
        profile.FullName = "Edited Name";
        await db.SaveChangesAsync();

        await DbSeeder.SeedAsync(db, new PasswordHasher<AdminUser>(), Admin);

        Assert.Equal("Edited Name", (await db.Profiles.SingleAsync()).FullName);
        Assert.Equal(1, await db.AdminUsers.CountAsync());
        Assert.Equal(5, await db.Projects.CountAsync());
    }

    [Fact]
    public async Task Seeder_RejectsPlaceholderAdminPassword()
    {
        await using var db = this.testDb.Create();
        var placeholder = new AdminSeedOptions { Username = "admin", Password = "CHANGE-ME-STRONG-PASSWORD" };

        await Assert.ThrowsAsync<InvalidOperationException>(() => DbSeeder.SeedAsync(db, new PasswordHasher<AdminUser>(), placeholder));
    }

    [Fact]
    public async Task Site_ShowsPublishedProjectsFeaturedFirstAndOngoingTimelineFirst()
    {
        await using var db = await this.SeededAsync();
        var hidden = await db.Projects.SingleAsync(p => p.Slug == "sportsstore");
        hidden.IsPublished = false;
        await db.SaveChangesAsync();

        var site = await new SiteService(db, TimeProvider.System).GetAsync();

        Assert.Equal("it-yordam", site.Projects[0].Slug);
        Assert.DoesNotContain(site.Projects, p => p.Slug == "sportsstore");
        Assert.Null(site.Experiences[0].EndDate);
        Assert.Contains("ASP.NET Core 10", site.Projects[0].Tech);
        await Assert.ThrowsAsync<NotFoundException>(() => new SiteService(db, TimeProvider.System).GetProjectAsync("sportsstore"));
    }

    [Fact]
    public async Task Visits_AreCountedPerLocalDay()
    {
        await using var db = await this.SeededAsync();
        // 20:00 UTC is already the next day in Tashkent (UTC+5).
        var lateEvening = new FixedTime(new DateTimeOffset(2026, 10, 1, 20, 0, 0, TimeSpan.Zero));
        var service = new SiteService(db, lateEvening);

        await service.RecordVisitAsync();
        await service.RecordVisitAsync();
        var dashboard = await new DashboardService(db, lateEvening).GetAsync();

        var row = await db.DailyVisits.SingleAsync();
        Assert.Equal(new DateOnly(2026, 10, 2), row.Date);
        Assert.Equal(2, row.Count);
        Assert.Equal(2, dashboard.VisitsToday);
        Assert.Equal(14, dashboard.Last14Days.Count);
    }

    [Fact]
    public async Task Contact_SavesMessagesAndSilentlyDropsSpam()
    {
        await using var db = await this.SeededAsync();
        var service = new ContactService(db);

        var saved = await service.SubmitAsync(new ContactRequest { Name = "Recruiter", Email = "hr@example.com", Message = "We have a role for you." });
        var spam = await service.SubmitAsync(new ContactRequest { Name = "Bot", Email = "bot@example.com", Message = "Buy cheap stuff now!!", Website = "http://spam" });
        var messages = await service.GetAllAsync();

        Assert.True(saved);
        Assert.False(spam);
        var message = Assert.Single(messages);
        Assert.False(message.IsRead);
        await service.SetReadAsync(message.Id, true);
        Assert.True((await service.GetAllAsync())[0].IsRead);
    }

    [Fact]
    public async Task Projects_RequireUniqueSlug()
    {
        await using var db = await this.SeededAsync();
        var content = new ContentService(db);
        var request = new ProjectRequest
        {
            Slug = "dasturxon",
            Title = new ShortTextInput { En = "Copy" },
            Summary = new MediumTextInput { En = "Copy of an existing project" },
            Year = 2026,
        };

        await Assert.ThrowsAsync<BusinessRuleException>(() => content.SaveProjectAsync(null, request));
    }

    [Fact]
    public async Task Projects_NormaliseTechListAndManageImages()
    {
        await using var db = await this.SeededAsync();
        var content = new ContentService(db);

        var project = await content.SaveProjectAsync(null, new ProjectRequest
        {
            Slug = "new-app",
            Title = new ShortTextInput { En = "New app", Uz = "Yangi ilova" },
            Summary = new MediumTextInput { En = "Something new" },
            TechStack = " C# ,React,, TypeScript ",
            Year = 2026,
        });
        var image = await content.AddProjectImageAsync(project.Id, new ProjectImageRequest { Url = "/uploads/a.png" });
        await content.DeleteProjectImageAsync(project.Id, image.Id);

        Assert.Equal(["C#", "React", "TypeScript"], project.Tech);
        Assert.Empty((await content.GetProjectsAsync()).Single(p => p.Id == project.Id).Images);
    }

    [Fact]
    public async Task Login_ChecksPassword()
    {
        await using var db = await this.SeededAsync();
        var auth = new AuthService(db, new PasswordHasher<AdminUser>(), new FakeTokens());

        var ok = await auth.LoginAsync(new LoginRequest { Username = "admin", Password = Admin.Password });
        var wrong = await auth.LoginAsync(new LoginRequest { Username = "admin", Password = "nope" });

        Assert.Equal("token-admin", ok?.Token);
        Assert.Null(wrong);
    }
}
