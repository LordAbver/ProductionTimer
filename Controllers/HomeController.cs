using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using ProductionTimerCore;
using ProductionTimerCore.Models;

namespace ProductionTimer.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            ViewBag.Message = string.Format("{0}::{1} {2}",
                                            RouteData.Values["controller"],
                                            RouteData.Values["action"],
                                            RouteData.Values["id"]);

            return View("Index", GetModel());
        }

        public ActionResult RedirectToIndex()
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            return RedirectToAction("Index", "Home");
        }

        public ActionResult Partial()
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            return PartialView("Index", GetModel());
        }

        private OptionsModel GetModel()
        {
            return OptionsHelper.GetOptions(this);
        }

        [HttpGet]
        public ActionResult GetTimersInfo()
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            var result = PTCore.Instance.GetTimersData(OptionsHelper.GetServerFromCookies(this),
                                                       OptionsHelper.GetListFromCookies(this));

            return Json(result ?? new object(), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEventsInfo(Int32 page)
        {
            HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            var result = PTCore.Instance.GetEventsInfo(OptionsHelper.GetServerFromCookies(this),
                                                       OptionsHelper.GetListFromCookies(this), page);

            return Json(result ?? new object(), JsonRequestBehavior.AllowGet);
        }
    }
}
