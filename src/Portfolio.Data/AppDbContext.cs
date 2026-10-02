using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Data.Entities;

namespace Portfolio.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles => this.Set<Profile>();

    public DbSet<Skill> Skills => this.Set<Skill>();

    public DbSet<Experience> Experiences => this.Set<Experience>();

    public DbSet<Project> Projects => this.Set<Project>();

    public DbSet<ProjectImage> ProjectImages => this.Set<ProjectImage>();

    public DbSet<ContactMessage> ContactMessages => this.Set<ContactMessage>();

    public DbSet<AdminUser> AdminUsers => this.Set<AdminUser>();

    public DbSet<DailyVisit> DailyVisits => this.Set<DailyVisit>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in this.ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.CreatedAt == default)
            {
                entry.Entity.CreatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
        configurationBuilder.Properties<DateTime?>().HaveConversion<UtcDateTimeConverter>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}

/// <summary>
/// SQLite hands DateTime back with Kind=Unspecified; marking it as UTC makes the API
/// serialize timestamps with a trailing "Z" so browsers convert them to local time correctly.
/// </summary>
public class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
    v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
    v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
