using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Portfolio.Data.Entities;
using static Portfolio.Data.Entities.LocalizedText;

namespace Portfolio.Business;

public class AdminSeedOptions
{
    public const string SectionName = "Admin";

    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// First-run content. Everything here can be changed later from the admin panel; the seeder only
/// fills empty tables and never overwrites edits.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasher<AdminUser> hasher, AdminSeedOptions admin, CancellationToken ct = default)
    {
        if (!string.IsNullOrWhiteSpace(admin.Username) && !await db.AdminUsers.AnyAsync(ct))
        {
            if (admin.Password.Length < 8 || admin.Password.StartsWith("CHANGE-ME", StringComparison.Ordinal))
            {
                throw new InvalidOperationException("Admin:Password must be a real password of at least 8 characters.");
            }

            var user = new AdminUser { Username = admin.Username.Trim() };
            user.PasswordHash = hasher.HashPassword(user, admin.Password);
            db.AdminUsers.Add(user);
        }

        if (!await db.Profiles.AnyAsync(ct))
        {
            db.Profiles.Add(Profile());
        }

        if (!await db.Skills.AnyAsync(ct))
        {
            db.Skills.AddRange(Skills());
        }

        if (!await db.Experiences.AnyAsync(ct))
        {
            db.Experiences.AddRange(Timeline());
        }

        if (!await db.Projects.AnyAsync(ct))
        {
            db.Projects.AddRange(Projects());
        }

        await db.SaveChangesAsync(ct);
    }

    private static Profile Profile() => new()
    {
        FullName = "Shaxzodbek Saparaliyev",
        Headline = Of(".NET Developer · ASP.NET Core & React", ".NET dasturchi · ASP.NET Core va React"),
        Summary = Of(
            "I build web applications end to end — from clean C# back ends on ASP.NET Core and EF Core to fast, polished React + TypeScript interfaces.",
            "Veb-ilovalarni boshidan oxirigacha yarataman — ASP.NET Core va EF Core'dagi toza C# backend'dan tortib React + TypeScript'dagi tezkor va chiroyli interfeyslargacha."),
        About = Of(
            "I'm a .NET developer from Tashkent who enjoys turning real business needs into working software. I study at TUIT and PDP Academy and this year completed the [Fundamentals] .NET program at EPAM Training Center, where I built ASP.NET Core MVC and Web API applications, covered them with unit tests and passed every task through automated build, test and code-quality checks.\n\n" +
            "Outside the program I build full-stack products. The latest one, Dasturxon, is a complete ordering and delivery system for a restaurant: a customer website, a live kitchen screen, a courier workflow and an analytics dashboard, all connected in real time with SignalR.\n\n" +
            "I care about clear architecture, readable code and interfaces that people genuinely enjoy using.",
            "Men Toshkentlik .NET dasturchiman, real biznes ehtiyojlarini ishlaydigan dasturga aylantirishni yaxshi ko'raman. TATU va PDP Academy'da o'qiyman, bu yil EPAM Training Center'da [Fundamentals] .NET dasturini tugatdim: ASP.NET Core MVC va Web API'da ilovalar yaratdim, ularni unit testlar bilan qopladim va har bir topshiriqni avtomatik build, test va kod sifati tekshiruvlaridan o'tkazdim.\n\n" +
            "Dasturdan tashqari to'liq (full-stack) mahsulotlar yarataman. Eng so'nggisi — Dasturxon: restoran uchun buyurtma va yetkazib berish tizimi. Unda mijozlar sayti, jonli oshxona ekrani, kuryerlar jarayoni va tahliliy panel bor — hammasi SignalR orqali real vaqtda bog'langan.\n\n" +
            "Men uchun aniq arxitektura, o'qilishi oson kod va odamlarga chindan yoqadigan interfeys muhim."),
        Location = Of("Tashkent, Uzbekistan", "Toshkent, O'zbekiston"),
        Email = "saparaliyevshaxzodbek@gmail.com",
        GitHub = "https://github.com/saparaliyevshaxzodbek-dot",
        OpenToWork = true,
    };

