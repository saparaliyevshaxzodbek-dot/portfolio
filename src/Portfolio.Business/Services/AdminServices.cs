using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Portfolio.Business.Dtos;
using Portfolio.Data;
using Portfolio.Data.Entities;

namespace Portfolio.Business.Services;

/// <summary>Issues access tokens; implemented by the web layer that owns the JWT settings.</summary>
public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateToken(AdminUser user);
}

public class AuthService(AppDbContext db, IPasswordHasher<AdminUser> hasher, ITokenService tokens)
{
    /// <summary>Returns null when the username or password is wrong.</summary>
    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username.Trim(), ct);
        if (user is null)
        {
            return null;
        }

        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = hasher.HashPassword(user, request.Password);
            await db.SaveChangesAsync(ct);
        }

        var (token, expiresAt) = tokens.CreateToken(user);
        return new LoginResponse(token, expiresAt, user.Username);
    }
}

public class DashboardService(AppDbContext db, TimeProvider time)
{
    public async Task<DashboardDto> GetAsync(CancellationToken ct = default)
    {
        var today = LocalClock.Today(time);
        var from = today.AddDays(-29);
        var visits = await db.DailyVisits.AsNoTracking().Where(v => v.Date >= from).ToListAsync(ct);
        var byDay = visits.ToDictionary(v => v.Date, v => v.Count);

        var last14 = Enumerable.Range(0, 14)
            .Select(i => today.AddDays(i - 13))
            .Select(d => new DailyVisitDto(d, byDay.GetValueOrDefault(d)))
            .ToList();

        return new DashboardDto(
            byDay.GetValueOrDefault(today),
            visits.Sum(v => v.Count),
            last14,
            await db.ContactMessages.CountAsync(m => !m.IsRead, ct),
            await db.ContactMessages.CountAsync(ct),
            await db.Projects.CountAsync(ct),
            await db.Skills.CountAsync(ct));
    }
}
