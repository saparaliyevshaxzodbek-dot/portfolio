using System.ComponentModel.DataAnnotations;
using Portfolio.Data.Entities;

namespace Portfolio.Business.Dtos;

/// <summary>Both language versions of a text; the browser picks one.</summary>
public record Text(string En, string Uz);

public record ProfileDto(
    string FullName,
    Text Headline,
    Text Summary,
    Text About,
    Text Location,
    string Email,
    string? Phone,
    string? Telegram,
    string? GitHub,
    string? LinkedIn,
    string? PhotoUrl,
    string? CvUrl,
    bool OpenToWork);

public record SkillDto(int Id, string Name, SkillCategory Category, int SortOrder);

public record ExperienceDto(
    int Id,
    ExperienceType Type,
    Text Title,
    string Organization,
    Text Description,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Url,
    int SortOrder);

public record ProjectCardDto(
    int Id,
    string Slug,
    Text Title,
    Text Summary,
    IReadOnlyList<string> Tech,
    string? CoverImageUrl,
    int Year,
    bool IsFeatured,
    string? RepoUrl,
    string? LiveUrl);

public record ProjectImageDto(int Id, string Url, Text Caption, int SortOrder);

public record ProjectDto(
    int Id,
    string Slug,
    Text Title,
    Text Summary,
    Text Description,
    Text Highlights,
    IReadOnlyList<string> Tech,
    string? CoverImageUrl,
    string? RepoUrl,
    string? LiveUrl,
    int Year,
    bool IsFeatured,
    bool IsPublished,
    int SortOrder,
    IReadOnlyList<ProjectImageDto> Images);

public record SiteDto(
    ProfileDto Profile,
    IReadOnlyList<SkillDto> Skills,
    IReadOnlyList<ExperienceDto> Experiences,
    IReadOnlyList<ProjectCardDto> Projects);

public record ContactMessageDto(int Id, string Name, string Email, string Message, bool IsRead, DateTime CreatedAt);

public record LoginResponse(string Token, DateTime ExpiresAt, string Username);

public record DailyVisitDto(DateOnly Date, int Count);

public record DashboardDto(
    int VisitsToday,
    int VisitsLast30Days,
    IReadOnlyList<DailyVisitDto> Last14Days,
    int UnreadMessages,
    int TotalMessages,
    int Projects,
    int Skills);

// ---- Requests ----

public class ShortTextInput
{
    [Required]
    [StringLength(150)]
    public string En { get; init; } = string.Empty;

    [StringLength(150)]
    public string Uz { get; init; } = string.Empty;
}

public class MediumTextInput
{
    [Required]
    [StringLength(400)]
    public string En { get; init; } = string.Empty;

    [StringLength(400)]
    public string Uz { get; init; } = string.Empty;
}

public class LongTextInput
{
    [StringLength(6000)]
    public string En { get; init; } = string.Empty;

    [StringLength(6000)]
    public string Uz { get; init; } = string.Empty;
}

public class ContactRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(3000, MinimumLength = 10)]
    public string Message { get; init; } = string.Empty;

    /// <summary>Hidden field that people never fill in; bots usually do.</summary>
    public string? Website { get; init; }
}

public class LoginRequest
{
    [Required]
    [StringLength(50)]
    public string Username { get; init; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Password { get; init; } = string.Empty;
}

public class ProfileRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; init; } = string.Empty;

    [Required]
    public ShortTextInput Headline { get; init; } = new();

    [Required]
    public MediumTextInput Summary { get; init; } = new();

    [Required]
    public LongTextInput About { get; init; } = new();

    [Required]
    public ShortTextInput Location { get; init; } = new();

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; init; } = string.Empty;

    [StringLength(30)]
    public string? Phone { get; init; }

    [StringLength(200)]
    public string? Telegram { get; init; }

    [StringLength(200)]
    public string? GitHub { get; init; }

    [StringLength(200)]
    public string? LinkedIn { get; init; }

    [StringLength(300)]
    public string? PhotoUrl { get; init; }

    [StringLength(300)]
    public string? CvUrl { get; init; }

    public bool OpenToWork { get; init; }
}

public class SkillRequest
{
    [Required]
    [StringLength(60, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [EnumDataType(typeof(SkillCategory))]
    public SkillCategory Category { get; init; }

    [Range(0, 1000)]
    public int SortOrder { get; init; }
}

public class ExperienceRequest : IValidatableObject
{
    [EnumDataType(typeof(ExperienceType))]
    public ExperienceType Type { get; init; }

    [Required]
    public ShortTextInput Title { get; init; } = new();

    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Organization { get; init; } = string.Empty;

    [Required]
    public LongTextInput Description { get; init; } = new();

    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    [StringLength(300)]
    public string? Url { get; init; }

    [Range(0, 1000)]
    public int SortOrder { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (this.EndDate is { } end && end < this.StartDate)
        {
            yield return new ValidationResult("End date can't be before the start date.", [nameof(this.EndDate)]);
        }
    }
}

public class ProjectRequest
{
    [Required]
    [StringLength(80, MinimumLength = 2)]
    [RegularExpression("^[a-z0-9]+(-[a-z0-9]+)*$", ErrorMessage = "Slug may contain only lowercase letters, digits and dashes.")]
    public string Slug { get; init; } = string.Empty;

    [Required]
    public ShortTextInput Title { get; init; } = new();

    [Required]
    public MediumTextInput Summary { get; init; } = new();

    [Required]
    public LongTextInput Description { get; init; } = new();

    [Required]
    public LongTextInput Highlights { get; init; } = new();

    [StringLength(500)]
    public string TechStack { get; init; } = string.Empty;

    [StringLength(300)]
    public string? CoverImageUrl { get; init; }

    [StringLength(300)]
    public string? RepoUrl { get; init; }

    [StringLength(300)]
    public string? LiveUrl { get; init; }

    [Range(2000, 2100)]
    public int Year { get; init; }

    public bool IsFeatured { get; init; }

    public bool IsPublished { get; init; } = true;

    [Range(0, 1000)]
    public int SortOrder { get; init; }
}

public class ProjectImageRequest
{
    [Required]
    [StringLength(300)]
    public string Url { get; init; } = string.Empty;

    public ShortTextInput? Caption { get; init; }

    [Range(0, 1000)]
    public int SortOrder { get; init; }
}
