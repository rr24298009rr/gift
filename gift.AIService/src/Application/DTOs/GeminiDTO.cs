namespace gift.AIService.Application.DTOs
{
    public class MessageDTO
    {
        public string Role { get; set; } = default!;
        public string Text { get; set; } = default!;
    }

    public class GeminiRequestDTO
    {
        public List<MessageDTO> Messages { get; set; } = new List<MessageDTO>();
    }

    public class GeminiResponseDTO
    {
        public string Result { get; set; } = default!;
    }
}