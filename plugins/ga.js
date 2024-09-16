/* eslint-disable */

export default ({ app }) => {
  // Replace 'YOUR_TRACKING_ID' with your actual Google Analytics tracking ID
  const trackingId = 'G-HPZKPFM9GK';

  // Create a script tag for the Google Analytics tracking code
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(script);   


  // Define the gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  // Initialize gtag
  gtag('js', new Date());
  gtag('config', trackingId);

  // Track page views
  app.router.afterEach((to) => {
    gtag('config', trackingId, { page_path: to.fullPath });
  });
}