using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models.Domain;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using Sabio.Models.Requests.Messages;
using Sabio.Services.Interfaces;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/messages")]
    [ApiController]
    public class MessagesApiController : BaseApiController
    {
        private IMessageService _service = null;
        private IAuthenticationService<int> _authService = null;

        public MessagesApiController(IMessageService service
            , ILogger<MessagesApiController> logger
            , IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(MessagesAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                int senderId = _authService.GetCurrentUserId();

                int id = _service.Add(model, senderId);

                ItemResponse<int> response = new ItemResponse<int>() { Item = id };

                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(MessagesUpdateRequest model)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                _service.Update(model, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }

        [HttpGet("feed")]
        public ActionResult<ItemsResponse<Message>> GetByCurrent()
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                int recipientId = _authService.GetCurrentUserId();
                List<Message> list = _service.GetByCurrent(recipientId);

                if (list == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Messages not found");
                }
                else
                {
                    response = new ItemsResponse<Message> { Items = list };
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Exception Error: { ex.Message }");
            }

            return StatusCode(iCode, response);
        }

        [HttpGet("inbox")]
        public ActionResult<ItemsResponse<Inbox>> GetInboxFeed()
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                int recipientId = _authService.GetCurrentUserId();
                List<Inbox> list = _service.GetInboxFeed(recipientId).GroupBy(x => x.Id).Select(x => x.First()).ToList(); ;


                if (list == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Messages not found");
                }
                else
                {
                    

                    response = new ItemsResponse<Inbox> { Items = list };
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Exception Error: { ex.Message }");
            }

            return StatusCode(iCode, response);
        }

        [HttpGet("{recipientId:int}/{senderId:int}")]
        public ActionResult<ItemsResponse<Message>> GetByConversation(int recipientId, int senderId)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                List<Message> list = _service.GetByConversation(recipientId, senderId);

                if (list == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Messages not found");
                }
                else
                {
                    response = new ItemsResponse<Message> { Items = list };
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Exception Error: { ex.Message }");
            }

            return StatusCode(iCode, response);
        }

        [HttpDelete("{id:int}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                _service.Delete(id);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }
    }
}