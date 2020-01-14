using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Harris.Automation.ADC.Logger;
using ProductionTimerCore;

namespace ProductionTimer
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            //routes.MapRoute(
            //    "RedirectFromHome", // Route name
            //    "Home", // URL with parameters
            //    new { controller = "Home", action = "RedirectToIndex" } // Parameter defaults
            //);

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );

        }

        protected void Application_Start()
        {
            var name = System.IO.Path.GetFileNameWithoutExtension(Assembly.GetExecutingAssembly().CodeBase);

            ServiceLogger.Informational(String.Format("{0} was started, host assembly: {1}", name,
                                               Assembly.GetExecutingAssembly().FullName));

            // Logging of the unhandled exceptions
            AppDomain.CurrentDomain.UnhandledException += CurrentDomainUnhandledException;

            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            PTCore.StartUp(name);
        }

        protected void Application_End()
        {
            PTCore.Terminate();
            ServiceLogger.Informational("Exiting application");
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            var ex = Server.GetLastError();
            CurrentDomainUnhandledException(this, new UnhandledExceptionEventArgs(ex, false));
        }

        /// <summary>
        /// Unhandled exceptions processing
        /// </summary>
        private static void CurrentDomainUnhandledException(Object sender, UnhandledExceptionEventArgs e)
        {
            Exception ex = (Exception)e.ExceptionObject;
            //ServiceLogger.Instance.StoreDataMarkup = true;
            ServiceLogger.Critical("Application raised the unhandled exception: " + ex.Message, ex);
            //ServiceLogger.Instance.StoreDataMarkup = false;
        }
    }
}