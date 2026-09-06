namespace BookManagement.Domain.Enums
{
    // Lives in Domain because "what genres exist" is a core business
    // concept, not tied to how it's displayed (Web) or stored (Infrastructure).
    public enum Genre
    {
        Fiction = 0,
        NonFiction = 1,
        SciFi = 2,
        Fantasy = 3,
        Biography = 4,
        History = 5,
        Mystery = 6,
        Romance = 7,
        SelfHelp = 8,
        Technology = 9
    }
}
