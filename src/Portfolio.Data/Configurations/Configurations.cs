using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Data.Entities;

namespace Portfolio.Data.Configurations;

internal static class LocalizedTextMapping
{
    /// <summary>Maps a <see cref="LocalizedText"/> to "{Name}En" and "{Name}Uz" columns.</summary>
    public static void Localized<T>(
        this EntityTypeBuilder<T> builder,
        System.Linq.Expressions.Expression<Func<T, LocalizedText?>> property,
        string name,
        int maxLength)
        where T : class
    {
        builder.ComplexProperty(property, text =>
        {
            text.Property(t => t.En).HasColumnName(name + "En").HasMaxLength(maxLength).IsRequired();
            text.Property(t => t.Uz).HasColumnName(name + "Uz").HasMaxLength(maxLength).IsRequired();
        });
    }
}

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.Property(p => p.FullName).HasMaxLength(100).IsRequired();
        builder.Localized(p => p.Headline, "Headline", 120);
        builder.Localized(p => p.Summary, "Summary", 400);
        builder.Localized(p => p.About, "About", 4000);
        builder.Localized(p => p.Location, "Location", 100);
        builder.Property(p => p.Email).HasMaxLength(150).IsRequired();
        builder.Property(p => p.Phone).HasMaxLength(30);
        builder.Property(p => p.Telegram).HasMaxLength(200);
        builder.Property(p => p.GitHub).HasMaxLength(200);
        builder.Property(p => p.LinkedIn).HasMaxLength(200);
        builder.Property(p => p.PhotoUrl).HasMaxLength(300);
        builder.Property(p => p.CvUrl).HasMaxLength(300);
    }
}

public class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.Property(s => s.Name).HasMaxLength(60).IsRequired();
        builder.Property(s => s.Category).HasConversion<string>().HasMaxLength(20);
    }
}

public class ExperienceConfiguration : IEntityTypeConfiguration<Experience>
{
    public void Configure(EntityTypeBuilder<Experience> builder)
    {
        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
        builder.Localized(e => e.Title, "Title", 150);
        builder.Property(e => e.Organization).HasMaxLength(150).IsRequired();
        builder.Localized(e => e.Description, "Description", 2000);
        builder.Property(e => e.Url).HasMaxLength(300);
    }
}

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.Property(p => p.Slug).HasMaxLength(80).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Localized(p => p.Title, "Title", 150);
        builder.Localized(p => p.Summary, "Summary", 400);
        builder.Localized(p => p.Description, "Description", 6000);
        builder.Localized(p => p.Highlights, "Highlights", 3000);
        builder.Property(p => p.TechStack).HasMaxLength(500);
        builder.Property(p => p.CoverImageUrl).HasMaxLength(300);
        builder.Property(p => p.RepoUrl).HasMaxLength(300);
        builder.Property(p => p.LiveUrl).HasMaxLength(300);

        builder.HasMany(p => p.Images)
            .WithOne(i => i.Project)
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProjectImageConfiguration : IEntityTypeConfiguration<ProjectImage>
{
    public void Configure(EntityTypeBuilder<ProjectImage> builder)
    {
        builder.Property(i => i.Url).HasMaxLength(300).IsRequired();
        builder.Localized(i => i.Caption, "Caption", 200);
    }
}

public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.Property(m => m.Name).HasMaxLength(100).IsRequired();
        builder.Property(m => m.Email).HasMaxLength(150).IsRequired();
        builder.Property(m => m.Message).HasMaxLength(3000).IsRequired();
        builder.HasIndex(m => m.CreatedAt);
    }
}

public class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.Property(u => u.Username).HasMaxLength(50).IsRequired();
        builder.HasIndex(u => u.Username).IsUnique();
        builder.Property(u => u.PasswordHash).IsRequired();
    }
}

public class DailyVisitConfiguration : IEntityTypeConfiguration<DailyVisit>
{
    public void Configure(EntityTypeBuilder<DailyVisit> builder) => builder.HasKey(v => v.Date);
}