    private static IEnumerable<Skill> Skills()
    {
        (SkillCategory Category, string[] Names)[] groups =
        [
            (SkillCategory.Backend, ["C#", ".NET", "ASP.NET Core", "Web API", "MVC / Razor", "Entity Framework Core", "ADO.NET", "LINQ", "Async / TPL", "SignalR", "JWT / Identity", "REST", "OOP & SOLID", "Design Patterns", "Dependency Injection", "Clean Architecture"]),
            (SkillCategory.Frontend, ["React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML & CSS", "Vite"]),
            (SkillCategory.Database, ["SQL Server", "SQLite", "SQL", "EF Core Migrations"]),
            (SkillCategory.Tools, ["Git", "Visual Studio", "VS Code", "xUnit / NUnit", "Moq", "AutoMapper", "Swagger / Postman", "StyleCop / SonarQube"]),
        ];
        return groups.SelectMany(g => g.Names.Select((name, i) => new Skill { Name = name, Category = g.Category, SortOrder = (i + 1) * 10 }));
    }

    private static IEnumerable<Experience> Timeline() =>
    [
        new()
        {
            Type = ExperienceType.Work,
            Title = Of("Full-stack Developer", "Full-stack dasturchi"),
            Organization = "Personal project · Dasturxon",
            Description = Of(
                "Designed and built a restaurant ordering and delivery platform: ASP.NET Core 10 API, React 19 + TypeScript front end, real-time order flow with SignalR and role-based access for admins, managers, cooks and couriers.",
                "Restoran uchun buyurtma va yetkazib berish platformasini loyihalab yaratdim: ASP.NET Core 10 API, React 19 + TypeScript frontend, SignalR orqali real vaqtdagi buyurtmalar oqimi, admin, menejer, oshpaz va kuryerlar uchun rollar."),
            StartDate = new DateOnly(2026, 9, 1),
            SortOrder = 10,
        },
        new()
        {
            Type = ExperienceType.Course,
            Title = Of(".NET Trainee — [Fundamentals] .NET (completed)", ".NET o'quvchi — [Fundamentals] .NET (tugatilgan)"),
            Organization = "EPAM Training Center",
            Description = Of(
                "Completed EPAM's [Fundamentals] .NET training program: an ASP.NET Core MVC online store (SportsStore), a layered Web API with EF Core and AutoMapper (TradeMarket) and a three-tier capstone with ASP.NET Core Identity (To-Do List). Every task passed automated build, unit-test and code-quality review (StyleCop, SonarQube).",
                "EPAM'ning [Fundamentals] .NET o'quv dasturi tugatildi: ASP.NET Core MVC'da onlayn do'kon (SportsStore), EF Core va AutoMapper bilan qatlamli Web API (TradeMarket) va ASP.NET Core Identity bilan uch qatlamli bitiruv loyihasi (To-Do List). Har bir topshiriq avtomatik build, unit test va kod sifati tekshiruvidan (StyleCop, SonarQube) o'tgan."),
            StartDate = new DateOnly(2026, 6, 1),
            EndDate = new DateOnly(2026, 10, 1),
            Url = "https://www.epam.com",
            SortOrder = 20,
        },
        new()
        {
            Type = ExperienceType.Course,
            Title = Of("Software Development Course (C# / .NET)", "Dasturlash kursi (C# / .NET)"),
            Organization = "PDP Academy",
            Description = Of(
                "Intensive practical training in C# and .NET: object-oriented programming, data structures, databases and building back-end applications in a team.",
                "C# va .NET bo'yicha jadal amaliy ta'lim: obyektga yo'naltirilgan dasturlash, ma'lumotlar tuzilmalari, ma'lumotlar bazalari va jamoada backend ilovalar yaratish."),
            StartDate = new DateOnly(2023, 9, 1),
            SortOrder = 30,
        },
        new()
        {
            Type = ExperienceType.Education,
            Title = Of("Bachelor's degree in Information Technologies (in progress)", "Bakalavr, axborot texnologiyalari (o'qishda)"),
            Organization = "TUIT — Tashkent University of Information Technologies",
            Description = Of(
                "Studying computer science fundamentals: algorithms, programming, databases, networks and software engineering.",
                "Kompyuter fanlari asoslari: algoritmlar, dasturlash, ma'lumotlar bazalari, tarmoqlar va dasturiy injiniring."),
            StartDate = new DateOnly(2023, 9, 1),
            Url = "https://tuit.uz",
            SortOrder = 40,
        },
    ];

