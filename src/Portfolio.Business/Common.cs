using Portfolio.Business.Dtos;
using Portfolio.Data.Entities;

namespace Portfolio.Business;

/// <summary>The requested item does not exist (HTTP 404).</summary>
public class NotFoundException(string message) : Exception(message);

/// <summary>The request breaks a rule (HTTP 400).</summary>
public class BusinessRuleException(string message) : Exception(message);

public static class LocalClock
{
    /// <summary>Uzbekistan is UTC+5 all year; "today" for visit statistics follows local time.</summary>
    public static readonly TimeSpan Offset = TimeSpan.FromHours(5);

    public static DateOnly Today(TimeProvider time) =>
        DateOnly.FromDateTime(time.GetUtcNow().ToOffset(Offset).DateTime);
}

public static class Mapping
{
    public static Text ToDto(this LocalizedText t) => new(t.En, t.Uz);

    public static LocalizedText ToEntity(this ShortTextInput t) => LocalizedText.Of(t.En.Trim(), t.Uz.Trim());

    public static LocalizedText ToEntity(this MediumTextInput t) => LocalizedText.Of(t.En.Trim(), t.Uz.Trim());

    public static LocalizedText ToEntity(this LongTextInput t) => LocalizedText.Of(t.En.Trim(), t.Uz.Trim());

    public static string? Clean(this string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public static IReadOnlyList<string> SplitTech(string techStack) =>
        techStack.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public static ProfileDto ToDto(this Profile p) =>
        new(
            p.FullName,
            p.Headline.ToDto(),
            p.Summary.ToDto(),
            p.About.ToDto(),
            p.Location.ToDto(),
            p.Email,
            p.Phone,
            p.Telegram,
            p.GitHub,
            p.LinkedIn,
            p.PhotoUrl,
            p.CvUrl,
            p.OpenToWork);

    public static SkillDto ToDto(this Skill s) => new(s.Id, s.Name, s.Category, s.SortOrder);

    public static ExperienceDto ToDto(this Experience e) =>
        new(e.Id, e.Type, e.Title.ToDto(), e.Organization, e.Description.ToDto(), e.StartDate, e.EndDate, e.Url, e.SortOrder);

    public static ProjectCardDto ToCard(this Project p) =>
        new(p.Id, p.Slug, p.Title.ToDto(), p.Summary.ToDto(), SplitTech(p.TechStack), p.CoverImageUrl, p.Year, p.IsFeatured, p.RepoUrl, p.LiveUrl);

    public static ProjectImageDto ToDto(this ProjectImage i) => new(i.Id, i.Url, i.Caption.ToDto(), i.SortOrder);

    public static ProjectDto ToDto(this Project p) =>
        new(
            p.Id,
            p.Slug,
            p.Title.ToDto(),
            p.Summary.ToDto(),
            p.Description.ToDto(),
            p.Highlights.ToDto(),
            SplitTech(p.TechStack),
            p.CoverImageUrl,
            p.RepoUrl,
            p.LiveUrl,
            p.Year,
            p.IsFeatured,
            p.IsPublished,
            p.SortOrder,
            p.Images.OrderBy(i => i.SortOrder).ThenBy(i => i.Id).Select(i => i.ToDto()).ToList());

    public static ContactMessageDto ToDto(this ContactMessage m) =>
        new(m.Id, m.Name, m.Email, m.Message, m.IsRead, m.CreatedAt);
}
