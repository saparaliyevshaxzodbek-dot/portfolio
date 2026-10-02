using Microsoft.EntityFrameworkCore;
using Portfolio.Business.Dtos;
using Portfolio.Data;
using Portfolio.Data.Entities;

namespace Portfolio.Business.Services;

/// <summary>Everything the public site shows.</summary>
public class SiteService(AppDbContext db, TimeProvider time)
{
    public async Task<SiteDto> GetAsync(CancellationToken ct = default)
    {
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("Profile is not set up yet.");

        var skills = await db.Skills.AsNoTracking()
            .OrderBy(s => s.Category).ThenBy(s => s.SortOrder).ThenBy(s => s.Name)
            .ToListAsync(ct);

        // Ongoing entries first, then the most recent ones.
        var experiences = (await db.Experiences.AsNoTracking().ToListAsync(ct))
            .OrderByDescending(e => e.EndDate is null)
            .ThenByDescending(e => e.EndDate ?? DateOnly.MaxValue)
            .ThenByDescending(e => e.StartDate)
            .ThenBy(e => e.SortOrder)
            .ToList();

        var projects = await db.Projects.AsNoTracking()
            .Where(p => p.IsPublished)
            .OrderByDescending(p => p.IsFeatured).ThenBy(p => p.SortOrder).ThenByDescending(p => p.Year)
            .ToListAsync(ct);

        return new SiteDto(
            profile.ToDto(),
            skills.Select(s => s.ToDto()).ToList(),
            experiences.Select(e => e.ToDto()).ToList(),
            projects.Select(p => p.ToCard()).ToList());
    }

    public async Task<ProjectDto> GetProjectAsync(string slug, CancellationToken ct = default)
    {
        var project = await db.Projects.AsNoTracking()
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished, ct)
            ?? throw new NotFoundException("Project not found.");
        return project.ToDto();
    }

    /// <summary>Counts one page view for today; nothing about the visitor is stored.</summary>
    public async Task RecordVisitAsync(CancellationToken ct = default)
    {
        var today = LocalClock.Today(time);
        var updated = await db.DailyVisits.Where(v => v.Date == today)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.Count, v => v.Count + 1), ct);
        if (updated > 0)
        {
            return;
        }

        var visit = new DailyVisit { Date = today, Count = 1 };
        try
        {
            db.DailyVisits.Add(visit);
            await db.SaveChangesAsync(ct);

            // Later increments go straight to the database; a tracked copy would go stale.
            db.Entry(visit).State = EntityState.Detached;
        }
        catch (DbUpdateException)
        {
            // Another request created today's row first; count this visit on it.
            db.ChangeTracker.Clear();
            await db.DailyVisits.Where(v => v.Date == today)
                .ExecuteUpdateAsync(s => s.SetProperty(v => v.Count, v => v.Count + 1), ct);
        }
    }
}
