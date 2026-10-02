using Microsoft.EntityFrameworkCore;
using Portfolio.Business.Dtos;
using Portfolio.Data;
using Portfolio.Data.Entities;

namespace Portfolio.Business.Services;

/// <summary>Admin editing of the profile, skills, timeline and projects.</summary>
public class ContentService(AppDbContext db)
{
    // ---- Profile ----

    public async Task<ProfileDto> GetProfileAsync(CancellationToken ct = default) =>
        (await this.FindProfileAsync(ct)).ToDto();

    public async Task<ProfileDto> UpdateProfileAsync(ProfileRequest r, CancellationToken ct = default)
    {
        var p = await this.FindProfileAsync(ct);
        p.FullName = r.FullName.Trim();
        p.Headline = r.Headline.ToEntity();
        p.Summary = r.Summary.ToEntity();
        p.About = r.About.ToEntity();
        p.Location = r.Location.ToEntity();
        p.Email = r.Email.Trim();
        p.Phone = r.Phone.Clean();
        p.Telegram = r.Telegram.Clean();
        p.GitHub = r.GitHub.Clean();
        p.LinkedIn = r.LinkedIn.Clean();
        p.PhotoUrl = r.PhotoUrl.Clean();
        p.CvUrl = r.CvUrl.Clean();
        p.OpenToWork = r.OpenToWork;
        await db.SaveChangesAsync(ct);
        return p.ToDto();
    }

    // ---- Skills ----

    public async Task<IReadOnlyList<SkillDto>> GetSkillsAsync(CancellationToken ct = default) =>
        (await db.Skills.AsNoTracking().OrderBy(s => s.Category).ThenBy(s => s.SortOrder).ThenBy(s => s.Name).ToListAsync(ct))
        .Select(s => s.ToDto()).ToList();

    public async Task<SkillDto> SaveSkillAsync(int? id, SkillRequest r, CancellationToken ct = default)
    {
        var skill = id is null
            ? db.Skills.Add(new Skill()).Entity
            : await db.Skills.FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new NotFoundException("Skill not found.");
        skill.Name = r.Name.Trim();
        skill.Category = r.Category;
        skill.SortOrder = r.SortOrder;
        await db.SaveChangesAsync(ct);
        return skill.ToDto();
    }

    public Task DeleteSkillAsync(int id, CancellationToken ct = default) =>
        DeleteAsync(db.Skills.Where(s => s.Id == id), "Skill not found.", ct);

    // ---- Timeline ----

    public async Task<IReadOnlyList<ExperienceDto>> GetExperiencesAsync(CancellationToken ct = default) =>
        (await db.Experiences.AsNoTracking().OrderByDescending(e => e.StartDate).ToListAsync(ct))
        .Select(e => e.ToDto()).ToList();

    public async Task<ExperienceDto> SaveExperienceAsync(int? id, ExperienceRequest r, CancellationToken ct = default)
    {
        var e = id is null
            ? db.Experiences.Add(new Experience()).Entity
            : await db.Experiences.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NotFoundException("Timeline entry not found.");
        e.Type = r.Type;
        e.Title = r.Title.ToEntity();
        e.Organization = r.Organization.Trim();
        e.Description = r.Description.ToEntity();
        e.StartDate = r.StartDate;
        e.EndDate = r.EndDate;
        e.Url = r.Url.Clean();
        e.SortOrder = r.SortOrder;
        await db.SaveChangesAsync(ct);
        return e.ToDto();
    }

    public Task DeleteExperienceAsync(int id, CancellationToken ct = default) =>
        DeleteAsync(db.Experiences.Where(e => e.Id == id), "Timeline entry not found.", ct);

    // ---- Projects ----

    public async Task<IReadOnlyList<ProjectDto>> GetProjectsAsync(CancellationToken ct = default) =>
        (await db.Projects.AsNoTracking().Include(p => p.Images)
            .OrderByDescending(p => p.IsFeatured).ThenBy(p => p.SortOrder).ThenByDescending(p => p.Year)
            .ToListAsync(ct))
        .Select(p => p.ToDto()).ToList();

    public async Task<ProjectDto> SaveProjectAsync(int? id, ProjectRequest r, CancellationToken ct = default)
    {
        var slug = r.Slug.Trim().ToLowerInvariant();
        if (await db.Projects.AnyAsync(p => p.Slug == slug && p.Id != id, ct))
        {
            throw new BusinessRuleException($"Another project already uses the address \"{slug}\".");
        }

        var p = id is null
            ? db.Projects.Add(new Project()).Entity
            : await db.Projects.Include(x => x.Images).FirstOrDefaultAsync(x => x.Id == id, ct)
              ?? throw new NotFoundException("Project not found.");
        p.Slug = slug;
        p.Title = r.Title.ToEntity();
        p.Summary = r.Summary.ToEntity();
        p.Description = r.Description.ToEntity();
        p.Highlights = r.Highlights.ToEntity();
        p.TechStack = string.Join(", ", Mapping.SplitTech(r.TechStack));
        p.CoverImageUrl = r.CoverImageUrl.Clean();
        p.RepoUrl = r.RepoUrl.Clean();
        p.LiveUrl = r.LiveUrl.Clean();
        p.Year = r.Year;
        p.IsFeatured = r.IsFeatured;
        p.IsPublished = r.IsPublished;
        p.SortOrder = r.SortOrder;
        await db.SaveChangesAsync(ct);
        return p.ToDto();
    }

    public Task DeleteProjectAsync(int id, CancellationToken ct = default) =>
        DeleteAsync(db.Projects.Where(p => p.Id == id), "Project not found.", ct);

    public async Task<ProjectImageDto> AddProjectImageAsync(int projectId, ProjectImageRequest r, CancellationToken ct = default)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId, ct))
        {
            throw new NotFoundException("Project not found.");
        }

        var image = new ProjectImage
        {
            ProjectId = projectId,
            Url = r.Url.Trim(),
            Caption = r.Caption?.ToEntity() ?? new LocalizedText(),
            SortOrder = r.SortOrder,
        };
        db.ProjectImages.Add(image);
        await db.SaveChangesAsync(ct);
        return image.ToDto();
    }

    public Task DeleteProjectImageAsync(int projectId, int imageId, CancellationToken ct = default) =>
        DeleteAsync(db.ProjectImages.Where(i => i.Id == imageId && i.ProjectId == projectId), "Image not found.", ct);

    private static async Task DeleteAsync<T>(IQueryable<T> query, string notFound, CancellationToken ct)
    {
        if (await query.ExecuteDeleteAsync(ct) == 0)
        {
            throw new NotFoundException(notFound);
        }
    }

    private async Task<Profile> FindProfileAsync(CancellationToken ct) =>
        await db.Profiles.FirstOrDefaultAsync(ct) ?? throw new NotFoundException("Profile is not set up yet.");
}
