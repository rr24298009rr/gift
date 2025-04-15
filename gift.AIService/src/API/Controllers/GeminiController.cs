using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using gift.AIService.Domain.Entities;
using gift.AIService.Application.DTOs;

namespace gift.AIService.API.Controllers
{
    /// <summary>
    /// Gemini API 控制器
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class GeminiController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private const string GeminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        private const string ApiKey = "AIzaSyB6wz8Q8FxPPwmEhW8JuOZIIZjXwuoW79s";

        public GeminiController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        /// <summary>
        /// 處理對話並獲取 Gemini API 回應
        /// </summary>
        /// <param name="request">包含對話歷史的請求</param>
        /// <returns>API 處理後的回應文字</returns>
        /// <response code="200">成功處理文字並返回結果</response>
        /// <response code="400">無法從 Gemini API 獲取有效回應</response>
        /// <response code="500">處理請求時發生錯誤</response>
        [HttpPost("process")]
        [ProducesResponseType(typeof(GeminiResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GeminiResponseDTO>> ProcessText([FromBody] GeminiRequestDTO request)
        {
            try
            {
                var geminiRequest = new GeminiRequest
                {
                    Contents = request.Messages.Select(m => new Content
                    {
                        Role = m.Role,
                        Parts = new[] { new Part { Text = m.Text } }
                    }).ToArray()
                };

                var response = await _httpClient.PostAsJsonAsync(
                    $"{GeminiApiUrl}?key={ApiKey}",
                    geminiRequest
                );

                response.EnsureSuccessStatusCode();

                var geminiResponse = await response.Content.ReadFromJsonAsync<GeminiResponse>();
                
                if (geminiResponse?.Candidates?[0]?.Content?.Parts?[0]?.Text == null)
                {
                    return BadRequest("無法從Gemini API獲取有效回應");
                }

                return Ok(new GeminiResponseDTO
                {
                    Result = geminiResponse.Candidates[0].Content.Parts[0].Text
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"處理請求時發生錯誤: {ex.Message}");
            }
        }

        /// <summary>
        /// 取得所有可用的 Gemini 模型列表
        /// </summary>
        /// <returns>模型名稱列表</returns>
        /// <response code="200">成功獲取模型列表</response>
        /// <response code="500">處理請求時發生錯誤</response>
        [HttpGet("models")]
        [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<string>>> GetModels()
        {
            try
            {
                var response = await _httpClient.GetAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models?key={ApiKey}"
                );

                response.EnsureSuccessStatusCode();

                var modelsResponse = await response.Content.ReadFromJsonAsync<GeminiModelResponse>();
                
                if (modelsResponse?.Models == null)
                {
                    return new List<string>();
                }

                var displayNames = modelsResponse.Models
                    .Select(m => m.DisplayName)
                    .Where(name => !string.IsNullOrEmpty(name));

                return Ok(displayNames);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"獲取模型列表時發生錯誤: {ex.Message}");
            }
        }

        /// <summary>
        /// 測試 API 是否正常運作
        /// </summary>
        /// <returns>API 狀態訊息</returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public IActionResult Test()
        {
            return Ok(new { message = "Gemini API is working!" });
        }
    }
}