using Amazon;
using Amazon.S3;
using Amazon.S3.Transfer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Sabio.Data.Providers;
using Sabio.Models.AppSettings;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace Sabio.Services
{
    public class FileService : IFileService
    {
        IDataProvider _data = null;

        private AppKeys _appKeys;
        private static readonly RegionEndpoint bucketRegion = RegionEndpoint.USWest2;

        public FileService(IDataProvider data, IOptions<AppKeys> appKeys)
        {
            _data = data;
            _appKeys = appKeys.Value;
        }

        public  List<UrlObject> MultipleUpload(IFormFile[] files, int userId)
        {
            List<UrlObject> urlsList = new List<UrlObject>();
            FileAddRequest request = new FileAddRequest();

            var s3Client = new AmazonS3Client(_appKeys.AWSAccessKey, _appKeys.AWSSecretKey, bucketRegion);
            var fileTransferUtility = new TransferUtility(s3Client);

            foreach (IFormFile file in files)
            {
                if (file.Length > 0) 
                {
                    string keyName = "hostfan/" + Guid.NewGuid() + "/" + file.FileName;

                    fileTransferUtility.UploadAsync(file.OpenReadStream(), _appKeys.AWSBucketName, keyName).Wait();

                    request.Name = file.FileName;
                    request.Url = _appKeys.AWSDomain + keyName;
                    request.FileTypeId = SortFileType(file.ContentType);

                    UrlObject url = Add(request, userId);

                    urlsList.Add(url);
                }
            }
            return urlsList;
        }

        public UrlObject Add(FileAddRequest model, int userId)
        {
            UrlObject urlObj = null;
            int id = 0;

            string procName = "[dbo].[Files_Insert]";

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Name", model.Name);
                    col.AddWithValue("@Url", model.Url);
                    col.AddWithValue("@FileTypeId", model.FileTypeId);
                    col.AddWithValue("@CreatedBy", userId);

                    SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                    idOut.Direction = ParameterDirection.Output;

                    col.Add(idOut);
                },
                returnParameters: delegate (SqlParameterCollection returnCol)
                {
                    object oId = returnCol["@Id"].Value;
                    int.TryParse(oId.ToString(), out id);
                   
                });

            urlObj = new UrlObject() { 
                Id = id, 
                Name = model.Name,
                Url = model.Url
            };

            return urlObj;
        }

        public int SortFileType(string fileType)
        {
            int id = 0;

            switch (fileType)
            {
                case "application/pdf":
                    id = 2;
                    break;
                case "image/jpeg":
                    id = 3;
                    break;
                case "image/png":
                    id = 4;
                    break;
                default:
                    id = 1;
                    break;
            }

            return id;
        }
    }
}