    private static IEnumerable<Project> Projects()
    {
        var dasturxon = new Project
        {
            Slug = "dasturxon",
            Year = 2026,
            IsFeatured = true,
            SortOrder = 10,
            Title = Of("Dasturxon — Restaurant Ordering & Delivery System", "Dasturxon — restoran buyurtma va yetkazib berish tizimi"),
            Summary = Of(
                "A full-stack platform for a grill & fish restaurant: online menu, delivery, live order tracking, kitchen and courier screens, analytics.",
                "Grill va baliq restorani uchun to'liq platforma: onlayn menyu, yetkazib berish, buyurtmani jonli kuzatish, oshxona va kuryer ekranlari, tahlil."),
            Description = Of(
                "Dasturxon covers the whole life of an order. A customer picks dishes from a photo menu, chooses delivery, pickup or dine-in, selects a delivery zone and sees the fee, minimum order and estimated time instantly. After checkout the tracking page updates in real time as the kitchen starts cooking and the courier heads out — including the courier's name and phone.\n\n" +
                "Staff work in a role-based panel. Cooks get a live kitchen board with sound alerts, couriers see only the deliveries waiting for them, managers assign couriers, edit the menu and delivery zones, and the dashboard shows today's orders, revenue, average check and best-selling dishes.\n\n" +
                "The back end is a layered ASP.NET Core 10 solution (Data · Business · Web API) with EF Core, JWT authentication and SignalR. Storage switches between SQLite for demos and SQL Server for production with a single setting, and one publish command packs the React front end and the API into a single deployable folder.",
                "Dasturxon buyurtmaning butun hayotini qamrab oladi. Mijoz rasmli menyudan taom tanlaydi, yetkazib berish, olib ketish yoki restoranda ovqatlanishni belgilaydi, hududni tanlaydi va narx, eng kam buyurtma hamda vaqtni darhol ko'radi. Buyurtmadan so'ng kuzatish sahifasi oshxona tayyorlashni boshlaganda va kuryer yo'lga chiqqanda real vaqtda yangilanadi — kuryerning ismi va telefoni bilan.\n\n" +
                "Xodimlar rollarga asoslangan panelda ishlaydi. Oshpazlar ovozli signalli jonli oshxona ekranini ko'radi, kuryerlar faqat o'zlarini kutayotgan yetkazishlarni ko'radi, menejerlar kuryer tayinlaydi, menyu va hududlarni tahrirlaydi, dashboard esa bugungi buyurtmalar, tushum, o'rtacha chek va eng ko'p sotilgan taomlarni ko'rsatadi.\n\n" +
                "Backend — qatlamli ASP.NET Core 10 yechimi (Data · Business · Web API): EF Core, JWT autentifikatsiya va SignalR. Ma'lumotlar bazasi bitta sozlama bilan demo uchun SQLite'dan production uchun SQL Server'ga o'tadi, bitta publish buyrug'i esa React frontend va API'ni serverga yuklanadigan bitta papkaga yig'adi."),
            Highlights = Of(
                "Real-time kitchen, courier and customer screens with SignalR\nRole-based access for Admin, Manager, Cook and Courier (JWT)\nDelivery zones with fees, minimum order and free-delivery thresholds\nOrder state machine enforced on the server with per-role rules\nAnalytics dashboard: revenue, average check, top dishes\nSQLite ↔ SQL Server switch, single-folder publish\nCovered by automated xUnit tests",
                "SignalR orqali real vaqtdagi oshxona, kuryer va mijoz ekranlari\nAdmin, Menejer, Oshpaz va Kuryer uchun rollar (JWT)\nNarx, eng kam buyurtma va bepul yetkazish chegarasi bilan hududlar\nServerda har bir rol uchun qoidalari bor buyurtma holatlari zanjiri\nTahliliy panel: tushum, o'rtacha chek, eng ko'p sotilgan taomlar\nSQLite ↔ SQL Server almashtirish, bitta papkaga publish\nAvtomatik xUnit testlar bilan qoplangan"),
            TechStack = "ASP.NET Core 10, EF Core, SignalR, SQL Server, SQLite, JWT, React 19, TypeScript, Tailwind CSS, Vite, xUnit",
            CoverImageUrl = "/images/projects/dasturxon/cover.jpg",
            RepoUrl = "https://github.com/saparaliyevshaxzodbek-dot/dasturxon",
        };
        (string File, string En, string Uz)[] shots =
        [
            ("home", "Home page with a photo collage of signature dishes", "Bosh sahifa: asosiy taomlar kollaji"),
            ("menu", "Photo menu with categories, badges and quick add", "Kategoriyalar va belgilar bilan rasmli menyu"),
            ("fish", "Featured fish section", "Baliq taomlari bo'limi"),
            ("checkout", "Checkout with delivery zones, fee and payment method", "Hudud, narx va to'lov usuli bilan rasmiylashtirish"),
            ("tracking", "Live order tracking with courier details", "Kuryer ma'lumotlari bilan buyurtmani jonli kuzatish"),
            ("board", "Real-time kitchen board for staff", "Xodimlar uchun real vaqtdagi oshxona ekrani"),
            ("dashboard", "Manager dashboard with revenue and top dishes", "Tushum va eng ko'p sotilgan taomlar bilan menejer paneli"),
            ("mobile", "Mobile layout", "Telefon ko'rinishi"),
        ];
        for (var i = 0; i < shots.Length; i++)
        {
            dasturxon.Images.Add(new ProjectImage
            {
                Url = $"/images/projects/dasturxon/{shots[i].File}.jpg",
                Caption = Of(shots[i].En, shots[i].Uz),
                SortOrder = (i + 1) * 10,
            });
        }

        var sportsStore = new Project
        {
            Slug = "sportsstore",
            Year = 2026,
            SortOrder = 20,
            Title = Of("SportsStore — Online Store", "SportsStore — onlayn do'kon"),
            Summary = Of(
                "An ASP.NET Core MVC e-commerce application built step by step: catalog, cart, checkout and administration.",
                "Bosqichma-bosqich qurilgan ASP.NET Core MVC onlayn do'kon: katalog, savat, buyurtma va boshqaruv."),
            Description = Of(
                "A classic online store built in five incremental steps as part of EPAM's .NET program. Products are stored with Entity Framework Core and shown in a paginated catalog with category navigation. Shoppers fill a session-based cart and place orders through a validated checkout; administrators manage products and orders.\n\n" +
                "Each step was submitted to an automated pipeline that compiled the solution, ran the unit tests and checked code quality, so the design kept controllers thin and testable.",
                "EPAM .NET dasturi doirasida besh bosqichda qurilgan klassik onlayn do'kon. Mahsulotlar Entity Framework Core orqali saqlanadi va sahifalangan, kategoriyali katalogda ko'rsatiladi. Xaridor sessiyaga asoslangan savatni to'ldiradi va tekshiruvli rasmiylashtirish orqali buyurtma beradi; administratorlar mahsulot va buyurtmalarni boshqaradi.\n\n" +
                "Har bir bosqich avtomatik tizimga topshirilgan: u yechimni build qilgan, unit testlarni ishga tushirgan va kod sifatini tekshirgan — shuning uchun controllerlar yengil va testlanadigan qilib yozilgan."),
            Highlights = Of(
                "Paginated product catalog with category filtering\nSession-based shopping cart and validated checkout\nProduct and order administration\nRepository pattern over EF Core\nUnit tests for controllers and view components",
                "Kategoriya filtri bilan sahifalangan katalog\nSessiyaga asoslangan savat va tekshiruvli rasmiylashtirish\nMahsulot va buyurtmalarni boshqarish\nEF Core ustida Repository pattern\nController va view componentlar uchun unit testlar"),
            TechStack = "ASP.NET Core MVC, Razor, EF Core, SQL Server, xUnit, Moq",
            CoverImageUrl = "/images/projects/sportsstore/cover.svg",
        };

        var tradeMarket = new Project
        {
            Slug = "trademarket",
            Year = 2026,
            SortOrder = 30,
            Title = Of("TradeMarket — Layered Marketplace API", "TradeMarket — qatlamli marketplace API"),
            Summary = Of(
                "A three-layer ASP.NET Core Web API for a marketplace: data access, business logic and REST endpoints, fully unit-tested.",
                "Marketplace uchun uch qatlamli ASP.NET Core Web API: ma'lumotlarga kirish, biznes-logika va REST endpointlar, to'liq unit testlangan."),
            Description = Of(
                "A marketplace back end split into clean layers. The data layer exposes EF Core repositories behind a Unit of Work; the business layer maps entities to models with AutoMapper, validates input and implements the use cases (customers, products, receipts, statistics); the Web API layer publishes them as REST endpoints.\n\n" +
                "The solution was graded by automated tests and static analysis, so it is built to zero warnings under StyleCop and SonarQube rules.",
                "Toza qatlamlarga ajratilgan marketplace backend'i. Ma'lumotlar qatlami Unit of Work ortida EF Core repozitoriylarini taqdim etadi; biznes qatlami AutoMapper bilan entity'larni modellarga o'giradi, kiritilgan ma'lumotni tekshiradi va use case'larni (mijozlar, mahsulotlar, cheklar, statistika) amalga oshiradi; Web API qatlami ularni REST endpointlar sifatida chiqaradi.\n\n" +
                "Yechim avtomatik testlar va statik tahlil bilan baholangan, shu sababli StyleCop va SonarQube qoidalari bo'yicha nol ogohlantirish bilan yozilgan."),
            Highlights = Of(
                "Data · Business · Web API layers with clear boundaries\nRepositories and Unit of Work over EF Core\nAutoMapper profiles and input validation\nNUnit, Moq and FluentAssertions test suites\nZero warnings under StyleCop and SonarQube",
                "Aniq chegarali Data · Business · Web API qatlamlari\nEF Core ustida Repository va Unit of Work\nAutoMapper profillari va kirish ma'lumotlarini tekshirish\nNUnit, Moq va FluentAssertions testlari\nStyleCop va SonarQube bo'yicha nol ogohlantirish"),
            TechStack = "ASP.NET Core Web API, EF Core, AutoMapper, NUnit, Moq, FluentAssertions",
            CoverImageUrl = "/images/projects/trademarket/cover.svg",
        };

        var todoList = new Project
        {
            Slug = "todo-list",
            Year = 2026,
            SortOrder = 40,
            Title = Of("To-Do List — Three-Tier Web Application", "To-Do List — uch qatlamli veb-ilova"),
            Summary = Of(
                "An MVC web app and a separate REST API talking over HTTP, with ASP.NET Core Identity and per-user data isolation.",
                "HTTP orqali bog'langan MVC veb-ilova va alohida REST API, ASP.NET Core Identity va har bir foydalanuvchi ma'lumotlarini ajratish bilan."),
            Description = Of(
                "The EPAM capstone, built from an empty solution. The browser-facing MVC application and the REST API are separate processes that communicate only over HTTP, each with its own SQL Server database: one for ASP.NET Core Identity users, one for the to-do data.\n\n" +
                "A custom authentication handler validates a shared API token and carries the signed-in user's identity to the API, so every controller filters data by owner without the two apps sharing code. Users manage task lists, tasks with due dates and statuses, tags and search, and can recover a forgotten password.",
                "Bo'sh yechimdan qurilgan EPAM bitiruv loyihasi. Brauzer bilan ishlaydigan MVC ilova va REST API — faqat HTTP orqali bog'lanadigan alohida jarayonlar, har birining o'z SQL Server bazasi bor: biri ASP.NET Core Identity foydalanuvchilari uchun, biri vazifalar uchun.\n\n" +
                "Maxsus autentifikatsiya handler umumiy API tokenni tekshiradi va tizimga kirgan foydalanuvchini API'ga uzatadi — shu tufayli ikki ilova kod bo'lishmasdan har bir controller ma'lumotni egasi bo'yicha filtrlaydi. Foydalanuvchilar vazifalar ro'yxati, muddat va holatli vazifalar, teglar va qidiruv bilan ishlaydi, unutilgan parolni tiklashi mumkin."),
            Highlights = Of(
                "Web app and API as separate tiers that talk only over HTTP\nASP.NET Core Identity with password recovery\nCustom auth handler for per-user data isolation\nTwo SQL Server LocalDB databases\nTask lists, due dates, statuses, tags and search",
                "Faqat HTTP orqali bog'langan alohida veb-ilova va API qatlamlari\nParolni tiklash bilan ASP.NET Core Identity\nHar bir foydalanuvchi ma'lumotini ajratuvchi maxsus auth handler\nIkkita SQL Server LocalDB bazasi\nVazifalar ro'yxati, muddatlar, holatlar, teglar va qidiruv"),
            TechStack = "ASP.NET Core MVC, ASP.NET Core Web API, Identity, EF Core, SQL Server LocalDB",
            CoverImageUrl = "/images/projects/todo-list/cover.svg",
        };

        return [dasturxon, sportsStore, tradeMarket, todoList];
    }
}
