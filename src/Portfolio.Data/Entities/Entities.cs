namespace Portfolio.Data.Entities;

public abstract class BaseEntity
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

/// <summary>Text shown in both site languages; stored as two columns of the owning table.</summary>
public class LocalizedText
{
    public string En { get; set; } = string.Empty;

    public string Uz { get; set; } = string.Empty;

    public static LocalizedText Of(string en, string uz) => new() { En = en, Uz = uz };
}

/// <summary>The single row describing the site owner.</summary>
public class Profile : BaseEntity
{
    public string FullName { get; set; } = string.Empty;

    /// <summary>Job title under the name, e.g. ".NET Backend Developer".</summary>
    public LocalizedText Headline { get; set; } = new();

    /// <summary>One or two sentences for the hero section.</summary>
    public LocalizedText Summary { get; set; } = new();

    /// <summary>Longer "About me" text; blank lines separate paragraphs.</summary>
    public LocalizedText About { get; set; } = new();

    public LocalizedText Location { get; set; } = new();

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Telegram { get; set; }

    public string? GitHub { get; set; }

    public string? LinkedIn { get; set; }

    public string? PhotoUrl { get; set; }

    /// <summary>Downloadable CV (PDF).</summary>
    public string? CvUrl { get; set; }

    public bool OpenToWork { get; set; } = true;
}

public enum SkillCategory
{
    Backend = 1,
    Frontend = 2,
    Database = 3,
    Tools = 4,
}

public class Skill : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public SkillCategory Category { get; set; }

    public int SortOrder { get; set; }
}

public enum ExperienceType
{
    Work = 1,
    Education = 2,
    Course = 3,
}

/// <summary>An entry of the career timeline: a job, studies or a course.</summary>
public class Experience : BaseEntity
{
    public ExperienceType Type { get; set; }

    public LocalizedText Title { get; set; } = new();

    public string Organization { get; set; } = string.Empty;

    public LocalizedText Description { get; set; } = new();

    public DateOnly StartDate { get; set; }

    /// <summary>Null while the entry is ongoing ("present").</summary>
    public DateOnly? EndDate { get; set; }

    public string? Url { get; set; }

    public int SortOrder { get; set; }
}

public class Project : BaseEntity
{
    /// <summary>URL part of the project page, e.g. "dasturxon".</summary>
    public string Slug { get; set; } = string.Empty;

    public LocalizedText Title { get; set; } = new();

    /// <summary>One sentence for the project card.</summary>
    public LocalizedText Summary { get; set; } = new();

    /// <summary>Full description; blank lines separate paragraphs.</summary>
    public LocalizedText Description { get; set; } = new();

    /// <summary>Key results, one per line.</summary>
    public LocalizedText Highlights { get; set; } = new();

    /// <summary>Technologies, comma separated.</summary>
    public string TechStack { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    public string? RepoUrl { get; set; }

    public string? LiveUrl { get; set; }

    public int Year { get; set; }

    public bool IsFeatured { get; set; }

    public bool IsPublished { get; set; } = true;

    public int SortOrder { get; set; }

    public ICollection<ProjectImage> Images { get; set; } = new List<ProjectImage>();
}

public class ProjectImage
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public Project Project { get; set; } = null!;

    public string Url { get; set; } = string.Empty;

    public LocalizedText Caption { get; set; } = new();

    public int SortOrder { get; set; }
}

public class ContactMessage : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }
}

public class AdminUser : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}

/// <summary>Anonymous page-view counter per day (no personal data is stored).</summary>
public class DailyVisit
{
    public DateOnly Date { get; set; }

    public int Count { get; set; }
}
