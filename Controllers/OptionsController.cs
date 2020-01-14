using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using ProductionTimerCore;
using ProductionTimerCore.Models;
using Harris.Automation.ADC.Logger;

namespace ProductionTimer.Controllers
{
    public class OptionsController : BaseController
    {
        //
        // GET: /Option/

        public ActionResult Index()
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            return PartialView(GetModel());
        }

        public ActionResult RedirectToIndex()
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public ActionResult Save(OptionsModel options)
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            OptionsHelper.SaveOptions(options, this);
            return new EmptyResult();
        }

        [HttpGet]
        public ActionResult GetListNames(String server)
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            var res = PTCore.Instance.GetTransmitionsLists(server).ToList();
            return Json(res, JsonRequestBehavior.AllowGet);
        }

        //[HttpPost]
        //public ActionResult GetConfiguredLists(String deviceServer)
        //{
        //    HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);

        //    var result = new Dictionary<int, string>();
        //    try
        //    {
        //        result = CVCore.Instance.GetConfiguredPlayLists(deviceServer);
        //    }
        //    catch (Exception ex)
        //    {
        //        ServiceLogger.Error(
        //            String.Format(
        //                "Error has occurred while processing GetConfiguredPlayLists method({0}, server: {1})",
        //                this.Request.Url, deviceServer), ex);
        //    }
        //    return Json(new {data = result.ToList()}, JsonRequestBehavior.AllowGet);
        //}

        [HttpPost]
        public ActionResult UpdateServersState(string jsonData)
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            //TODO Need Implementation
            return Json(String.Empty, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetChannelsData()
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            //TODO Need Implementation
            return Json(String.Empty, JsonRequestBehavior.AllowGet);
        }

        public OptionsModel GetModel()
        {
            return OptionsHelper.GetOptions(this);
        }
    }
}
