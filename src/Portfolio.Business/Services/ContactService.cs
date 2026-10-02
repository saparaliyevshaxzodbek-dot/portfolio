using Microsoft.EntityFrameworkCore;
using Portfolio.Business.Dtos;
using Portfolio.Data;
using Portfolio.Data.Entities;

namespace Portfolio.Business.Services;

public class ContactService(AppDbContext db)
{
    /// <summary>Saves a message from the contact form. Returns false when it was silently dropped as spam.</summary>
    public async Task<bool> SubmitAsync(ContactRequest request, CancellationToken ct = default)
    {
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            return false;
        }

        db.ContactMessages.Add(new ContactMessage
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Message = request.Message.Trim(),
        });
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<ContactMessageDto>> GetAllAsync(CancellationToken ct = default)
    {
        var messages = await db.ContactMessages.AsNoTracking()
            .OrderBy(m => m.IsRead).ThenByDescending(m => m.CreatedAt)
            .ToListAsync(ct);
        return messages.Select(m => m.ToDto()).ToList();
    }

    public async Task SetReadAsync(int id, bool isRead, CancellationToken ct = default)
    {
        var message = await db.ContactMessages.FirstOrDefaultAsync(m => m.Id == id, ct)
            ?? throw new NotFoundException("Message not found.");
        message.IsRead = isRead;
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var deleted = await db.ContactMessages.Where(m => m.Id == id).ExecuteDeleteAsync(ct);
        if (deleted == 0)
        {
            throw new NotFoundException("Message not found.");
        }
    }
}
