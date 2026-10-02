using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Portfolio.Business.Dtos;
using Portfolio.Business.Services;
using Portfolio.WebApi.Infrastructure;

namespace Portfolio.WebApi.Controllers;

/// <summary>Read-only data for the public portfolio site.</summary>
[ApiController]
[Route("api")]
public class SiteController(SiteService site) : ControllerBase
{
    [HttpGet("site")]
    public Task<SiteDto> Get(CancellationToken ct) => site.GetAsync(ct);

    [HttpGet("projects/{slug}")]
    public Task<ProjectDto> GetProject(string slug, CancellationToken ct) => site.GetProjectAsync(slug, ct);

    /// <summary>Anonymous page-view counter for the admin dashboard.</summary>
    [HttpPost("visits")]
    [EnableRateLimiting(RateLimits.Visits)]
    public async Task<IActionResult> RecordVisit(CancellationToken ct)
    {
        await site.RecordVisitAsync(ct);
        return this.NoContent();
    }
}

[ApiController]
[Route("api/contact")]
public class ContactController(ContactService contact) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting(RateLimits.Contact)]
    public async Task<IActionResult> Send(ContactRequest request, CancellationToken ct)
    {
        // Spam caught by the honeypot gets the same answer, so bots learn nothing.
        await contact.SubmitAsync(request, ct);
        return this.NoContent();
    }
}

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService auth) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting(RateLimits.Login)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await auth.LoginAsync(request, ct);
        if (result is null)
        {
            return this.Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Wrong username or password.");
        }

        return result;
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<object> Me() => new { username = this.User.UserName() };
}
