using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Business;
using Portfolio.Business.Services;
using Portfolio.Data.Entities;

namespace Portfolio.WebApi.Infrastructure;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;

    public string Issuer { get; set; } = "Portfolio";

    public string Audience { get; set; } = "Portfolio";

    public int ExpiresHours { get; set; } = 12;

    public SymmetricSecurityKey GetSigningKey() => new(Encoding.UTF8.GetBytes(this.Key));

    public void Validate()
    {
        // HMAC-SHA256 needs at least a 256-bit key.
        if (Encoding.UTF8.GetByteCount(this.Key) < 32)
        {
            throw new InvalidOperationException(
                "Jwt:Key must be at least 32 characters. Set it in appsettings or the Jwt__Key environment variable.");
        }

        if (this.Key.StartsWith("CHANGE-ME", StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Jwt:Key is still the placeholder. Replace it with a random secret.");
        }
    }
}

public class JwtTokenService(JwtOptions options, TimeProvider time) : ITokenService
{
    private readonly JsonWebTokenHandler handler = new();

    public (string Token, DateTime ExpiresAt) CreateToken(AdminUser user)
    {
        var now = time.GetUtcNow().UtcDateTime;
        var expiresAt = now.AddHours(options.ExpiresHours);
        var token = this.handler.CreateToken(new SecurityTokenDescriptor
        {
            Issuer = options.Issuer,
            Audience = options.Audience,
            IssuedAt = now,
            NotBefore = now,
            Expires = expiresAt,
            Claims = new Dictionary<string, object>
            {
                ["sub"] = user.Id.ToString(CultureInfo.InvariantCulture),
                ["name"] = user.Username,
            },
            SigningCredentials = new SigningCredentials(options.GetSigningKey(), SecurityAlgorithms.HmacSha256),
        });
        return (token, expiresAt);
    }
}

/// <summary>Turns business exceptions into ProblemDetails responses with a readable message.</summary>
public class AppExceptionHandler(IProblemDetailsService problemDetails, ILogger<AppExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var status = exception switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            BusinessRuleException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError,
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception for {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);
        }

        httpContext.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Title = status == StatusCodes.Status500InternalServerError ? "Something went wrong on the server." : exception.Message,
            },
        });
    }
}

public static class RateLimits
{
    public const string Login = "login";
    public const string Contact = "contact";
    public const string Visits = "visits";
}

public static class ClaimsPrincipalExtensions
{
    public static string UserName(this ClaimsPrincipal user) => user.FindFirstValue("name") ?? string.Empty;
}
