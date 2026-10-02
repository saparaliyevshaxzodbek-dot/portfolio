using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Portfolio.Business.Services;
using Portfolio.Data.Entities;

namespace Portfolio.Business;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);
        services.AddScoped<IPasswordHasher<AdminUser>, PasswordHasher<AdminUser>>();
        services.AddScoped<SiteService>();
        services.AddScoped<ContactService>();
        services.AddScoped<ContentService>();
        services.AddScoped<AuthService>();
        services.AddScoped<DashboardService>();
        return services;
    }
}
