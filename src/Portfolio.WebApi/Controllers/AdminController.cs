using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Business.Dtos;
using Portfolio.Business.Services;

namespace Portfolio.WebApi.Controllers;

/// <summary>Content management for the site owner.</summary>
[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController(ContentService content, ContactService contact, DashboardService dashboard, IWebHostEnvironment environment) : ControllerBase
{
    private const long MaxUploadBytes = 8 * 1024 * 1024;

    // SVG is left out on purpose: it can carry scripts.
    private static readonly Dictionary<string, string> AllowedUploads = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/",
        [".jpeg"] = "image/",
        [".png"] = "image/",
        [".webp"] = "image/",
        [".pdf"] = "application/pdf",
    };

    [HttpGet("dashboard")]
    public Task<DashboardDto> Dashboard(CancellationToken ct) => dashboard.GetAsync(ct);

    // ---- Profile ----

    [HttpGet("profile")]
    public Task<ProfileDto> GetProfile(CancellationToken ct) => content.GetProfileAsync(ct);

    [HttpPut("profile")]
    public Task<ProfileDto> UpdateProfile(ProfileRequest request, CancellationToken ct) => content.UpdateProfileAsync(request, ct);

    // ---- Skills ----

    [HttpGet("skills")]
    public Task<IReadOnlyList<SkillDto>> GetSkills(CancellationToken ct) => content.GetSkillsAsync(ct);

    [HttpPost("skills")]
    public Task<SkillDto> CreateSkill(SkillRequest request, CancellationToken ct) => content.SaveSkillAsync(null, request, ct);

    [HttpPut("skills/{id:int}")]
    public Task<SkillDto> UpdateSkill(int id, SkillRequest request, CancellationToken ct) => content.SaveSkillAsync(id, request, ct);

    [HttpDelete("skills/{id:int}")]
    public async Task<IActionResult> DeleteSkill(int id, CancellationToken ct)
    {
        await content.DeleteSkillAsync(id, ct);
        return this.NoContent();
    }

    // ---- Timeline ----

    [HttpGet("experiences")]
    public Task<IReadOnlyList<ExperienceDto>> GetExperiences(CancellationToken ct) => content.GetExperiencesAsync(ct);

    [HttpPost("experiences")]
    public Task<ExperienceDto> CreateExperience(ExperienceRequest request, CancellationToken ct) => content.SaveExperienceAsync(null, request, ct);

    [HttpPut("experiences/{id:int}")]
    public Task<ExperienceDto> UpdateExperience(int id, ExperienceRequest request, CancellationToken ct) => content.SaveExperienceAsync(id, request, ct);

    [HttpDelete("experiences/{id:int}")]
    public async Task<IActionResult> DeleteExperience(int id, CancellationToken ct)
    {
        await content.DeleteExperienceAsync(id, ct);
        return this.NoContent();
    }

    // ---- Projects ----

    [HttpGet("projects")]
    public Task<IReadOnlyList<ProjectDto>> GetProjects(CancellationToken ct) => content.GetProjectsAsync(ct);

    [HttpPost("projects")]
    public Task<ProjectDto> CreateProject(ProjectRequest request, CancellationToken ct) => content.SaveProjectAsync(null, request, ct);

    [HttpPut("projects/{id:int}")]
    public Task<ProjectDto> UpdateProject(int id, ProjectRequest request, CancellationToken ct) => content.SaveProjectAsync(id, request, ct);

    [HttpDelete("projects/{id:int}")]
    public async Task<IActionResult> DeleteProject(int id, CancellationToken ct)
    {
        await content.DeleteProjectAsync(id, ct);
        return this.NoContent();
    }

    [HttpPost("projects/{id:int}/images")]
    public Task<ProjectImageDto> AddProjectImage(int id, ProjectImageRequest request, CancellationToken ct) =>
        content.AddProjectImageAsync(id, request, ct);

    [HttpDelete("projects/{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteProjectImage(int id, int imageId, CancellationToken ct)
    {
        await content.DeleteProjectImageAsync(id, imageId, ct);
        return this.NoContent();
    }

    // ---- Messages ----

    [HttpGet("messages")]
    public Task<IReadOnlyList<ContactMessageDto>> GetMessages(CancellationToken ct) => contact.GetAllAsync(ct);

    [HttpPatch("messages/{id:int}")]
    public async Task<IActionResult> SetRead(int id, [FromBody] SetReadRequest request, CancellationToken ct)
    {
        await contact.SetReadAsync(id, request.IsRead, ct);
        return this.NoContent();
    }

    [HttpDelete("messages/{id:int}")]
    public async Task<IActionResult> DeleteMessage(int id, CancellationToken ct)
    {
        await contact.DeleteAsync(id, ct);
        return this.NoContent();
    }

    // ---- Uploads ----

    /// <summary>Photos (JPG, PNG, WEBP) and the CV (PDF), stored under wwwroot/uploads.</summary>
    [HttpPost("uploads")]
    [RequestSizeLimit(MaxUploadBytes + (64 * 1024))]
    public async Task<ActionResult<UploadResult>> Upload(IFormFile file, CancellationToken ct)
    {
        var extension = Path.GetExtension(file.FileName);
        if (!AllowedUploads.TryGetValue(extension, out var contentType) || !file.ContentType.StartsWith(contentType, StringComparison.OrdinalIgnoreCase))
        {
            return this.Problem(statusCode: StatusCodes.Status400BadRequest, title: "Only JPG, PNG, WEBP images or a PDF can be uploaded.");
        }

        if (file.Length is 0 or > MaxUploadBytes)
        {
            return this.Problem(statusCode: StatusCodes.Status400BadRequest, title: "The file must be smaller than 8 MB.");
        }

        var folder = Path.Combine(environment.WebRootPath, "uploads");
        Directory.CreateDirectory(folder);
        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        await using (var stream = System.IO.File.Create(Path.Combine(folder, fileName)))
        {
            await file.CopyToAsync(stream, ct);
        }

        return new UploadResult($"/uploads/{fileName}");
    }
}

public record SetReadRequest(bool IsRead);

public record UploadResult(string Url);
