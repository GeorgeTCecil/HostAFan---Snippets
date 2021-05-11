using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Sabio.Models.Requests.Messages;
using Sabio.Models;
using Sabio.Services.Interfaces;
using Sabio.Services;

namespace Sabio.Services
{
    public class MessageService : IMessageService
    {
        private IDataProvider _data = null;
        private IAuthenticationService<int> _authService = null;
        private IUserDetailMapper _userDetail = null;

        public MessageService(IDataProvider data, IAuthenticationService<int> authService, IUserDetailMapper userDetail)
        {
            _data = data;
            _authService = authService;
            _userDetail = userDetail;
        }

        public int Add(MessagesAddRequest model, int userId)
        {
            int id = 0;

            string procName = "[dbo].[Messages_Insert]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                commonParams(model, col, userId);

                SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;

                col.Add(idOut);
            }, returnParameters: delegate (SqlParameterCollection returnCollection)
            {
                object oId = returnCollection["@Id"].Value;

                int.TryParse(oId.ToString(), out id);
            });
            return id;
        }

        public void Update(MessagesUpdateRequest model, int userId)
        {
            string procName = "[dbo].[Messages_Update]";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    commonParams(model, col, userId);

                    col.AddWithValue("@Id", model.Id);
                }, returnParameters: null);
        }

        public List<Message> GetByCurrent(int recipientId)
        {
            string procName = "[dbo].[Messages_Select_ByRecipientId]";

            List<Message> list = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {
                paramCollection.AddWithValue("@RecipientId", recipientId);
            }, delegate (IDataReader reader, short set)
            {
                Message aMessage = MapMessages(reader);

                if (list == null)
                {
                    list = new List<Message>();
                }

                list.Add(aMessage);
            }
            );

            return list;
        }

        public List<Inbox> GetInboxFeed(int recipientId)
        {
            string procName = "[dbo].[Messages_Select_ByInboxFeed]";

            List<Inbox> list = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {
                paramCollection.AddWithValue("@RecipientId", recipientId);
            }, delegate (IDataReader reader, short set)
            {
                Inbox aSender = MapSender(reader);

                if (list == null)
                {
                    list = new List<Inbox>();

                }

                list.Add(aSender);
            }
            );
            

            return list;
        }

        public List<Message> GetByConversation(int recipientId, int senderId)
        {
            string procName = "[dbo].[Messages_Select_ByConversation]";

            List<Message> list = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {
                paramCollection.AddWithValue("@RecipientId", recipientId);
                paramCollection.AddWithValue("@SenderId", senderId);
            }, delegate (IDataReader reader, short set)
            {
                Message aMessage = MapMessages(reader);

                if (list == null)
                {
                    list = new List<Message>();
                }

                list.Add(aMessage);
            }
            );

            return list;
        }

        public void Delete(int id)
        {
            string procName = "[dbo].[Messages_Delete_ById]";
            _data.ExecuteNonQuery(procName,
                delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Id", id);
                });
        }

        public Message MapMessages(IDataReader reader)
        {
            int startingIndex = 0;

            Message aMessage = new Message();
            aMessage.Id = reader.GetSafeInt32(startingIndex++);
            aMessage.Content = reader.GetSafeString(startingIndex++);
            aMessage.Subject = reader.GetSafeString(startingIndex++);
            aMessage.Recipient = _userDetail.MapUserDetail(reader, ref startingIndex);
            aMessage.Sender = _userDetail.MapUserDetail(reader, ref startingIndex);
            aMessage.DateSent = reader.GetSafeDateTimeNullable(startingIndex++);
            aMessage.DateRead = reader.GetSafeDateTimeNullable(startingIndex++);
            aMessage.DateModified = reader.GetSafeDateTime(startingIndex++);
            aMessage.DateCreated = reader.GetSafeDateTime(startingIndex++);
            return aMessage;
        }

        public Inbox MapSender(IDataReader reader)
        {
            int startingIndex = 0;

            Inbox aSender = new Inbox();
            aSender.Id = reader.GetSafeInt32(startingIndex++);
            aSender.FirstName = reader.GetSafeString(startingIndex++);
            aSender.LastName = reader.GetSafeString(startingIndex++);
            aSender.AvatarUrl = reader.GetSafeString(startingIndex++);
            aSender.DateSent = reader.GetSafeDateTimeNullable(startingIndex++);
            aSender.DateRead = reader.GetSafeDateTimeNullable(startingIndex++);
            aSender.DateModified = reader.GetSafeDateTime(startingIndex++);
            aSender.DateCreated = reader.GetSafeDateTime(startingIndex++);
            return aSender;
        }

        private static void commonParams(MessagesAddRequest model, SqlParameterCollection col, int userId)
        {
            col.AddWithValue("@Content", model.Content);
            col.AddWithValue("@Subject", model.Subject);
            col.AddWithValue("@RecipientId", model.RecipientId);
            col.AddWithValue("@SenderId", userId);
        }
    }
}