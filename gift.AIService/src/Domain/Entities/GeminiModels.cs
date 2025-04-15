namespace gift.AIService.Domain.Entities
{
    public class GeminiRequest
    {
        public Content[] Contents { get; set; } = default!;
    }

    public class Content
    {
        public string Role { get; set; } = default!;
        public Part[] Parts { get; set; } = default!;
    }

    public class Part
    {
        public string Text { get; set; } = default!;
    }

    public class GeminiResponse
    {
        public Candidate[] Candidates { get; set; } = default!;
    }

    public class Candidate
    {
        public Content Content { get; set; } = default!;
    }

    public class GeminiModelResponse
    {
        public GeminiModel[] Models { get; set; } = default!;
    }

    public class GeminiModel
    {
        public string Name { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
    }
}